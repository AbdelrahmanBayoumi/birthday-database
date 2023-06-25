import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, SignUpDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens } from './types';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * update the refresh token of the user
   * @param userId user id to be updated
   * @param refreshToken refresh token to be updated
   */
  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
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
      const hash = await this.hashData(dto.password);
      // save the new user in the db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          fullName: dto.fullName,
          birthday: dto.birthday,
        },
      });

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
    const pwMatches = await this.verifyHashed(user.hash, dto.password);

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
          expiresIn: '15m',
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
   * hash the data using argon2
   * @param data data to be signed
   * @returns hashed data
   */
  async hashData(data: string) {
    return await argon.hash(data);
  }

  /**
   * verify the hash and return true if the password matches the hash
   * @param hash hashed password
   * @param plain plain text password
   * @returns true if the password matches the hash otherwise false
   */
  async verifyHashed(hash: string, plain: string) {
    return await argon.verify(hash, plain);
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

    const rtMatches = await this.verifyHashed(
      user.hashedRt,
      user['refreshToken'],
    );
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }
}
