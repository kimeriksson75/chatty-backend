import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';
import { NotAuthorizedError } from './error-handler';
import { AuthPayload } from '@auth/interfaces/auth.interface';

export class AuthMiddleware {
  public verifyUser(req: Request, res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      return next(new NotAuthorizedError('Token is not available. Please login again.'));
    }

    try {
      const payload: AuthPayload = JWT.verify(req.session.jwt, config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = payload;
    } catch (error) {
      return next(new NotAuthorizedError('Token is invalid. Please login again.'));
    }
    next();
  }
  public checkAuthentication(req: Request, res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      return next(new NotAuthorizedError('Authentication is required to access this route.'));
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
