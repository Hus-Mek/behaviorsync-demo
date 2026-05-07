"""
Thompson Sampling with Beta-Bernoulli posteriors.
Factored action space: 5 message design dimensions, each a binary factor.
In-memory state for demo — production would use PostgreSQL.
"""
import random
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class BanditArm:
    name: str
    alpha: float = 1.0
    beta: float = 1.0
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
        self.alpha += reward
        self.beta += 1 - reward
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
    dosage_lambda: float = 0.95

    def add_arm(self, name: str, alpha: float = 1.0, beta: float = 1.0) -> None:
        self.arms[name] = BanditArm(name=name, alpha=alpha, beta=beta)

    def select(self) -> str:
        samples = {name: arm.sample() for name, arm in self.arms.items()}
        return max(samples, key=samples.get)

    def update(self, arm_name: str, reward: float) -> Optional[dict]:
        if arm_name not in self.arms:
            return None
        self.arms[arm_name].update(reward)
        return self.arms[arm_name].to_dict()

    def get_state(self) -> list[dict]:
        return [arm.to_dict() for arm in self.arms.values()]


# Phase 0: simple multi-arm Thompson Sampling with 5 independent arms.
# Phase 1 extends to factored action space (message_frame x send_time x channel)
# using contextual features from SADRISC segments. See RESEARCH.md for full design.
_bandit = ThompsonBandit()
# Priors calibrated from literature (alpha+beta=20 for faster learning):
# - Authority Endorsement: Saudi Sehatty nudge study 19-21% booking (Alhazmi et al. 2023, n=7,547)
# - Implementation Intentions: Gollwitzer & Sheeran 2006 meta-analysis d=0.65 (94 studies)
# - Loss Aversion: Gallagher & Updegraff 2012 meta-analysis; Saudi data 18.4% booking
# - Simple Reminder: SMS meta-analysis OR=1.48 (Gurol-Urganci et al.)
# - Opt-Out Pre-Booking: Chapman et al. 2023 PMC9878580; 27% vs 18% vaccination uptake
_bandit.add_arm("Authority Endorsement", alpha=9, beta=11)
_bandit.add_arm("Implementation Intentions", alpha=12, beta=8)
_bandit.add_arm("Loss Aversion", alpha=7.6, beta=12.4)
_bandit.add_arm("Simple Reminder", alpha=6, beta=14)
_bandit.add_arm("Opt-Out Pre-Booking", alpha=10, beta=7)


def get_bandit() -> ThompsonBandit:
    return _bandit
