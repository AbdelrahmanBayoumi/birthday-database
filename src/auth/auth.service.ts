import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, SignUpDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens } from './types';
import { User } from '@prisma/client';
import { MailUtil } from '../utils/MailUtil';
import { HashService } from '../utils/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailUtil: MailUtil,
    private readonly hashService: HashService,
  ) {}

  /**
   * add a refresh token to the database
   * @param userId user id to be added to the refresh token
   * @param refreshToken refresh token to be added to
   */
  async addRefreshToken(userId: number, refreshToken: string) {
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        // expiresAt: date of 30 days from now
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  /**
   * create a new user and return a access token and a refresh token
   * @param dto SignUpDto object with user data needed to create a new user
   * @returns access token and refresh token pair
   * @throws ConflictException if the email is already taken
   */
  async signup(dto: SignUpDto): Promise<Tokens> {
    try {
      // generate the password hash
      const hash = await this.hashService.generateHash(dto.password);
      // save the new user in the db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          fullName: dto.fullName,
          birthday: dto.birthday,
        },
      });

      this.sendVerificationEmail(user.id, user.email);

      const tokens = await this.getTokens(user.id, user.email);
      await this.addRefreshToken(user.id, tokens.refresh_token);
      return tokens;
    } catch (error) {
      // if the error is because of a duplicate email
      if (error.code && error.code === 'P2002') {
        throw new ConflictException('Email already used');
      }
      throw error;
    }
  }

  /**
   * login a user and return a access token and a refresh token
   * @param dto LoginDto object with user email and password
   * @returns access token and refresh token pair
   * @throws UnauthorizedException if the credentials are incorrect or the user does not exist
   */
  async login(dto: LoginDto): Promise<Tokens> {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // if user does not exist throw exception
    if (!user) {
      throw new UnauthorizedException('Access denied');
    }

    // compare password
    const pwMatches = await this.hashService.verifyHashed(
      user.hash,
      dto.password,
    );

    // if password incorrect throw exception
    if (!pwMatches) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.addRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  /**
   * verify the user by sending a verification email
   * @param userId user id to be verified
   * @param email email to be verified
   * @returns true if the user was verified successfully
   * @throws Error if the user was not verified successfully
   */
  private async sendVerificationEmail(userId: number, email: string) {
    const emailToken = await this.jwt.signAsync(
      { sub: userId, email },
      {
        expiresIn: '1d',
        secret: this.config.get('JWT_EMAIL_SECRET'),
      },
    );
    const url =
      this.config.get('HOST_URL') + '/auth/verification/' + emailToken;

    if (!(await this.mailUtil.sendVerificationMail(email, url))) {
      throw new Error('ERROR in Sending verification Mail');
    }
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Access denied');
    }
    await this.sendVerificationEmail(user.id, user.email);
  }

  /**
   * verify user email and return a html page to be displayed
   * @param token token to be verified
   * @returns html page to be displayed after the email is verified
   */
  async verifyEmail(token: string) {
    try {
      const { sub: userId } = await this.jwt.verifyAsync(token, {
        secret: this.config.get('JWT_EMAIL_SECRET'),
      });

      await this.prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });

      return `<!DOCTYPE html> <html> <head> <title>Email Activation</title> </head> <body style=" background-color: #f5f7fe; text-align: center; " > <div style=" height: 100vh; display: flex; align-items: center; justify-content: center; " > <div style=" padding: 40px; display: flex; flex-direction: column; background: #fff; border-radius: 20px; box-shadow: 2px 3px 10px #00000029; " > <h1>📅 Birthday Database</h1> <h2>Email Activated Successfully!</h2> <p style="color: #666; font-size: 18px"> ✅ Thank you for activating your email. </p> <p style="color: #666; font-size: 18px">You can go close this window</p> </div> </div> </body> </html>`;
    } catch (error) {
      throw new BadRequestException('Access denied');
    }
  }

  /**
   * sign a access token and a refresh token for the user and return them
   * @param userId user id to be signed
   * @param email user email to be signed
   * @returns jwt token and refresh token pair
   */
  async getTokens(userId: number, email: string): Promise<Tokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(
        { sub: userId, email },
        {
          expiresIn: '15m',
          secret: this.config.get('JWT_ACCESS_SECRET'),
        },
      ),
      this.jwt.signAsync(
        { sub: userId, email },
        {
          expiresIn: '30d',
          secret: this.config.get('JWT_REFRESH_SECRET'),
        },
      ),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  /**
   * logout a user by deleting the refresh token
   * @param userId user id to be logged out
   * @returns true if the user was logged out successfully
   */
  async logout(userId: number, refreshToken: string): Promise<boolean> {
    await this.revokeRefreshToken(userId, refreshToken);
    return true;
  }

  /**
   * refresh the access token and the refresh token by verifying the refresh token
   * @param user user to be refreshed
   * @returns access token and refresh token pair
   * @throws ForbiddenException if the user does not have a refresh token
   * @throws ForbiddenException if the refresh token does not match the hashed refresh token
   */
  async refreshTokens(user: User): Promise<Tokens> {
    if (!user) throw new ForbiddenException('Access Denied');
    // user['refreshToken'] is the token from RefreshTokenGuard which is added to the user object by the guard

    // get refreshToken to check if it is valid
    const refreshTokenToVerify = await this.prisma.refreshToken.findFirst({
      where: {
        userId: user.id,
        token: user['refreshToken'],
      },
    });

    if (!refreshTokenToVerify || refreshTokenToVerify.expiresAt < new Date())
      throw new ForbiddenException('Access Denied');

    // delete the refresh token from the db because we will add a new one
    await this.prisma.refreshToken.delete({
      where: {
        id: refreshTokenToVerify.id,
      },
    });

    const tokens = await this.getTokens(user.id, user.email);
    await this.addRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  /**
   * handle the forget password request by sending a temporary password to the user in email and updating the password hash
   * @param email email of the user
   * @returns true if the mail was sent successfully
   */
  async forgetPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Access denied');
    }
    const tempPassword = Math.random().toString(36).slice(-8);
    const hash = await this.hashService.generateHash(tempPassword);

    // update the password hash and reset the refresh token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        hash,
      },
    });
    // remove all refresh tokens that user have
    await this.revokeRefreshToken(user.id);
    return await this.mailUtil.sendForgetPasswordMail(email, tempPassword);
  }

  async revokeRefreshToken(userId: number, token?: string): Promise<void> {
    if (!token) {
      await this.prisma.refreshToken.deleteMany({
        where: {
          userId: userId,
        },
      });
    } else {
      await this.prisma.refreshToken.deleteMany({
        where: {
          userId: userId,
          token: token,
        },
      });
    }
  }
}
