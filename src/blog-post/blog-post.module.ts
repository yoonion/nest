import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from './blog-post.entity';
import { BlogPostService } from './blog-post.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost])],
  providers: [BlogPostService],
  exports: [BlogPostService],
})
export class BlogPostModule {}
