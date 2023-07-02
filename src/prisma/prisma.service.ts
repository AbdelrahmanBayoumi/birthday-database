import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({ datasources: { db: { url: config.get('DATABASE_URL') } } });
  }

  cleanDb() {
    return this.$transaction([this.user.deleteMany()]);
  }

  async verifiyUserById(userId: number) {
    return this.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
  }
}
