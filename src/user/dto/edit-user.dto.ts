import { IsOptional, IsString, IsISO8601, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditUserDto {
  @ApiProperty({ example: 'john doe', description: 'full name' })
  @IsOptional()
  @IsNotEmpty()
  fullName?: string;

  @ApiProperty({ example: '2000-01-01', description: 'birthday' })
  @IsISO8601()
  @IsOptional()
  birthday?: string;
}
