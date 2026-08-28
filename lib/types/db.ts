// lib/types/db.ts
// Типы описывают РЕАЛЬНУЮ схему Supabase, в которую пишет 1С-робот
// (C:\1c_robot\robot_upload_reports.py) и из которой читает портал.

/** Показатель, по которому строится рейтинг. */
export type Metric = 'val' | 'retail_sales' | 'hours';

/** Роль сотрудника в портале. Вычисляется из employees.position. */
export type RoleKey = 'master' | 'admin' | 'manager' | 'director';

export type Salon = {
  id: string;
  name: string | null;
};

export type Employee = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string | null;
  login: string | null;
  position: string | null;
  role_id: string | null;
  salon_id: string | null;
  start_date: string | null;
  hired_at: string | null;
  is_active: boolean;
};

/** Строка показателей сотрудника за календарный месяц. */
export type MonthlyStat = {
  employee_id: string;
  salon_id: string | null;
  year: number;
  month: number;
  /** Вал по услугам, руб. */
  val: number | null;
  /** Продажи витрины, руб. */
  retail_sales: number | null;
  /** Отработанные часы. */
  hours: number | null;
  /** Дата отчёта 1С, из которого пришли данные. */
  report_date: string | null;
};

export type MotivationBlock = {
  id: string;
  code: string | null;
  title: string;
  subtitle: string | null;
  body: string;
  sort_order: number;
};

/** Сотрудник + его показатели за месяц — базовая строка любого рейтинга. */
export type EmployeeWithStats = {
  employee_id: string;
  full_name: string;
  position: string | null;
  salon_id: string | null;
  salon_name: string | null;
  val: number;
  retail_sales: number;
  hours: number;
  /** true, если по сотруднику есть строка в employee_monthly_stats за период. */
  has_data: boolean;
};

export type SalonSummary = {
  salon_id: string;
  salon_name: string | null;
  val: number;
  retail_sales: number;
  hours: number;
  /** Сколько сотрудников попало в отчёт за период. */
  employees_count: number;
};

export type Period = {
  year: number;
  month: number;
  /** Например «август 2026». */
  label: string;
};
