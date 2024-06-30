import { PrismaClient } from '@prisma/client';
import { PostService } from '@services/posts.service';
import { CreatePostDto, UpdatePostDto } from '@dtos/posts.dto';
import { HttpException } from '@exceptions/HttpException';
import { UserService } from '@services/users.service';
import { CreateUserDto } from '@dtos/users.dto';
import { User } from '@/interfaces/users.interface';

describe('PostService', () => {
  let prisma: PrismaClient;
  let postService: PostService;
  let userService: UserService;
  let testUser: User;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
    postService = new PostService();
    userService = new UserService();

    const userData: CreateUserDto = { email: 'testuser2@example.com', password: 'password123', username: 'testuser2' };
    testUser = await userService.createUser(userData);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.post.deleteMany();
  });

  describe('findAllPost', () => {
    it('should return all non-deleted posts with pagination', async () => {
      const postData1: CreatePostDto = { title: 'Post 1', content: 'Content 1', excerpt: 'Excerpt 1' };
      const postData2: CreatePostDto = { title: 'Post 2', content: 'Content 2', excerpt: 'Excerpt 2' };
      await postService.createPost(postData1, testUser.id, 'default1.jpg');
      await postService.createPost(postData2, testUser.id, 'default2.jpg');

      const { allPosts, nextCursor } = await postService.findAllPost({ limit: 10, cursor: null });

      expect(allPosts).toHaveLength(2);
      expect(allPosts[0].title).toBe(postData2.title);
      expect(allPosts[1].title).toBe(postData1.title);
      expect(nextCursor).toBeUndefined();
    });
  });

  describe('findPostById', () => {
    it('should return a post by id', async () => {
      const postData: CreatePostDto = { title: 'Test Post', content: 'Test Content', excerpt: 'Test Excerpt' };
      const createdPost = await postService.createPost(postData, testUser.id, 'default.jpg');

      const foundPost = await postService.findPostById(createdPost.id);

      expect(foundPost).toBeDefined();
      expect(foundPost.title).toBe(postData.title);
    });

    it('should throw an error if post does not exist', async () => {
      await expect(postService.findPostById(999)).rejects.toThrow(HttpException);
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const postData: CreatePostDto = { title: 'New Post', content: 'New Content', excerpt: 'New Excerpt' };

      const post = await postService.createPost(postData, testUser.id, 'default.jpg');

      expect(post).toBeDefined();
      expect(post.title).toBe(postData.title);
      expect(post.content).toBe(postData.content);
      expect(post.excerpt).toBe(postData.excerpt);
      expect(post.authorId).toBe(testUser.id);
      expect(post.thumbnail).toBe('default.jpg');
    });
  });

  describe('updatePost', () => {
    it('should update an existing post', async () => {
      const postData: CreatePostDto = { title: 'Original Post', content: 'Original Content', excerpt: 'Original Excerpt' };
      const createdPost = await postService.createPost(postData, testUser.id, 'default.jpg');

      const updateData: UpdatePostDto = {
        title: 'Updated Post',
        content: 'Updated Content',
        excerpt: 'Updated Excerpt',
      };
      const newThumbnail = 'new_thumbnail.jpg';
      const updatedPost = await postService.updatePost(createdPost.id, updateData, newThumbnail);

      expect(updatedPost.title).toBe(updateData.title);
      expect(updatedPost.content).toBe(updateData.content);
      expect(updatedPost.excerpt).toBe(updateData.excerpt);
      expect(updatedPost.thumbnail).toBe(newThumbnail);
    });

    it('should throw an error if post does not exist', async () => {
      const updateData: UpdatePostDto = { title: 'Updated Post' };
      await expect(postService.updatePost(999, updateData)).rejects.toThrow(HttpException);
    });
  });

  describe('deletePost', () => {
    it('should soft delete an existing post', async () => {
      const postData: CreatePostDto = { title: 'Test Post', content: 'Test Content', excerpt: 'Test Excerpt' };
      const createdPost = await postService.createPost(postData, testUser.id, 'default.jpg');

      const deletedPost = await postService.deletePost(createdPost.id);

      expect(deletedPost.id).toBe(createdPost.id);
      expect((deletedPost as any).deletedAt).toBeDefined();
      expect((deletedPost as any).deletedAt).toBeInstanceOf(Date);

      const { allPosts } = await postService.findAllPost({ limit: 10, cursor: null });
      expect(allPosts.find(post => post.id === createdPost.id)).toBeUndefined();
    });

    it('should throw an error if post does not exist', async () => {
      await expect(postService.deletePost(999)).rejects.toThrow(HttpException);
    });
  });
});
