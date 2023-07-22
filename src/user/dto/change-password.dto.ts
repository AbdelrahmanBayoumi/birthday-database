import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'password', description: 'current password' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newPassword', description: 'new password' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
