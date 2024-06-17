import { PrismaClient } from '@prisma/client';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';

const getAuthorization = (req: RequestWithUser) => {
  const coockie = req.cookies['Authorization'];
  if (coockie) return coockie;

  const header = req.header('Authorization');
  if (header) return header.split('Bearer ')[1];

  return null;
};

export const AuthMiddleware = (requiredPermission?: string) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const Authorization = getAuthorization(req);
      if (Authorization) {
        const { id } = (await verify(Authorization, SECRET_KEY)) as DataStoredInToken;
        const users = new PrismaClient().user;

        const findUser = await users.findUnique({ where: { id: Number(id) } });

        if (findUser) {
          req.user = findUser;

          if (requiredPermission) {
            const userId = Number(req.params.id);
            if (requiredPermission === 'admin' && !req.user.isAdmin) {
              return next(new HttpException(403, 'You are not authorized to perform this action'));
            }
            if (requiredPermission === 'own' && req.user.id !== userId) {
              return next(new HttpException(403, 'You are not authorized to perform this action'));
            }
            if (requiredPermission === 'ownPost') {
              const posts = new PrismaClient().post;
              const post = await posts.findUnique({ where: { id: Number(req.params.id) } });
              if (req.user.id !== post.authorId) {
                return next(new HttpException(403, 'You are not authorized to perform this action'));
              }
            }
            if (requiredPermission === 'ownComment') {
              const comments = new PrismaClient().comment;
              const comment = await comments.findUnique({ where: { id: Number(req.params.id) } });
              if (req.user.id !== comment.commenterId) {
                console.log(req.user.id, comment.commenterId);
                return next(new HttpException(403, 'You are not authorized to perform this action'));
              }
            }
          }
          next();
        } else {
          next(new HttpException(401, 'Wrong authentication token'));
        }
      } else {
        next(new HttpException(404, 'Authentication token missing'));
      }
    } catch (error) {
      next(new HttpException(401, 'Wrong authentication token'));
    }
  };
};
