export interface User {
  id: number;
  email: string;
  username: string;
  bio?: string;
  profilePic?: string;
  isAdmin: boolean;
}
export interface UserWithPassword {
  id: number;
  password: string;
  email: string;
  username: string;
  bio?: string;
  profilePic?: string;
  isAdmin: boolean;
}
