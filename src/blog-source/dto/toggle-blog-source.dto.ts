import { IsBoolean } from 'class-validator';

export class ToggleBlogSourceDto {
  @IsBoolean()
  isActive: boolean;
}
