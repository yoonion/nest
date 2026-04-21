import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BlogSourceService } from './blog-source.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/user-role.enum';
import { CreateBlogSourceDto } from './dto/create-blog-source.dto';
import { ToggleBlogSourceDto } from './dto/toggle-blog-source.dto';

@Controller('blog-sources')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class BlogSourceController {
  constructor(private readonly blogSourceService: BlogSourceService) {}

  @Get()
  getBlogSources() {
    return this.blogSourceService.getBlogSources();
  }

  @Post()
  createBlogSource(@Body() dto: CreateBlogSourceDto) {
    return this.blogSourceService.createBlogSource(dto);
  }

  @Patch(':id/active')
  updateActiveStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ToggleBlogSourceDto,
  ) {
    return this.blogSourceService.updateActiveStatus(id, dto.isActive);
  }
}
