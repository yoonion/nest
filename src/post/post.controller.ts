import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @Get()
  getPosts() {
    return this.postService.getPosts();
  }

  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.postService.getPost(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createPost(
    @Body() dto: CreatePostDto,
    @CurrentUser() user,
  ) {
    return this.postService.createPost(dto, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updatePost(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user,
  ) {
    return this.postService.updatePost(Number(id), dto, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deletePost(
    @Param('id') id: string,
    @CurrentUser() user,
  ) {
    return this.postService.deletePost(Number(id), user.userId);
  }
}
