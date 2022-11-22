/* eslint-disable @typescript-eslint/no-explicit-any */
import { authMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '@globals/helpers/error-handler';
import { SignIn } from '@auth/controllers/signin';
import { Helpers } from '@globals/helpers/helpers';
import { authService } from '@services/db/auth.service';
import { userService } from '@services/db/user.service';
import { mergedAuthAndUserData } from '@root/mocks/user.mock';

const USERNAME = 'Manny';
const PASSWORD = 'manny1';
const WRONG_USERNAME = 'ma';
const WRONG_PASSWORD = 'ma';
const LONG_PASSWORD = 'mathematics1';
const LONG_USERNAME = 'mathematics';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');

describe('SignIn', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest({}, { username: '', password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    const next: NextFunction = jest.fn();
    SignIn.prototype.read(req, res, next).then(() => {
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(new BadRequestError('Username is a required field') as BadRequestError);
    });
  });

  it('should throw an error if username length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { username: WRONG_USERNAME, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    const next: NextFunction = jest.fn();
    SignIn.prototype.read(req, res, next).then(() => {
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(new BadRequestError('Invalid username') as BadRequestError);
    });
  });

  it('should throw an error if username length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { username: LONG_USERNAME, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    const next: NextFunction = jest.fn();
    SignIn.prototype.read(req, res, next).then(() => {
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(new BadRequestError('Invalid username') as BadRequestError);
    });
  });

  it('should throw an error if password is not available', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: '' }) as Request;
    const res: Response = authMockResponse();
    const next: NextFunction = jest.fn();
    SignIn.prototype.read(req, res, next).then(() => {
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(new BadRequestError('Password is a required field') as BadRequestError);
    });
  });

  it('should throw an error if password length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    const next: NextFunction = jest.fn();
    SignIn.prototype.read(req, res, next).then(() => {
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(new BadRequestError('Invalid password') as BadRequestError);
    });
  });

  it('should throw an error if password length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: LONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    const next: NextFunction = jest.fn();
    SignIn.prototype.read(req, res, next).then(() => {
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(new BadRequestError('Invalid password') as BadRequestError);
    });
  });

  it('should throw "Invalid credentials" if username does not exist', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    const next: NextFunction = jest.fn();
    jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValueOnce(null as any);
    SignIn.prototype.read(req, res, next).then(() => {
      expect(authService.getAuthUserByUsername).toHaveBeenCalledWith(Helpers.firstLetterUppercase(req.body.username));
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(new BadRequestError('Invalid credentials') as BadRequestError);
    });
  });

  it('should throw "Invalid credentials" if password does not exist', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    const next: NextFunction = jest.fn();
    jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValueOnce(null as any);
    SignIn.prototype.read(req, res, next).then(() => {
      expect(authService.getAuthUserByUsername).toHaveBeenCalledWith(Helpers.firstLetterUppercase(req.body.username));
      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(new BadRequestError('Invalid credentials') as BadRequestError);
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    const next: NextFunction = jest.fn();
    authMock.comparePassword = () => Promise.resolve(true);
    jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValue(authMock);
    jest.spyOn(userService, 'getUserByAuthId').mockResolvedValue(mergedAuthAndUserData);
    await SignIn.prototype.read(req, res, next);
    expect(req.session?.jwt).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User login successfully',
      user: authMock,
      token: req.session?.jwt
    });
  });
});
