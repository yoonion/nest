import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from './blog-post.entity';
import { BlogSource } from '../blog-source/blog-source.entity';

export type CollectedFeedItem = {
  externalId: string;
  url: string;
  title: string;
  summary: string | null;
  publishedAt: Date | null;
};

@Injectable()
export class BlogPostService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogPostRepository: Repository<BlogPost>,
  ) {}

  async upsertManyFromFeed(source: BlogSource, items: CollectedFeedItem[]) {
    for (const item of items) {
      const externalId = item.externalId.trim();
      const url = item.url.trim();
      const title = item.title.trim();

      if (!externalId || !url || !title) {
        continue;
      }

      const existing = await this.blogPostRepository.findOne({
        where: {
          source: { id: source.id },
          externalId,
        },
        relations: ['source'],
      });

      if (existing) {
        existing.url = url;
        existing.title = title;
        existing.summary = item.summary;
        existing.publishedAt = item.publishedAt;
        existing.collectedAt = new Date();
        await this.blogPostRepository.save(existing);
        continue;
      }

      const created = this.blogPostRepository.create({
        source: { id: source.id },
        externalId,
        url,
        title,
        summary: item.summary,
        publishedAt: item.publishedAt,
        collectedAt: new Date(),
      });

      await this.blogPostRepository.save(created);
    }
  }
}
