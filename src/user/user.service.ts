import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto, EditUserDto } from './dto';
import { HashService } from '../utils/hash.service';
import { MailUtil } from '../utils/MailUtil';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly hashService: HashService,
    private readonly mailUtil: MailUtil,
  ) {}

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

    return user;
  }

  /**
   * delete user by id and return user object without hash field
   * @param userId user id
   * @throws Error if user not found
   * @throws Error if user not deleted
   */
  async deleteUser(userId: number) {
    await this.prisma.user.delete({ where: { id: userId } });
    return;
  }

  /**
   * change the password of the user and return a message if the password was changed successfully
   * @param userId user id to be changed
   * @param changePasswordDto change password dto object with current password and new password
   * @returns message if the password was changed successfully
   * @throws UnauthorizedException if the current password is incorrect
   */
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;
    // the User object does not have the hash field so we need to fetch it from the db
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { hash: true, email: true },
    });
    // Validate the user's current password
    const pwMatches = await this.hashService.verifyHashed(
      user.hash,
      currentPassword,
    );
    if (!pwMatches) {
      throw new UnauthorizedException('Invalid current password');
    }
    // Update the user's password
    const newHash = await this.hashService.generateHash(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hash: newHash },
    });

    // Send an email to the user notifying them that their password has been changed
    this.mailUtil.sendPasswordChanged(user.email);

    // Invalidate the user's refresh token by setting it to null
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt: null },
    });

    // Return a success response
    return { message: 'Password changed successfully' };
  }
}
