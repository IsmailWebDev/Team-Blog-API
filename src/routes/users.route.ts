import { Router } from 'express';
import { UserController } from '@controllers/users.controller';
import { CreateUserDto, UpdateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { upload } from '@/middlewares/upload.middleware';

export class UserRoute implements Routes {
  public path = '/users';
  public router = Router();
  public user = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, AuthMiddleware('admin'), this.user.getUsers);
    this.router.get(`${this.path}/:id(\\d+)`, this.user.getUserById);
    this.router.post(`${this.path}`, ValidationMiddleware(CreateUserDto), AuthMiddleware('admin'), this.user.createUser);
    this.router.patch(
      `${this.path}/:id(\\d+)`,
      upload.single('profilePic'),
      ValidationMiddleware(UpdateUserDto, true, true, true),
      AuthMiddleware('own'),
      this.user.updateUser,
    );
    this.router.delete(`${this.path}/:id(\\d+)`, AuthMiddleware('own'), this.user.deleteUser);
  }
}
