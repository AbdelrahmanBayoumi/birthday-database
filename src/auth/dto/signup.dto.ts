import {
  IsISO8601,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsISO8601()
  @IsNotEmpty()
  birthday: string;

  @IsString()
  @IsNotEmpty()
  @Length(6)
  password: string;
}
