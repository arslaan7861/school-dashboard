export type Admin = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean; // Changed from is_active
  profilePic?: string | null;
};
