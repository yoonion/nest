import { Controller, Get, Query } from '@nestjs/common';
import { BlogPostService } from './blog-post.service';

@Controller('blog-posts')
export class BlogPostController {
  constructor(private readonly blogPostService: BlogPostService) {}

  @Get('public')
  getPublicFeed(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sourceId') sourceId?: string,
  ) {
    const parsedPage = page ? Number(page) : 1;
    const parsedLimit = limit ? Number(limit) : 20;
    const parsedSourceId = sourceId ? Number(sourceId) : undefined;

    const safePage = Number.isFinite(parsedPage) ? parsedPage : 1;
    const safeLimit = Number.isFinite(parsedLimit) ? parsedLimit : 20;
    const safeSourceId =
      typeof parsedSourceId === 'number' && Number.isFinite(parsedSourceId)
        ? parsedSourceId
        : undefined;

    return this.blogPostService.getPublicFeed(
      safePage,
      safeLimit,
      safeSourceId,
    );
  }
}
