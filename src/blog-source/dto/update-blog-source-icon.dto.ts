import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateBlogSourceIconDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @IsUrl()
  iconUrl?: string;
}

