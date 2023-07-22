import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailDto {
  @ApiProperty({ example: 'username@example.com', description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
