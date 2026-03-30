import { Optional } from '@nestjs/common';

export class UpdatePostDto {
  @Optional()
  title?: string;

  @Optional()
  content?: string;
}