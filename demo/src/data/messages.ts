export interface MessageTemplate {
  id: string;
  framework: string;
  technique: string;
  ttm_stage: string;
  comb_target: string;
  content_ar: string;
  content_en: string;
  channel: 'whatsapp' | 'sms' | 'push' | 'email';
  osman_score: number;
  arabic_ratio: number;
  char_count: number;
}

export const messageTemplates: MessageTemplate[] = [
  // Precontemplation — Authority Endorsement
  {
    id: 'm1',
    framework: 'Authority Endorsement',
    technique: 'MOH recommendation + family duty',
    ttm_stage: 'Precontemplation',
    comb_target: 'Motivation-Reflective',
    content_ar: 'مرحباً {{name}}، تم حجز موعد فحص السكري لك في {{clinic}}. توصي وزارة الصحة بالفحص لجميع البالغين فوق 35. صحتك مسؤولية عائلتك. الفحص مجاني — 15 دقيقة فقط.',
    content_en: '{{name}}, your diabetes screening at {{clinic}} has been reserved. MOH recommends screening for all adults 35+. Your health is your family\'s responsibility. Free — just 15 minutes.',
    channel: 'whatsapp',
    osman_score: 72,
    arabic_ratio: 0.96,
    char_count: 142,
  },
  // Precontemplation — Loss Aversion
  {
    id: 'm2',
    framework: 'Loss Aversion',
    technique: 'Loss frame + detection urgency',
    ttm_stage: 'Precontemplation',
    comb_target: 'Motivation-Reflective',
    content_ar: '{{name}}، السكري غير المكتشف يضر بالكلى والعينين والقلب بصمت. الكشف المبكر يحمي صحتك وصحة عائلتك. افحص مجاناً: {{link}}',
    content_en: '{{name}}, undetected diabetes silently damages kidneys, eyes, and heart. Early detection protects you and your family. Screen free: {{link}}',
    channel: 'whatsapp',
    osman_score: 65,
    arabic_ratio: 0.94,
    char_count: 156,
  },
  // Contemplation — COM-B Education
  {
    id: 'm3',
    framework: 'Education (COM-B)',
    technique: 'Knowledge building + fear reduction',
    ttm_stage: 'Contemplation',
    comb_target: 'Capability',
    content_ar: '{{name}}، فحص السكري عبارة عن تحليل دم بسيط يستغرق 15 دقيقة. لا يوجد ألم. النتائج تظهر خلال يومين. المركز الأقرب لك: {{clinic}}.',
    content_en: '{{name}}, a diabetes screening is a simple blood test — 15 minutes, no pain. Results in 2 days. Your nearest center: {{clinic}}.',
    channel: 'whatsapp',
    osman_score: 74,
    arabic_ratio: 0.95,
    char_count: 148,
  },
  // Preparation — Implementation Intentions
  {
    id: 'm4',
    framework: 'Implementation Intentions',
    technique: 'If-then plan + specific slot',
    ttm_stage: 'Preparation',
    comb_target: 'Motivation-Reflective',
    content_ar: '{{name}}، بدأت حجز فحصك في {{clinic}}. موعدك يوم {{date}} الساعة {{time}} لا يزال متاحاً. اضغط لتأكيد حجزك.',
    content_en: '{{name}}, you started booking at {{clinic}}. Your slot on {{date}} at {{time}} is still available. Tap to confirm.',
    channel: 'whatsapp',
    osman_score: 78,
    arabic_ratio: 0.93,
    char_count: 130,
  },
  // Action — Commitment Device
  {
    id: 'm5',
    framework: 'Commitment Device',
    technique: 'Confirmation + social commitment',
    ttm_stage: 'Action',
    comb_target: 'Motivation-Automatic',
    content_ar: '{{name}}، موعد فحصك غداً في {{clinic}} الساعة {{time}}. تذكر: أنت تستثمر في صحتك وصحة عائلتك. نراك هناك!',
    content_en: '{{name}}, your screening is tomorrow at {{clinic}} at {{time}}. Remember: you\'re investing in your health and your family\'s. See you there!',
    channel: 'whatsapp',
    osman_score: 76,
    arabic_ratio: 0.95,
    char_count: 118,
  },
  // Maintenance — Identity Norms
  {
    id: 'm6',
    framework: 'Identity Norms',
    technique: 'Identity reinforcement + auto-rebook',
    ttm_stage: 'Maintenance',
    comb_target: 'Motivation-Reflective',
    content_ar: '{{name}}، مضى عام على فحصك الأخير. كشخص يهتم بصحته، حان وقت الفحص السنوي. احجز في {{clinic}}: {{link}}',
    content_en: '{{name}}, it\'s been a year since your last screening. As someone who takes health seriously, it\'s time for your annual check. Book at {{clinic}}: {{link}}',
    channel: 'whatsapp',
    osman_score: 70,
    arabic_ratio: 0.94,
    char_count: 136,
  },
  // SMS variants (70 char Arabic limit)
  {
    id: 'm7',
    framework: 'Authority Endorsement',
    technique: 'Authority endorsement (SMS)',
    ttm_stage: 'Precontemplation',
    comb_target: 'Motivation-Reflective',
    content_ar: '{{name}}، موعد فحص السكري محجوز لك في {{clinic}}. احمِ عائلتك. للإلغاء: {{link}}',
    content_en: '{{name}}, your screening at {{clinic}} is reserved. Protect your family. Cancel: {{link}}',
    channel: 'sms',
    osman_score: 68,
    arabic_ratio: 0.92,
    char_count: 67,
  },
  // Email variant (rich HTML, longer copy, embedded booking link)
  {
    id: 'm9_email',
    framework: 'Authority Endorsement',
    technique: 'MOH authority + screening details + embedded booking',
    ttm_stage: 'Precontemplation',
    comb_target: 'Capability',
    content_ar: '{{name}}، تم حجز موعد فحص السكري لك في {{clinic}}. وزارة الصحة توصي بالفحص لجميع البالغين فوق 35 عاماً. الفحص مجاني ويستغرق 15 دقيقة فقط — تحليل دم بسيط بدون ألم. النتائج خلال يومين. صحتك مسؤولية عائلتك. للإلغاء أو تغيير الموعد، اضغط على الرابط أدناه.',
    content_en: '{{name}}, your diabetes screening at {{clinic}} has been reserved. MOH recommends screening for all adults 35+. The test is free, takes 15 minutes — a simple blood draw with no pain. Results in 2 days. Your health is your family\'s responsibility. To cancel or reschedule, click the link below.',
    channel: 'email',
    osman_score: 68,
    arabic_ratio: 0.94,
    char_count: 285,
  },
  // Social Norms variant
  {
    id: 'm10_norms',
    framework: 'Social Norms',
    technique: 'Descriptive peer norm + regional data',
    ttm_stage: 'Contemplation',
    comb_target: 'Motivation-Reflective',
    content_ar: '{{name}}، أكثر من 8 من كل 10 أشخاص في منطقتك فوق 40 قد أجروا فحص السكري هذا العام. انضم إليهم — الفحص مجاني في {{clinic}}.',
    content_en: '{{name}}, 8 out of 10 people in your area over 40 have been screened this year. Join them — free at {{clinic}}.',
    channel: 'whatsapp',
    osman_score: 74,
    arabic_ratio: 0.95,
    char_count: 135,
  },
  // Push variant
  {
    id: 'm8',
    framework: 'EAST (Timely)',
    technique: 'Timely nudge (Push)',
    ttm_stage: 'Preparation',
    comb_target: 'Opportunity-Physical',
    content_ar: 'فحص السكري المجاني متاح — 15 دقيقة في {{clinic}}',
    content_en: 'Free diabetes screening available — 15 min at {{clinic}}',
    channel: 'push',
    osman_score: 80,
    arabic_ratio: 0.95,
    char_count: 48,
  },
];

