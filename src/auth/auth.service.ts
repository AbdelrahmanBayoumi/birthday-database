import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, SignUpDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * create a new user and return a jwt token
   * @param dto SignUpDto object with user data needed to create a new user
   * @returns jwt token
   * @throws ForbiddenException if the email is already taken
   */
  async signup(dto: SignUpDto) {
    try {
      // generate the password hash
      const hash = await argon.hash(dto.password);
      // save the new user in the db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          fullName: dto.fullName,
          birthday: dto.birthday,
        },
      });

      return this.signToken(user.id, user.email);
    } catch (error) {
      // if the error is because of a duplicate email
      if (error.code && error.code === 'P2002') {
        throw new ForbiddenException('Credentials taken');
      }
      throw error;
    }
  }

  /**
   * login a user and return a jwt token
   * @param dto LoginDto object with user email and password
   * @returns jwt token
   * @throws ForbiddenException if the credentials are incorrect
   */
  async login(dto: LoginDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // if user does not exist throw exception
    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }

    // compare password
    const pwMatches = await argon.verify(user.hash, dto.password);

    // if password incorrect throw exception
    if (!pwMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }

    return this.signToken(user.id, user.email);
  }

  /**
   * create a jwt token with the user id and email
   * @param userId user id
   * @param email user email
   * @returns jwt token
   * @throws ForbiddenException if the credentials are incorrect
   */
  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = { sub: userId, email };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      // TODO: change expiresIn to a reasonable value
      expiresIn: '1d',
      secret: secret,
    });

    return { access_token: token };
  }

  // TODO: handle forgot password
}
