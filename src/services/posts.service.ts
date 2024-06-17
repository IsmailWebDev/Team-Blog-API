import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { HttpException } from '@/exceptions/HttpException';
import { Post } from '@interfaces/posts.interface';
import { CreatePostDto, UpdatePostDto } from '@/dtos/posts.dto';

@Service()
export class PostService {
  public post = new PrismaClient().post;
  public deletedPost = new PrismaClient().deletedPost;

  public async findAllPost({
    limit,
    cursor,
  }: {
    limit: number;
    cursor?: number | null;
  }): Promise<{ allPosts: Post[]; nextCursor: number; deletedPosts: number }> {
    const totalPosts = await this.post.count();
    let deletedPosts: number;
    const allPosts: Post[] = await this.post.findMany({
      take: limit || undefined,
      skip: cursor ? 1 : undefined,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        author: true,
        comments: true,
      },
    });
    let nextCursor: typeof cursor | undefined = undefined;
    if (allPosts.length >= (limit || undefined)) {
      const lastPostInResult = allPosts.at(-1);
      deletedPosts = await this.deletedPost.count({
        where: {
          postId: {
            lt: lastPostInResult.id,
          },
        },
      });
      nextCursor = lastPostInResult?.id;
    }
    if (nextCursor >= totalPosts) {
      nextCursor = undefined;
    }

    return { allPosts, nextCursor, deletedPosts };
  }

  public async findPostById(postId: number): Promise<Post> {
    const findPost: Post = await this.post.findUnique({
      include: {
        author: true,
        comments: true,
      },
      where: { id: postId },
    });
    if (!findPost) throw new HttpException(404, "Post doesn't exist");

    return findPost;
  }

  public async createPost(postData: CreatePostDto, authorId: number, thumbnail?: string): Promise<Post> {
    const createdPost: Post = await this.post.create({
      data: {
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        thumbnail,
        authorId: authorId,
      },
      include: {
        author: true,
        comments: true,
      },
    });
    return createdPost;
  }

  public async updatePost(postId: number, postData: UpdatePostDto, thumbnail?: string): Promise<Post> {
    const updatedPost: Post = await this.post.update({
      where: { id: postId },
      data: {
        ...postData,
        thumbnail: thumbnail,
      },
      include: {
        author: true,
        comments: true,
      },
    });
    return updatedPost;
  }

  public async deletePost(postId: number): Promise<Post> {
    const deletedPost: Post = await this.post.delete({
      where: { id: postId },
      include: {
        author: true,
        comments: true,
      },
    });
    await this.deletedPost.create({
      data: {
        postId: postId,
      },
    });
    return deletedPost;
  }
}
