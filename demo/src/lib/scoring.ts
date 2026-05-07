import type { UserProfile } from '../data/users';

// === SADRISC Risk Score (Saudi-validated, PMC7378422) ===
export function computeSADRISC(user: UserProfile): { score: number; risk: string; breakdown: Record<string, number> } {
  const sex = user.gender === 'male' ? 2 : 0;

  let age = 0;
  if (user.age < 35) age = 0;
  else if (user.age <= 44) age = 3;
  else if (user.age <= 54) age = 4;
  else if (user.age <= 64) age = 5;
  else age = 6;

  let waist = 0;
  if (user.gender === 'male') {
    waist = user.waist_cm < 94 ? 0 : 3;
  } else {
    waist = user.waist_cm < 80 ? 0 : 3;
  }

  const hyperglycemia = user.hyperglycemia_history ? 2 : 0;
  const family = user.family_diabetes ? 2 : 0;

  const score = sex + age + waist + hyperglycemia + family;
  const risk = score >= 6 ? 'High' : score >= 5 ? 'Elevated' : 'Low';

  return {
    score,
    risk,
    breakdown: { sex, age, waist, hyperglycemia, family },
  };
}

// === Health Engagement Score (0-100) ===
export function computeHES(user: UserProfile): { score: number; level: string; components: Record<string, number> } {
  const lambda = Math.LN2 / 14;

  const loginScore = Math.min(100, (user.logins_90d / 20) * 100);
  const featureScore = Math.min(100, ((user.articles_read + user.screening_views) / 8) * 100);
  const contentScore = Math.min(100, (user.articles_read / 15) * 100);
  const actionScore = Math.min(100, ((user.screenings_completed * 5 + user.booking_attempts * 3) / 3) * 100);

  const recencyDecay = Math.exp(-lambda * user.last_login_days_ago);
  const score = Math.round(
    (0.25 * loginScore + 0.25 * featureScore + 0.25 * contentScore + 0.25 * actionScore) * recencyDecay
  );

  let level = 'Dormant';
  if (score > 75) level = 'Champion';
  else if (score > 55) level = 'Active';
  else if (score > 35) level = 'Moderate';
  else if (score > 15) level = 'Low';

  return { score, level, components: { loginScore: Math.round(loginScore), featureScore: Math.round(featureScore), contentScore: Math.round(contentScore), actionScore: Math.round(actionScore) } };
}

// === TTM Stage Classification ===
export type TTMStage = 'Precontemplation' | 'Contemplation' | 'Preparation' | 'Action' | 'Maintenance';

export function classifyTTM(user: UserProfile): { stage: TTMStage; reason: string } {
  if (user.screenings_completed >= 2 && computeHES(user).score >= 50) {
    return { stage: 'Maintenance', reason: 'Multiple screenings + sustained engagement' };
  }
  if (user.screenings_completed >= 1 && user.last_screening_date) {
    const daysSince = Math.floor((Date.now() - new Date(user.last_screening_date).getTime()) / 86400000);
    if (daysSince <= 180) return { stage: 'Action', reason: `Screened ${daysSince} days ago` };
  }
  if (user.booking_attempts >= 1) {
    return { stage: 'Preparation', reason: `Started booking ${user.booking_attempts}x but didn't complete` };
  }
  if (user.screening_views >= 1 || user.articles_read >= 2) {
    return { stage: 'Contemplation', reason: `Viewed screening info ${user.screening_views}x, read ${user.articles_read} articles` };
  }
  return { stage: 'Precontemplation', reason: 'No health content views, low engagement' };
}

// === COM-B Barrier Diagnosis ===
export type COMBBarrier = 'Capability' | 'Opportunity-Physical' | 'Motivation-Reflective' | 'Motivation-Automatic';

export function diagnoseCOMB(user: UserProfile, _ttmStage: TTMStage): { barrier: COMBBarrier; reason: string; intervention: string } {
  if (user.articles_read === 0 && user.logins_90d < 3) {
    return {
      barrier: 'Capability',
      reason: 'No articles read, < 3 sessions — may not understand screening',
      intervention: 'Education: what screening involves, why it matters',
    };
  }
  if (user.booking_attempts >= 1 && user.screenings_completed === 0) {
    return {
      barrier: 'Motivation-Automatic',
      reason: 'Started booking but abandoned — anxiety/fear signal',
      intervention: 'Reassurance + social norms ("most people feel relieved after")',
    };
  }
  if (user.screening_views >= 1 && user.booking_attempts === 0) {
    return {
      barrier: 'Motivation-Reflective',
      reason: 'Viewed info but took no action — doesn\'t see personal relevance',
      intervention: 'Loss framing + personalized risk data',
    };
  }
  return {
    barrier: 'Opportunity-Physical',
    reason: 'Default: may face access/time barriers',
    intervention: 'Nearest clinic + flexible scheduling + transport info',
  };
}

// === Framework Selection ===
export interface FrameworkSelection {
  primary: string;
  secondary: string;
  east_overlay: string[];
  reason: string;
}

export function selectFramework(stage: TTMStage, barrier: COMBBarrier): FrameworkSelection {
  switch (stage) {
    case 'Precontemplation':
      return {
        primary: 'Authority Endorsement',
        secondary: 'Family Duty',
        east_overlay: ['Attractive', 'Timely'],
        reason: 'Authority endorsement (MOH recommendation) + family duty framing — peer norms less effective in Saudi collectivist culture (Frontiers 2025)',
      };
    case 'Contemplation':
      if (barrier === 'Motivation-Reflective')
        return { primary: 'Loss Aversion', secondary: 'Social Norms', east_overlay: ['Attractive', 'Social', 'Timely'], reason: 'User considering but unmotivated — tip decisional balance' };
      if (barrier === 'Motivation-Automatic')
        return { primary: 'EAST (Attractive)', secondary: 'Social Norms', east_overlay: ['Easy', 'Attractive'], reason: 'User anxious — reduce fear, reframe as simple' };
      if (barrier === 'Capability')
        return { primary: 'Education (COM-B)', secondary: 'EAST (Easy)', east_overlay: ['Easy', 'Attractive'], reason: 'User lacks understanding — educate about screening process' };
      return { primary: 'EAST (Easy)', secondary: 'Social Norms', east_overlay: ['Easy', 'Social'], reason: 'Address opportunity barrier — simplify access' };
    case 'Preparation':
      return {
        primary: 'Implementation Intentions',
        secondary: 'EAST (Easy) + Nudge Defaults',
        east_overlay: ['Easy', 'Timely'],
        reason: 'User ready to act — convert intention to plan (+23pp in Sheeran & Orbell 2000)',
      };
    case 'Action':
      return {
        primary: 'Commitment Devices',
        secondary: 'EAST (Timely)',
        east_overlay: ['Timely', 'Social'],
        reason: 'User has acted — reinforce, prevent no-show',
      };
    case 'Maintenance':
      return {
        primary: 'Identity Norms',
        secondary: 'Auto-rebook Defaults',
        east_overlay: ['Easy', 'Social', 'Timely'],
        reason: 'Sustain annual screening habit through identity-based framing',
      };
  }
}

// === Composite Priority Score ===
export function computePriority(sadrisc: number, hes: number, propensity: number = 0.5): number {
  const riskNorm = sadrisc / 15;
  const engagementInverse = 1 - hes / 100;
  return Math.round((0.4 * riskNorm + 0.25 * engagementInverse + 0.35 * propensity) * 100);
}
