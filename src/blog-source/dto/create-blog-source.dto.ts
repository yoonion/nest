import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateBlogSourceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @IsUrl({
    require_tld: true,
    require_protocol: true,
  })
  url: string;
}
