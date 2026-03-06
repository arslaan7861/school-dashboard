export type Session = {
  id: number;
  name: string;
  startDate: string; // Changed from start_date
  endDate: string; // Changed from end_date
  isActive: boolean; // Changed from is_active
  createdAt?: string;
  updatedAt?: string;
};
