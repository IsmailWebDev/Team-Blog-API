import { PrismaClient } from '@prisma/client';
import { UserService } from '@services/users.service';
import { CreateUserDto, UpdateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';

describe('UserService', () => {
  let prisma: PrismaClient;
  let userService: UserService;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
    userService = new UserService();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('findAllUser', () => {
    it('should return all non-deleted users', async () => {
      const userData1: CreateUserDto = { email: 'user1@example.com', password: 'password123', username: 'user1' };
      const userData2: CreateUserDto = { email: 'user2@example.com', password: 'password123', username: 'user2' };
      await userService.createUser(userData1);
      await userService.createUser(userData2);

      const users = await userService.findAllUser();

      expect(users).toHaveLength(2);
      expect(users[0].email).toBe(userData1.email);
      expect(users[1].email).toBe(userData2.email);
    });
  });

  describe('findUserById', () => {
    it('should return a user by id', async () => {
      const userData: CreateUserDto = { email: 'test@example.com', password: 'password123', username: 'testuser' };
      const createdUser = await userService.createUser(userData);

      const foundUser = await userService.findUserById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(userData.email);
    });

    it('should throw an error if user does not exist', async () => {
      await expect(userService.findUserById(999)).rejects.toThrow(HttpException);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData: CreateUserDto = { email: 'test@example.com', password: 'password123', username: 'testuser' };

      const user = await userService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.username).toBe(userData.username);
      expect(user.password).toBeUndefined();
    });

    it('should throw an error if email already exists', async () => {
      const userData: CreateUserDto = { email: 'test@example.com', password: 'password123', username: 'testuser' };
      await userService.createUser(userData);

      await expect(userService.createUser(userData)).rejects.toThrow(HttpException);
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const userData: CreateUserDto = { email: 'test@example.com', password: 'password123', username: 'testuser' };
      const createdUser = await userService.createUser(userData);

      const updateData: UpdateUserDto = {
        password: 'newpassword123',
        username: 'newusername',
        bio: 'New bio',
      };
      const updatedUser = await userService.updateUser(createdUser.id, updateData);

      expect(updatedUser.username).toBe(updateData.username);
      expect(updatedUser.bio).toBe(updateData.bio);
    });

    it('should throw an error if user does not exist', async () => {
      const updateData: UpdateUserDto = {
        password: 'newpassword123',
        username: 'newusername',
      };
      await expect(userService.updateUser(999, updateData)).rejects.toThrow(HttpException);
    });
  });

  describe('deleteUser', () => {
    it('should soft delete an existing user', async () => {
      const userData: CreateUserDto = { email: 'test@example.com', password: 'password123', username: 'testuser' };
      const createdUser = await userService.createUser(userData);

      const deletedUser = await userService.deleteUser(createdUser.id);

      expect(deletedUser.id).toBe(createdUser.id);
      expect(deletedUser.deletedAt).toBeDefined();
      expect(deletedUser.deletedAt).toBeInstanceOf(Date);

      const allUsers = await userService.findAllUser();
      expect(allUsers.find(user => user.id === createdUser.id)).toBeUndefined();
    });

    it('should throw an error if user does not exist', async () => {
      await expect(userService.deleteUser(999)).rejects.toThrow(HttpException);
    });
  });
});
