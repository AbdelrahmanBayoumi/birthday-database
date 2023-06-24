import { PartialType } from '@nestjs/mapped-types';
import { CreateBirthdayDto } from './create-birthday.dto';

export class EditBirthdayDto extends PartialType(CreateBirthdayDto) {}
