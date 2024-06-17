import { Router } from 'express';
import { AuthController } from '@controllers/auth.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { loginDto, signupDto } from '@/dtos/auth.dto';

export class AuthRoute implements Routes {
  public path = '/';
  public router = Router();
  public auth = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}signup`, ValidationMiddleware(signupDto), this.auth.signUp);
    this.router.post(`${this.path}login`, ValidationMiddleware(loginDto), this.auth.logIn);
    this.router.post(`${this.path}logout`, AuthMiddleware('own'), this.auth.logOut);
  }
}
