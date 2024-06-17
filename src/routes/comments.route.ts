import { Router } from 'express';
import { CommentController } from '@/controllers/comments.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

export class CommentRoute implements Routes {
  public path = '/comments';
  public router = Router();
  public comment = new CommentController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}`, this.comment.getComments);
    this.router.get(`${this.path}/:id(\\d+)`, this.comment.getCommentById);
    this.router.post(`${this.path}`, AuthMiddleware(), this.comment.createComment);
    this.router.patch(`${this.path}/:id(\\d+)`, AuthMiddleware('ownComment'), this.comment.updateComment);
    this.router.delete(`${this.path}/:id(\\d+)`, AuthMiddleware('ownComment'), this.comment.deleteComment);
  }
}
