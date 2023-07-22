import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsISO8601, IsNotEmpty } from 'class-validator';

export class CreateBirthdayDto {
  @ApiProperty({ example: 'john doe', description: 'full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2000-01-01', description: 'birthday' })
  @IsISO8601()
  @IsNotEmpty()
  birthday: string;

  @ApiProperty({ example: 'father', description: 'relationship' })
  @IsString()
  @IsOptional()
  relationship?: string;

  @ApiProperty({ example: 'notes', description: 'notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
