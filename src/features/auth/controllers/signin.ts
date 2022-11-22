import { emailQueue } from '../../../shared/services/queues/email.queue';
import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';
import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { loginSchema } from '@auth/schemas/signin';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@globals/helpers/error-handler';
import { IResetPasswordParams, IUserDocument } from '@user/interfaces/user.interface';
import { config } from '@root/config';
import { userService } from '@services/db/user.service';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import moment from 'moment';
import publicIP from 'ip';
import { resetPasswordTemplate } from '@services/emails/templates/reset-password/reset-password-template';

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

    const templateParams: IResetPasswordParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipaddress: publicIP.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };
    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('resetPasswordEmail', {
      template,
      receiverEmail: 'carmela.gusikowski@ethereal.email',
      subject: 'Password reset confirmation'
    });
    req.session = { jwt: userJwt };
    res.status(HTTP_STATUS.OK).json({ message: 'User login successfully', user: existingUser, token: userJwt });
  }
}
