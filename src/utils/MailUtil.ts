import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailUtil {
  private readonly fromEmail = 'm.516564665@gmail.com';
  constructor(
    private readonly mailerService: MailerService,
    private config: ConfigService,
  ) {}

  /**
   * Returns the content of the verification mail as HTML string
   * @param url verification url to be sent to the user
   * @returns HTML string
   */
  private getVerificationMailContent(url: string): string {
    return `
      <div style="text-align: center;height:100vh;color: white;">
          <h1 style=" padding: 20px; background:black;">Welcome to Birthday Database App 🗓️</h1>
          <h3 style="text-align: center;margin-top:40px;color:black;" > Please Click <a href=${url}>Here</a> To Verify Your Account</h3>
      </div>
    `;
  }

  /**
   * Sends the verification mail to the user
   * @param toEmail email address of the user
   * @param verificationURL verification url to be sent to the user
   * @returns true if mail is sent successfully, false otherwise
   */
  async sendVerificationMail(toEmail: string, verificationURL: string) {
    try {
      await this.mailerService.sendMail({
        to: toEmail,
        from: this.fromEmail,
        subject: 'Verification Mail',
        html: this.getVerificationMailContent(verificationURL),
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async sendForgetPasswordMail(toEmail: string, tempPassword: string) {
    try {
      await this.mailerService.sendMail({
        to: toEmail,
        from: this.fromEmail,
        subject: 'Forget Password Mail',
        html: `
        <div style="text-align: center;height:100vh;color: white;">
          <h1 style=" padding: 20px; background:black;">Welcome to Birthday Database App 🗓️</h1>
          <h3 style="text-align: center;margin-top:40px;color:black;" > Your temporary password is ${tempPassword}</h3>
      </div>
        `,
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async sendPasswordChanged(toEmail: string) {
    try {
      await this.mailerService.sendMail({
        to: toEmail,
        from: this.fromEmail,
        subject: 'Password Changed',
        html: `
        <div style="text-align: center;height:100vh;color: white;">
          <h1 style=" padding: 20px; background:black;">Welcome to Birthday Database App 🗓️</h1>
          <h3 style="text-align: center;margin-top:40px;color:black;" > Your password has been changed successfully</h3>
      </div>
        `,
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
