import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { EditBirthdayDto, CreateBirthdayDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class BirthdayService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all birthdays for user
   * @param user user object
   * @returns all birthdays for user
   */
  findAll(user: User) {
    return this.prisma.birthday.findMany({
      where: { userId: user.id },
    });
  }

  /**
   * Get one birthday by id (birthdayId) and user
   * @param user user object
   * @param birthdayId birthday id
   * @returns birthday object
   */
  async findOne(user: User, birthdayId: number) {
    const birthday = await this.prisma.birthday.findUnique({
      where: { id: birthdayId },
    });
    if (!birthday) {
      throw new NotFoundException('Birthday not found');
    }
    if (birthday.userId !== user.id) {
      throw new ForbiddenException('You cannot access this birthday');
    }
    return birthday;
  }

  /**
   * Create new birthday for user
   * @param user user object
   * @param body create birthday dto object
   * @returns created birthday object
   * @throws NotFoundException if user not found
   * @throws ForbiddenException if user id not equal birthday user id
   */
  async create(user: User, body: CreateBirthdayDto) {
    // get user first from DB to check if user exists
    const userExists = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
    if (!userExists) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.birthday.create({
      data: {
        ...body,
        user: { connect: { id: user.id } },
      },
    });
  }

  /**
   * Update birthday by id (birthdayId) and user
   * @param user user object
   * @param birthdayId birthday id
   * @param body edit birthday dto object
   * @returns updated birthday object
   * @throws NotFoundException if birthday not found
   * @throws ForbiddenException if user id not equal birthday user id
   */
  async update(user: User, birthdayId: number, body: EditBirthdayDto) {
    const birthday = await this.prisma.birthday.findUnique({
      where: { id: birthdayId },
    });
    if (!birthday) {
      throw new NotFoundException('Birthday not found');
    }
    if (birthday.userId !== user.id) {
      throw new ForbiddenException('You cannot edit this birthday');
    }
    return this.prisma.birthday.update({
      where: { id: birthdayId },
      data: body,
    });
  }

  /**
   * Delete birthday by id (birthdayId) and user
   * @param user user object
   * @param birthdayId birthday id
   * @returns deleted birthday object
   */
  async delete(user: User, birthdayId: number) {
    const birthday = await this.prisma.birthday.findUnique({
      where: { id: birthdayId },
    });
    if (!birthday) {
      throw new NotFoundException('Birthday not found');
    }
    if (birthday.userId !== user.id) {
      throw new ForbiddenException('You cannot delete this birthday');
    }
    await this.prisma.birthday.delete({
      where: { id: birthdayId },
    });
    return;
  }

  /**
   * Get all relationships for user
   * @param user user object
   * @returns all relationships for user
   */
  async getRelationships(user: User) {
    return await this.prisma.birthday.findMany({
      where: { userId: user.id },
      select: { relationship: true },
      distinct: ['relationship'],
    });
  }
}
