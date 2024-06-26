import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { HttpException } from '@/exceptions/HttpException';
import { Post } from '@interfaces/posts.interface';
import { CreatePostDto, UpdatePostDto } from '@/dtos/posts.dto';

@Service()
export class PostService {
  public post = new PrismaClient().post;

  public async findAllPost({ limit, cursor }: { limit: number; cursor?: number | null }): Promise<{ allPosts: Post[]; nextCursor: number }> {
    const totalPosts = await this.post.count();
    const allPosts: Post[] = await this.post.findMany({
      take: limit || undefined,
      skip: cursor ? 1 : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        deletedAt: null,
      },
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        author: true,
        comments: true,
      },
    });
    let nextCursor: typeof cursor | undefined = undefined;
    if (allPosts.length >= (limit || undefined)) {
      const lastPostInResult = allPosts.at(-1);
      nextCursor = lastPostInResult?.id;
    }
    if (nextCursor >= totalPosts) {
      nextCursor = undefined;
    }

    return { allPosts, nextCursor };
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
    const softDeletedPost: Post = await this.post.update({
      where: { id: postId },
      data: {
        deletedAt: new Date(),
      },
      include: {
        author: true,
        comments: true,
      },
    });
    return softDeletedPost;
  }
}
