export interface User {
  id: number;
  email: string;
  password?: string;
  username: string;
  bio?: string;
  profilePic?: string;
  isAdmin: boolean;
  deletedAt?: Date;
}
