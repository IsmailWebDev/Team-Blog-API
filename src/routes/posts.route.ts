import { Router } from 'express';
import { PostController } from '@/controllers/posts.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { ValidationMiddleware } from '@/middlewares/validation.middleware';
import { CreatePostDto, UpdatePostDto } from '@/dtos/posts.dto';
import { upload } from '@/middlewares/upload.middleware';

export class PostRoute implements Routes {
  public path = '/posts';
  public router = Router();
  public post = new PostController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}`, this.post.getPosts);
    this.router.get(`${this.path}/:id(\\d+)`, this.post.getPostById);
    this.router.post(`${this.path}`, upload.single('thumbnail'), ValidationMiddleware(CreatePostDto), AuthMiddleware(), this.post.createPost);
    this.router.patch(
      `${this.path}/:id(\\d+)`,
      upload.single('thumbnail'),
      ValidationMiddleware(UpdatePostDto),
      AuthMiddleware('ownPost'),
      this.post.updatePost,
    );
    this.router.delete(`${this.path}/:id(\\d+)`, AuthMiddleware('ownPost'), this.post.deletePost);
  }
}
