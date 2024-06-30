import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { HttpException } from '@/exceptions/HttpException';
import { Comment } from '@interfaces/comments.interface';
import { CreateCommentDto, UpdateCommentDto } from '@/dtos/comments.dto';

@Service()
export class CommentService {
  public comment = new PrismaClient().comment;

  public async findAllComment(): Promise<Comment[]> {
    const allComments: Comment[] = await this.comment.findMany({
      where: {
        deletedAt: null,
      },
    });
    return allComments;
  }

  public async findCommentById(commentId: number): Promise<Comment[]> {
    const findComment: Comment[] = await this.comment.findMany({
      where: { postId: commentId, deletedAt: null },
      orderBy: {
        id: 'asc',
      },
    });
    if (!findComment) throw new HttpException(404, "Comment doesn't exist");

    return findComment;
  }

  public async createComment(commentData: CreateCommentDto, commenterId: number): Promise<Comment> {
    const createdComment: Comment = await this.comment.create({ data: { ...commentData, commenterId } });
    return createdComment;
  }

  public async updateComment(commentId: number, commentData: UpdateCommentDto): Promise<Comment> {
    const findComment = await this.comment.findUnique({ where: { id: commentId } });
    if (!findComment) throw new HttpException(409, "Comment doesn't exist");

    const updatedComment: Comment = await this.comment.update({ where: { id: commentId }, data: commentData });
    return updatedComment;
  }

  public async deleteComment(commentId: number): Promise<Comment> {
    const findComment = await this.comment.findUnique({ where: { id: commentId } });
    if (!findComment) throw new HttpException(409, "Comment doesn't exist");

    const softDeletedComment: Comment = await this.comment.update({
      where: { id: commentId },
      data: {
        deletedAt: new Date(),
      },
    });
    return softDeletedComment;
  }
}
