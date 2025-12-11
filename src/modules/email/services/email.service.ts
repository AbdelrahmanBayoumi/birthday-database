import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /**
   * Generates the common HTML template for emails
   * @param content The specific content to be displayed in the email body
   */
  private getBaseTemplate(content: string): string {
    return `
      <div style="text-align: center;height:100vh;color: white;">
          <h1 style=" padding: 20px; background:black;">Welcome to Birthday Database App 🗓️</h1>
          <h3 style="text-align: center;margin-top:40px;color:black;" >${content}</h3>
      </div>
    `;
  }

  /**
   * Helper wrapper to handle sending emails with error logging
   */
  private async wrapSendMail(
    to: string,
    subject: string,
    contentHTML: string,
  ): Promise<boolean> {
    try {
      await this.sendMailInternal({
        to,
        subject,
        html: contentHTML,
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to send '${subject}' to ${to}`, error);
      return false;
    }
  }

  /**
   * Sends the verification mail to the user
   * @param toEmail email address of the user
   * @param verificationURL verification url to be sent to the user
   */
  async sendVerificationMail(
    toEmail: string,
    verificationURL: string,
  ): Promise<boolean> {
    const content = `Please Click <a href="${verificationURL}">Here</a> To Verify Your Account`;
    return this.wrapSendMail(
      toEmail,
      'Verification Mail',
      this.getBaseTemplate(content),
    );
  }

  async sendForgetPasswordMail(
    toEmail: string,
    tempPassword: string,
  ): Promise<boolean> {
    const content = `Your temporary password is ${tempPassword}`;
    return this.wrapSendMail(
      toEmail,
      'Forget Password Mail',
      this.getBaseTemplate(content),
    );
  }

  async sendPasswordChanged(toEmail: string): Promise<boolean> {
    const content = 'Your password has been changed successfully';
    return this.wrapSendMail(
      toEmail,
      'Password Changed',
      this.getBaseTemplate(content),
    );
  }

  private async sendMailInternal({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    const info = await this.transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    });
    this.logger.log(`Email sent: ${info.messageId}`);
    return info;
  }
}
