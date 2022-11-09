import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';
import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { loginSchema } from '@auth/schemas/signin';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@globals/helpers/error-handler';
import { IUserDocument } from '@user/interfaces/user.interface';
import { config } from '@root/config';
import { userService } from '@services/db/user.service';
import { IAuthDocument } from '@auth/interfaces/auth.interface';

export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { username, password } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username);
    if (!existingUser) {
      return next(new BadRequestError('Invalid credentials'));
    }

    const passwordsMatch: boolean = await existingUser.comparePassword(password);
    if (!passwordsMatch) {
      return next(new BadRequestError('Invalid credentials'));
    }
    const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);
    if (!user) {
      return next(new BadRequestError('Unable to getUserByAuthId'));
    }
    console.log(`existingUser: ${existingUser} \n user: ${user}`);
    const userJwt: string = JWT.sign(
      {
        userId: user._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN!
    );
    req.session = { jwt: userJwt };
    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser!._id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt
    } as IUserDocument;
    res.status(HTTP_STATUS.OK).json({ message: 'User login successfully', user: userDocument, token: userJwt });
  }
}