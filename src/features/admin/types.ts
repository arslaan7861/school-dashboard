export type Admin = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  profilePic?: string | null;
};
