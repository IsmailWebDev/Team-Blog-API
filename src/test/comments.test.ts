import { PrismaClient } from '@prisma/client';
import { CommentService } from '@services/comments.service';
import { CreateCommentDto, UpdateCommentDto } from '@dtos/comments.dto';
import { HttpException } from '@exceptions/HttpException';
import { UserService } from '@services/users.service';
import { PostService } from '@services/posts.service';
import { CreateUserDto } from '@dtos/users.dto';
import { CreatePostDto } from '@dtos/posts.dto';
import { User } from '@/interfaces/users.interface';
import { Post } from '@/interfaces/posts.interface';

describe('CommentService', () => {
  let prisma: PrismaClient;
  let commentService: CommentService;
  let userService: UserService;
  let postService: PostService;
  let testUser: User;
  let testPost: Post;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
    commentService = new CommentService();
    userService = new UserService();
    postService = new PostService();

    const userData: CreateUserDto = { email: 'testuser4@example.com', password: 'password123', username: 'testuser4' };
    testUser = await userService.createUser(userData);

    const postData: CreatePostDto = { title: 'Test Post', content: 'Test Content', excerpt: 'Test Excerpt' };
    testPost = await postService.createPost(postData, testUser.id, 'default.jpg');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.comment.deleteMany();
  });

  describe('findAllComment', () => {
    it('should return all non-deleted comments', async () => {
      const commentData1: CreateCommentDto = { content: 'Comment 1', postId: testPost.id };
      const commentData2: CreateCommentDto = { content: 'Comment 2', postId: testPost.id };
      await commentService.createComment(commentData1, testUser.id);
      await commentService.createComment(commentData2, testUser.id);

      const comments = await commentService.findAllComment();

      expect(comments).toHaveLength(2);
      expect(comments[0].content).toBe(commentData1.content);
      expect(comments[1].content).toBe(commentData2.content);
    });
  });

  describe('findCommentById', () => {
    it('should return comments for a specific post', async () => {
      const commentData: CreateCommentDto = { content: 'Test Comment', postId: testPost.id };
      await commentService.createComment(commentData, testUser.id);

      const foundComments = await commentService.findCommentById(testPost.id);

      expect(foundComments).toHaveLength(1);
      expect(foundComments[0].content).toBe(commentData.content);
    });

    it('should return an empty array if no comments exist for the post', async () => {
      const foundComments = await commentService.findCommentById(999);

      expect(foundComments).toHaveLength(0);
    });
  });

  describe('createComment', () => {
    it('should create a new comment', async () => {
      const commentData: CreateCommentDto = { content: 'New Comment', postId: testPost.id };

      const comment = await commentService.createComment(commentData, testUser.id);

      expect(comment).toBeDefined();
      expect(comment.content).toBe(commentData.content);
      expect(comment.postId).toBe(testPost.id);
      expect(comment.commenterId).toBe(testUser.id);
    });
  });

  describe('updateComment', () => {
    it('should update an existing comment', async () => {
      const commentData: CreateCommentDto = { content: 'Original Comment', postId: testPost.id };
      const createdComment = await commentService.createComment(commentData, testUser.id);

      const updateData: UpdateCommentDto = { content: 'Updated Comment' };
      const updatedComment = await commentService.updateComment(createdComment.id, updateData);

      expect(updatedComment.content).toBe(updateData.content);
    });

    it('should throw an error if comment does not exist', async () => {
      const updateData: UpdateCommentDto = { content: 'Updated Comment' };
      await expect(commentService.updateComment(999, updateData)).rejects.toThrow(HttpException);
    });
  });

  describe('deleteComment', () => {
    it('should soft delete an existing comment', async () => {
      const commentData: CreateCommentDto = { content: 'Test Comment', postId: testPost.id };
      const createdComment = await commentService.createComment(commentData, testUser.id);

      const deletedComment = await commentService.deleteComment(createdComment.id);

      expect(deletedComment.id).toBe(createdComment.id);
      expect(deletedComment.deletedAt).toBeDefined();
      expect(deletedComment.deletedAt).toBeInstanceOf(Date);

      const allComments = await commentService.findAllComment();
      expect(allComments.find(comment => comment.id === createdComment.id)).toBeUndefined();
    });

    it('should throw an error if comment does not exist', async () => {
      await expect(commentService.deleteComment(999)).rejects.toThrow(HttpException);
    });
  });
});
