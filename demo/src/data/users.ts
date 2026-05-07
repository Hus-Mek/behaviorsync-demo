export interface UserProfile {
  id: string;
  name_ar: string;
  name_en: string;
  age: number;
  gender: 'male' | 'female';
  region: string;
  region_ar: string;
  bmi: number;
  waist_cm: number;
  family_diabetes: boolean;
  hyperglycemia_history: boolean;
  logins_90d: number;
  articles_read: number;
  screening_views: number;
  booking_attempts: number;
  screenings_completed: number;
  last_screening_date: string | null;
  last_login_days_ago: number;
  clinic_name: string;
  clinic_name_ar: string;
  income_tier: 'low' | 'medium' | 'high';
  language: string;
  physical_activity: 'sedentary' | 'low' | 'moderate' | 'active';
  health_literacy: 'low' | 'moderate' | 'high';
}

export const sampleUsers: UserProfile[] = [
  {
    id: 'u1',
    name_ar: 'أحمد القحطاني',
    name_en: 'Ahmad Al-Qahtani',
    age: 45,
    gender: 'male',
    region: 'Riyadh',
    region_ar: 'الرياض',
    bmi: 33,
    waist_cm: 105,
    family_diabetes: true,
    hyperglycemia_history: false,
    logins_90d: 2,
    articles_read: 0,
    screening_views: 0,
    booking_attempts: 0,
    screenings_completed: 0,
    last_screening_date: null,
    last_login_days_ago: 45,
    clinic_name: 'Al-Suwaidi PHC',
    clinic_name_ar: 'مركز السويدي الصحي',
    income_tier: 'medium',
    language: 'ar',
    physical_activity: 'sedentary',
    health_literacy: 'low',
  },
  {
    id: 'u2',
    name_ar: 'فاطمة الحربي',
    name_en: 'Fatimah Al-Harbi',
    age: 52,
    gender: 'female',
    region: 'Jeddah',
    region_ar: 'جدة',
    bmi: 28,
    waist_cm: 85,
    family_diabetes: false,
    hyperglycemia_history: false,
    logins_90d: 12,
    articles_read: 5,
    screening_views: 3,
    booking_attempts: 0,
    screenings_completed: 0,
    last_screening_date: null,
    last_login_days_ago: 5,
    clinic_name: 'King Faisal Residential Clinic',
    clinic_name_ar: 'عيادة الملك فيصل السكنية',
    income_tier: 'medium',
    language: 'ar',
    physical_activity: 'low',
    health_literacy: 'moderate',
  },
  {
    id: 'u3',
    name_ar: 'خالد العتيبي',
    name_en: 'Khalid Al-Otaibi',
    age: 38,
    gender: 'male',
    region: 'Dammam',
    region_ar: 'الدمام',
    bmi: 31,
    waist_cm: 100,
    family_diabetes: true,
    hyperglycemia_history: true,
    logins_90d: 8,
    articles_read: 2,
    screening_views: 4,
    booking_attempts: 2,
    screenings_completed: 0,
    last_screening_date: null,
    last_login_days_ago: 3,
    clinic_name: 'Dammam Central PHC',
    clinic_name_ar: 'مركز الدمام المركزي الصحي',
    income_tier: 'high',
    language: 'ar',
    physical_activity: 'sedentary',
    health_literacy: 'moderate',
  },
  {
    id: 'u4',
    name_ar: 'نورة الغامدي',
    name_en: 'Noura Al-Ghamdi',
    age: 41,
    gender: 'female',
    region: 'Medina',
    region_ar: 'المدينة المنورة',
    bmi: 26,
    waist_cm: 78,
    family_diabetes: false,
    hyperglycemia_history: true,
    logins_90d: 18,
    articles_read: 8,
    screening_views: 6,
    booking_attempts: 1,
    screenings_completed: 1,
    last_screening_date: '2026-02-15',
    last_login_days_ago: 1,
    clinic_name: 'Uhud PHC',
    clinic_name_ar: 'مركز أحد الصحي',
    income_tier: 'medium',
    language: 'ar',
    physical_activity: 'moderate',
    health_literacy: 'high',
  },
];

export const segments = [
  { id: 's1', name: 'High risk, low engagement', name_ar: 'خطر عالي، تفاعل منخفض', count: 12847, rules: 'age ≥ 40 AND BMI ≥ 30 AND HES < 30' },
  { id: 's2', name: 'Family history, never screened', name_ar: 'تاريخ عائلي، لم يُفحص', count: 8392, rules: 'family_diabetes = true AND screenings = 0' },
  { id: 's3', name: 'Abandoned booking', name_ar: 'حجز متروك', count: 3219, rules: 'booking_attempts ≥ 1 AND screenings = 0' },
];
