import { Optional } from '@nestjs/common';
import { IsString } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @Optional()
  title?: string;

  @IsString()
  @Optional()
  content?: string;
}
