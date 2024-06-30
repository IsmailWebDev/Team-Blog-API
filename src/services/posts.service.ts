import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { HttpException } from '@/exceptions/HttpException';
import { Post } from '@interfaces/posts.interface';
import { CreatePostDto, UpdatePostDto } from '@/dtos/posts.dto';

@Service()
export class PostService {
  public post = new PrismaClient({
    omit: {
      user: {
        password: true,
      },
    },
  }).post;

  public async findAllPost({ limit, cursor }: { limit: number; cursor?: number | null }): Promise<{ allPosts: Post[]; nextCursor: number }> {
    const totalPosts = await this.post.count();
    const latestPostId = await this.post.findFirst({
      orderBy: {
        createdAt: 'asc',
      },
      where: {
        deletedAt: null,
        author: {
          deletedAt: null,
        },
      },
    });
    const allPosts: Post[] = await this.post.findMany({
      take: limit || undefined,
      skip: cursor ? 1 : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        deletedAt: null,
        author: {
          deletedAt: null,
        },
      },
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        authorId: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
        author: true,
        comments: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
    let nextCursor: typeof cursor | undefined = undefined;
    if (allPosts.length >= (limit || undefined)) {
      const lastPostInResult = allPosts.at(-1);
      nextCursor = lastPostInResult?.id;
    }
    if (nextCursor >= totalPosts || nextCursor === latestPostId?.id) {
      nextCursor = undefined;
    }
    return { allPosts, nextCursor };
  }

  public async findPostById(postId: number): Promise<Post> {
    const findPost: Post = await this.post.findUnique({
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        authorId: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
        author: true,
        comments: {
          where: {
            deletedAt: null,
          },
        },
      },
      where: {
        id: postId,
        deletedAt: null,
        author: {
          deletedAt: null,
        },
      },
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
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        authorId: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
        author: true,
        comments: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
    return createdPost;
  }

  public async updatePost(postId: number, postData: UpdatePostDto, thumbnail?: string): Promise<Post> {
    const findPost = await this.post.findUnique({ where: { id: postId } });
    if (!findPost) throw new HttpException(409, "Post doesn't exist");

    const updatedPost: Post = await this.post.update({
      where: { id: postId },
      data: {
        ...postData,
        thumbnail: thumbnail,
      },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        authorId: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
        author: true,
        comments: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
    return updatedPost;
  }

  public async deletePost(postId: number): Promise<Post> {
    const findPost = await this.post.findUnique({ where: { id: postId } });
    if (!findPost) throw new HttpException(409, "Post doesn't exist");

    const softDeletedPost: Post = await this.post.update({
      where: { id: postId },
      data: {
        deletedAt: new Date(),
      },
      select: {
        id: true,
        deletedAt: true,
        title: true,
        content: true,
        excerpt: true,
        authorId: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
        author: true,
        comments: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
    return softDeletedPost;
  }
}
