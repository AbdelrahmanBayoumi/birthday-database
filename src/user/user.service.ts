import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * edit user data by id and return user object without hash field
   * @param userId user id
   * @param dto user data
   * @returns user object
   */
  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
    });

    delete user.hash;
    delete user.createdAt;
    delete user.updatedAt;
    return user;
  }

  /**
   * delete user by id and return user object without hash field
   * @param userId user id
   * @returns user object without hash field
   * @throws Error if user not found
   * @throws Error if user not deleted
   */
  async deleteUser(userId: number) {
    const user = await this.prisma.user.delete({ where: { id: userId } });
    delete user.hash;
    return user;
  }
}
