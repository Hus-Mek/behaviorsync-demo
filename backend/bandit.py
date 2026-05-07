"""
Thompson Sampling with Beta-Bernoulli posteriors — community of bandits pattern.

Three independent bandits: message framework, send-time slot, send-day.
Priors: Beta(2, 18) calibrated for ~10% real-world health messaging engagement.
Dosage tracking, reward deduplication, and audit logging included.
"""
import random
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from typing import Optional

AST = timezone(timedelta(hours=3))

TIME_SLOTS = {
    "morning":   (9, 12),
    "afternoon": (12, 15),
    "evening":   (15, 18),
    "night":     (18, 20),
}

SAUDI_WORKDAYS = {6: "Sun", 0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu"}


@dataclass
class BanditArm:
    name: str
    alpha: float = 2.0
    beta: float = 18.0
    pulls: int = 0

    @property
    def mean(self) -> float:
        return self.alpha / (self.alpha + self.beta)

    @property
    def ci_lower(self) -> float:
        from scipy import stats
        return stats.beta.ppf(0.025, self.alpha, self.beta)

    @property
    def ci_upper(self) -> float:
        from scipy import stats
        return stats.beta.ppf(0.975, self.alpha, self.beta)

    def sample(self) -> float:
        return random.betavariate(self.alpha, self.beta)

    def update(self, reward: float) -> None:
        r = round(reward)
        self.alpha += r
        self.beta += 1 - r
        self.pulls += 1

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "alpha": round(self.alpha, 2),
            "beta": round(self.beta, 2),
            "pulls": self.pulls,
            "mean": round(self.mean, 4),
            "ci_95": [round(self.ci_lower, 4), round(self.ci_upper, 4)],
        }


@dataclass
class ThompsonBandit:
    arms: dict[str, BanditArm] = field(default_factory=dict)
    min_prob: float = 0.10
    max_prob: float = 0.80
    exploration_pulls: int = 20

    def add_arm(self, name: str, alpha: float = 2.0, beta: float = 18.0) -> None:
        self.arms[name] = BanditArm(name=name, alpha=alpha, beta=beta)

    def select(self) -> str:
        total = sum(a.pulls for a in self.arms.values())
        if total < self.exploration_pulls * len(self.arms):
            counts = {n: a.pulls for n, a in self.arms.items()}
            return min(counts, key=counts.get)
        samples = {name: arm.sample() for name, arm in self.arms.items()}
        return max(samples, key=samples.get)

    def update(self, arm_name: str, reward: float) -> Optional[dict]:
        if arm_name not in self.arms:
            return None
        self.arms[arm_name].update(reward)
        return self.arms[arm_name].to_dict()

    def get_state(self) -> list[dict]:
        return [arm.to_dict() for arm in self.arms.values()]


@dataclass
class DosageTracker:
    dosage_lambda: float = 0.95
    suppress_threshold: float = 3.0
    _user_dosage: dict[str, tuple[float, float]] = field(default_factory=dict)

    def record_send(self, phone: str) -> float:
        now = time.time()
        current = self._get(phone, now)
        new_val = current + 1.0
        self._user_dosage[phone] = (new_val, now)
        return new_val

    def should_suppress(self, phone: str) -> bool:
        return self._get(phone, time.time()) >= self.suppress_threshold

    def get_dosage(self, phone: str) -> float:
        return self._get(phone, time.time())

    def _get(self, phone: str, now: float) -> float:
        if phone not in self._user_dosage:
            return 0.0
        prev, prev_t = self._user_dosage[phone]
        days = (now - prev_t) / 86400.0
        return prev * (self.dosage_lambda ** days)


@dataclass
class SelectionLog:
    _log: list[dict] = field(default_factory=list)
    max_entries: int = 10_000

    def record(self, phone: str, arm: str, time_slot: str, day: Optional[str], dosage: float) -> dict:
        entry = {
            "timestamp": datetime.now(AST).isoformat(),
            "phone": phone[-4:].rjust(len(phone), "*"),
            "arm": arm, "time_slot": time_slot,
            "day": day or "weekend", "dosage": round(dosage, 3),
        }
        self._log.append(entry)
        if len(self._log) > self.max_entries:
            self._log = self._log[-self.max_entries:]
        return entry

    def get_recent(self, n: int = 50) -> list[dict]:
        return self._log[-n:]


class BanditSystem:
    """Community of bandits: message framework × time slot × day of week."""

    def __init__(self):
        self.message_bandit = ThompsonBandit()
        for arm in ["Authority Endorsement", "Implementation Intentions",
                     "Loss Aversion", "Simple Reminder", "Opt-Out Pre-Booking"]:
            self.message_bandit.add_arm(arm, alpha=2, beta=18)

        self.time_bandit = ThompsonBandit()
        for slot in TIME_SLOTS:
            self.time_bandit.add_arm(slot, alpha=2, beta=18)

        self.day_bandit = ThompsonBandit()
        for day_name in SAUDI_WORKDAYS.values():
            self.day_bandit.add_arm(day_name, alpha=2, beta=18)

        self.dosage = DosageTracker()
        self.log = SelectionLog()
        self._rewarded: dict[tuple[str, str], dict] = {}

    def select(self, phone: str) -> dict:
        phone_clean = phone.lstrip("+")
        dosage = self.dosage.get_dosage(phone_clean)
        suppressed = self.dosage.should_suppress(phone_clean)
        arm = self.message_bandit.select()
        time_slot = self.time_bandit.select()
        day = self.day_bandit.select()
        self.log.record(phone_clean, arm, time_slot, day, dosage)
        return {
            "arm": arm, "time_slot": time_slot,
            "time_slot_hours": TIME_SLOTS[time_slot],
            "day": day, "dosage": round(dosage, 3), "suppressed": suppressed,
        }

    def record_send(self, phone: str) -> float:
        return self.dosage.record_send(phone.lstrip("+"))

    def reward(self, phone: str, arm_name: str, reward: float, source: str,
               time_slot: Optional[str] = None, day: Optional[str] = None) -> dict:
        phone_clean = phone.lstrip("+").replace("whatsapp:", "")
        key = (phone_clean, arm_name)
        if key in self._rewarded:
            return {"applied": False, "duplicate": True, "prior": self._rewarded[key]}
        record = {"source": source, "timestamp": datetime.now(AST).isoformat(), "reward": reward}
        self._rewarded[key] = record
        arm_state = self.message_bandit.update(arm_name, reward)
        result = {"applied": True, "arm_state": arm_state}
        if time_slot and time_slot in self.time_bandit.arms:
            self.time_bandit.update(time_slot, reward)
        if day and day in self.day_bandit.arms:
            self.day_bandit.update(day, reward)
        return result

    def get_state(self) -> dict:
        return {
            "message_arms": self.message_bandit.get_state(),
            "time_arms": self.time_bandit.get_state(),
            "day_arms": self.day_bandit.get_state(),
            "total_pulls": sum(a.pulls for a in self.message_bandit.arms.values()),
            "recent_log": self.log.get_recent(10),
        }


_system = BanditSystem()


def get_bandit() -> ThompsonBandit:
    return _system.message_bandit


def get_bandit_system() -> BanditSystem:
    return _system
