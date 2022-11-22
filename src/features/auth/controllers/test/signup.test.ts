/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import * as cloudinaryUploads from '@globals/helpers/cloudinary-upload';
import { authMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { SignUp } from '@auth/controllers/signup';
import { BadRequestError } from '@globals/helpers/error-handler';
import { authService } from '@services/db/auth.service';
import { UserCache } from '@services/redis/user.cache';

jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/user.cache');
jest.mock('@services/queues/user.queue');
jest.mock('@services/queues/auth.queue');
jest.mock('@globals/helpers/cloudinary-upload');
jest.useFakeTimers();

describe('Signup', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if username is missing', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        email: 'kim@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = jest.fn();
    SignUp.prototype.create(req, res, next).then(() => {
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(new BadRequestError('Username is a required field') as BadRequestError);
    });
  });

  it('should throw an error if username length is less than minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'ki',
        email: 'kim@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = jest.fn();
    SignUp.prototype.create(req, res, next).then(() => {
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(new BadRequestError('Invalid username') as BadRequestError);
    });
  });

  it('should throw an error if username length is greater than maximum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'mathematics',
        email: 'kim@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = jest.fn();
    SignUp.prototype.create(req, res, next).then(() => {
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(new BadRequestError('Invalid username') as BadRequestError);
    });
  });

  it('should throw an error if email is not valid', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Kim',
        email: 'not valid',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = jest.fn();
    SignUp.prototype.create(req, res, next).then(() => {
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(new BadRequestError('Email must be valid') as BadRequestError);
    });
  });

  it('should throw an error if email is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Kim',
        email: '',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = jest.fn();
    SignUp.prototype.create(req, res, next).then(() => {
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(new BadRequestError('Email is a required field') as BadRequestError);
    });
  });

  it('should throw an error if password is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Kim',
        email: 'kim@test.com',
        password: '',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = jest.fn();
    SignUp.prototype.create(req, res, next).then(() => {
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(new BadRequestError('Password is a required field') as BadRequestError);
    });
  });

  it('should throw an error if password length is less than minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Kim',
        email: 'kim@test.com',
        password: 'ma',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = jest.fn();
    SignUp.prototype.create(req, res, next).then(() => {
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(new BadRequestError('Invalid password') as BadRequestError);
    });
  });

  it('should throw an error if password length is greater than maximum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Kim',
        email: 'kim@test.com',
        password: 'mathematics1',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = jest.fn();
    SignUp.prototype.create(req, res, next).then(() => {
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(new BadRequestError('Invalid password') as BadRequestError);
    });
  });

  it('should throw unauthorize error is user already exist', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Kim',
        email: 'kim@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse();
    const next: NextFunction = jest.fn();
    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);
    SignUp.prototype.create(req, res, next).then(() => {
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(new BadRequestError('Invalid credentials') as BadRequestError);
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Manny',
        email: 'manny@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(null as any);
    const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
    jest.spyOn(cloudinaryUploads, 'upload').mockImplementation((): any => Promise.resolve({ version: '1234737373', public_id: '123456' }));

    const next: NextFunction = jest.fn();

    await SignUp.prototype.create(req, res, next);
    expect(req.session?.jwt).toBeDefined();
    expect(res.json).toHaveBeenCalledWith({
      message: 'User created successfully',
      user: userSpy.mock.calls[0][2],
      token: req.session?.jwt
    });
  });
});
