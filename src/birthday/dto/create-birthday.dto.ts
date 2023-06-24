import { IsOptional, IsString, IsISO8601, IsNotEmpty } from 'class-validator';

export class CreateBirthdayDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsISO8601()
  @IsNotEmpty()
  birthday: string;

  @IsString()
  @IsOptional()
  relationship?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
