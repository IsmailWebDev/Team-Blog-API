import { PrismaClient } from '@prisma/client';
import { AuthService } from '@services/auth.service';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';

describe('AuthService', () => {
  let prisma: PrismaClient;
  let authService: AuthService;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
    authService = new AuthService();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('signup', () => {
    it('should create a new user', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      const user = await authService.signup(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.username).toBe(userData.username);
      expect((user as any).password).toBeUndefined();
      expect(user.id).toBeDefined();
      expect(user.isAdmin).toBeDefined();
    });

    it('should throw an error if email already exists', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      await authService.signup(userData);

      await expect(authService.signup(userData)).rejects.toThrow(HttpException);
    });
  });

  describe('login', () => {
    it('should return user data and cookie on successful login', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      await authService.signup(userData);

      const { cookie, findUser } = await authService.login({
        email: userData.email,
        password: userData.password,
      });

      expect(cookie).toBeDefined();
      expect(findUser).toBeDefined();
      expect(findUser.email).toBe(userData.email);
      expect(findUser.password).toBeDefined();
      expect(findUser.id).toBeDefined();
      expect(findUser.username).toBeDefined();
      expect(findUser.isAdmin).toBeDefined();
    });

    it('should throw an error if user does not exist', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw an error if password is incorrect', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      await authService.signup(userData);

      await expect(
        authService.login({
          email: userData.email,
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('logout', () => {
    it('should return user data on logout', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      const createdUser = await authService.signup(userData);

      const logoutUser = await authService.logout(createdUser);

      expect(logoutUser).toBeDefined();
      expect(logoutUser.email).toBe(userData.email);
      expect(logoutUser.id).toBeDefined();
      expect(logoutUser.username).toBeDefined();
      expect(logoutUser.isAdmin).toBeDefined();
      expect(logoutUser.password).toBeUndefined();
    });

    it('should throw an error if user does not exist', async () => {
      await expect(
        authService.logout({
          id: 999,
          email: 'nonexistent@example.com',
          username: 'nonexistent',
          isAdmin: false,
        }),
      ).rejects.toThrow(HttpException);
    });
  });
});
