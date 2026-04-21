import { Module } from '@nestjs/common';
import { BlogSourceModule } from '../blog-source/blog-source.module';
import { FeedCollectorService } from './feed-collector.service';
import { BlogPostModule } from '../blog-post/blog-post.module';

@Module({
  imports: [BlogSourceModule, BlogPostModule],
  providers: [FeedCollectorService],
})
export class CollectorModule {}
