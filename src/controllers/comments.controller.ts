import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { Comment } from '@/interfaces/comments.interface';
import { CommentService } from '@services/comments.service';
import { RequestWithUser } from '@/interfaces/auth.interface';

export class CommentController {
  public comment = Container.get(CommentService);

  public getComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllCommentsData: Comment[] = await this.comment.findAllComment();

      res.status(200).json({ data: findAllCommentsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getCommentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const commentId = Number(req.params.id);
      const findOneCommentData: Comment = await this.comment.findCommentById(commentId);

      res.status(200).json({ data: findOneCommentData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createComment = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const commentData: Comment = req.body;
      const commenterId = req.user.id;

      const createCommentData: Comment = await this.comment.createComment(commentData, commenterId);

      res.status(201).json({ data: createCommentData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const commentId = Number(req.params.id);
      const commentData: Comment = req.body;
      const updateCommentData: Comment = await this.comment.updateComment(commentId, commentData);

      res.status(200).json({ data: updateCommentData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const commentId = Number(req.params.id);
      const deleteCommentData: Comment = await this.comment.deleteComment(commentId);

      res.status(200).json({ data: deleteCommentData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
