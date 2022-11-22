/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer';
import sendGridMail from '@sendgrid/mail';
import Logger from 'bunyan';
import { config } from '@root/config';
import { BadRequestError } from '@globals/helpers/error-handler';

interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

const log: Logger = config.createLogger('mailOptions');

sendGridMail.setApiKey(config.SENDGRID_API_KEY!);

class MailTransport {
  public async sendEmail(receiverEmail: string, subject: string, body: string): Promise<void | any> {
    if (config.NODE_ENV === 'test' || config.NODE_ENV === 'development') {
      this.developmentEmailSender(receiverEmail, subject, body);
    } else {
      this.productionEmailSender(receiverEmail, subject, body);
    }
  }
  private async developmentEmailSender(receiverEmail: string, subject: string, body: string): Promise<void | any> {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.SENDER_EMAIL, // generated ethereal user
        pass: config.SENDER_EMAIL_PASSWORD // generated ethereal password
      }
    });
    const mailOptions: IMailOptions = {
      from: `Chatty app <${config.SENDER_EMAIL}>`,
      to: receiverEmail,
      subject,
      html: body
    };

    try {
      await transporter.sendMail(mailOptions);
      log.info('Development mail sent successfully');
    } catch (error) {
      log.error('Error sending email', error);
      throw new BadRequestError('Error sending email');
    }
  }

  private async productionEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    const mailOptions: IMailOptions = {
      from: `Chatty app <${config.SENDER_EMAIL}>`,
      to: receiverEmail,
      subject,
      html: body
    };

    try {
      await sendGridMail.send(mailOptions);
      log.info('Production email sent successfully');
    } catch (error) {
      log.error('Error sending email', error);
      throw new BadRequestError('Error sending email');
    }
  }
}

export const mailTransport: MailTransport = new MailTransport();
