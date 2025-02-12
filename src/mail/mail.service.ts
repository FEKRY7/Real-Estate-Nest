import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, RequestTimeoutException } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendLogInEmail(email: string) {
    try {
      const today = new Date();
      await this.mailerService.sendMail({
        to: email,
        from: 'your-email@example.com', // Replace with a valid sender email
        subject: 'Login Successful',
        template: 'login', //login.ejs
        context: { email, today },
      });
    } catch (error) {
      console.error('Error sending email:', error); // Improved error logging
      throw new RequestTimeoutException('Failed to send email verification');
    }
  }

  public async sendVerifyEmailTemplate(email: string, link: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: 'your-email@example.com', // Replace with a valid sender email
        subject: 'Verify your account',
        template: 'verify-email', //login.ejs
        context: { link },
      });
    } catch (error) {
      console.error('Error sending email:', error); // Improved error logging
      throw new RequestTimeoutException('Failed to send email verification');
    }
  }

  public async SendReminderEmail(email: string) {
    try {
      await this.mailerService.sendMail({
        from: `"No Reply" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'NoReply (Email Confirmation Reminder)',
        text: 'This mail was sent automatically as a reminder to confirm your email. Please do not reply.',
      });
      console.log(`Email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error);
    }
  }

  public async sendOtpEmailTemplate(email: string, OTPCode: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: `your-email@example.com`,
        subject: 'Confirmation Email',
        text: `Your OTP Code is: ${OTPCode}`,
        template: 'create-otp',
        context: { OTP: { OTPCode } }, // Ensure correct context
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new RequestTimeoutException('Failed to send email verification');
    } 
  }
}
