import {
  Body,
  Controller,
  Delete,
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
import { UpdateBlogSourceIconDto } from './dto/update-blog-source-icon.dto';
import { UpdateBlogSourceDto } from './dto/update-blog-source.dto';

@Controller('blog-sources')
export class BlogSourceController {
  constructor(private readonly blogSourceService: BlogSourceService) {}

  @Get('public')
  getPublicBlogSources() {
    return this.blogSourceService.getBlogSources();
  }

  @Get('active')
  getActiveBlogSources() {
    return this.blogSourceService.getActiveBlogSources();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getBlogSources() {
    return this.blogSourceService.getBlogSources();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getBlogSourceById(@Param('id', ParseIntPipe) id: number) {
    return this.blogSourceService.getBlogSourceById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createBlogSource(@Body() dto: CreateBlogSourceDto) {
    return this.blogSourceService.createBlogSource(dto);
  }

  @Patch(':id/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateActiveStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ToggleBlogSourceDto,
  ) {
    return this.blogSourceService.updateActiveStatus(id, dto.isActive);
  }

  @Patch(':id/icon')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateIconUrl(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBlogSourceIconDto,
  ) {
    const nextIconUrl = dto.iconUrl?.trim();
    return this.blogSourceService.updateIconUrl(
      id,
      nextIconUrl && nextIconUrl.length > 0 ? nextIconUrl : null,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateBlogSource(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBlogSourceDto,
  ) {
    return this.blogSourceService.updateBlogSource(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteBlogSource(@Param('id', ParseIntPipe) id: number) {
    return this.blogSourceService.deleteBlogSource(id);
  }
}
