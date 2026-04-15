export type Department = {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
};

export type Room = {
  id: string;
  name: string;
};

export type Schedule = {
  id: string;
  room_id: string;
  day_of_week: string;
  period_number: number;
  department_id: string | null;
  course: string | null;
  branch: string | null;
  section: string | null;
  subsection: string | null;
  professor_name: string | null;
  departments?: { id: string; name: string } | null;
};

export const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] as const;
export const PERIODS = [1,2,3,4,5,6,7,8] as const;
export type Day = typeof DAYS[number];
