import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { Post } from '@/interfaces/posts.interface';
import { PostService } from '@services/posts.service';
import { RequestWithUser } from '@/interfaces/auth.interface';

export class PostController {
  public post = Container.get(PostService);

  public getPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit, cursor } = req.query;
      const findAllPostsData: { allPosts: Post[]; nextCursor: number } = await this.post.findAllPost({
        limit: Number(limit),
        cursor: Number(cursor),
      });

      res.status(200).json({ data: findAllPostsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getPostById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const postId = Number(req.params.id);
      const findOnePostData: Post = await this.post.findPostById(postId);

      res.status(200).json({ data: findOnePostData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createPost = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const postData: Post = req.body;
      const authorId = req.user.id;
      const thumbnail = req.file?.filename;
      const createPostData: Post = await this.post.createPost(postData, authorId, thumbnail);

      res.status(201).json({ data: createPostData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updatePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const postId = Number(req.params.id);
      const postData: Post = req.body;
      const thumbnail = req.file?.filename;
      const updatePostData: Post = await this.post.updatePost(postId, postData, thumbnail);

      res.status(200).json({ data: updatePostData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const postId = Number(req.params.id);
      const deletePostData: Post = await this.post.deletePost(postId);

      res.status(200).json({ data: deletePostData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
