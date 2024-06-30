import { User } from '@interfaces/users.interface';
import { Comment } from '@interfaces/comments.interface';

export interface Post {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: User;
  authorId: number;
  thumbnail: string;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
  deletedAt?: Date;
}