export const analyticsData = {
  sent: 14892,
  delivered: 14341,
  read: 9801,
  clicked: 2154,
  booked: 1192,
  deliveryRate: 96.3,
  readRate: 68.4,
  clickRate: 15.0,
  bookingRate: 8.0,
  nnt: 12.5,
  costPerBooking: 4.10,
  frameworkPerformance: [
    { name: 'Opt-Out Pre-Booking', rate: 26.8, color: '#8b5cf6' },
    { name: 'Implementation Intentions', rate: 22.4, color: '#10b981' },
    { name: 'Authority Endorsement', rate: 18.1, color: '#06b6d4' },
    { name: 'Loss Aversion', rate: 15.6, color: '#f59e0b' },
    { name: 'Simple Reminder (control)', rate: 12.3, color: '#6b7280' },
  ],
  segmentPerformance: [
    { name: 'Preparation (abandoned booking)', rate: 31.2, color: '#10b981' },
    { name: 'Contemplation (viewed info)', rate: 14.7, color: '#06b6d4' },
    { name: 'High risk, low engagement', rate: 8.9, color: '#f59e0b' },
    { name: 'Precontemplation (cold)', rate: 3.1, color: '#8b5cf6' },
  ],
  banditArms: [
    { name: 'Opt-Out Pre-Booking', alpha: 10, beta: 7, pulls: 1800 },
    { name: 'Impl. Intentions', alpha: 60, beta: 40, pulls: 3200 },
    { name: 'Authority Endorsement', alpha: 45, beta: 55, pulls: 2800 },
    { name: 'Loss Aversion', alpha: 38, beta: 62, pulls: 2400 },
    { name: 'Simple Reminder', alpha: 30, beta: 70, pulls: 2100 },
  ],
};
