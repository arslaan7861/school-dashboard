export type Session = {
  id: number;
  name: string;
  start_date: string; // ISO
  end_date: string; // ISO
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
};
