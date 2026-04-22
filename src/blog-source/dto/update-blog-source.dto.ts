import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateBlogSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @IsUrl({
    require_tld: true,
    require_protocol: true,
  })
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @IsUrl()
  iconUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

