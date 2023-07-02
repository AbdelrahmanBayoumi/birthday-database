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
   * update the refresh token of the user
   * @param userId user id to be updated
   * @param refreshToken refresh token to be updated
   */
  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await this.hashService.generateHash(
      refreshToken,
    );
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt: hashedRefreshToken },
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

      await this.sendVerificationEmail(user.id, user.email);

      const tokens = await this.getTokens(user.id, user.email);
      await this.updateRefreshToken(user.id, tokens.refresh_token);
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
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
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
          expiresIn: '7d',
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
  async logout(userId: number): Promise<boolean> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });
    return true;
  }

  /**
   * refresh the access token and the refresh token
   * @param user user to be refreshed
   * @returns access token and refresh token pair
   * @throws ForbiddenException if the user does not have a refresh token
   * @throws ForbiddenException if the refresh token does not match the hashed refresh token
   */
  async refreshTokens(user: User): Promise<Tokens> {
    if (!user || !user.hashedRt || !user['refreshToken'])
      throw new ForbiddenException('Access Denied');

    const rtMatches = await this.hashService.verifyHashed(
      user.hashedRt,
      user['refreshToken'],
    );
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }
}
