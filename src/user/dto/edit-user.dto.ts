import { IsOptional, IsString, IsISO8601, IsNotEmpty } from 'class-validator';

export class EditUserDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  fullName?: string;

  @IsISO8601()
  @IsOptional()
  birthday?: string;
}
