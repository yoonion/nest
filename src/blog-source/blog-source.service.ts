import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogSource } from './blog-source.entity';
import { CreateBlogSourceDto } from './dto/create-blog-source.dto';

@Injectable()
export class BlogSourceService {
  constructor(
    @InjectRepository(BlogSource)
    private readonly blogSourceRepository: Repository<BlogSource>,
  ) {}

  getBlogSources() {
    return this.blogSourceRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  getActiveBlogSources() {
    return this.blogSourceRepository.find({
      where: { isActive: true },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async createBlogSource(dto: CreateBlogSourceDto) {
    const normalizedName = dto.name.trim();
    const normalizedUrl = dto.url.trim();
    const existing = await this.blogSourceRepository.findOne({
      where: { url: normalizedUrl },
    });

    if (existing) {
      throw new ConflictException('이미 등록된 블로그 URL입니다.');
    }

    const blogSource = this.blogSourceRepository.create({
      name: normalizedName,
      url: normalizedUrl,
      isActive: true,
      iconUrl: null,
      rssUrl: null,
    });

    return this.blogSourceRepository.save(blogSource);
  }

  async updateActiveStatus(id: number, isActive: boolean) {
    const blogSource = await this.blogSourceRepository.findOneBy({ id });

    if (!blogSource) {
      throw new NotFoundException('Blog source not found');
    }

    blogSource.isActive = isActive;
    return this.blogSourceRepository.save(blogSource);
  }

  async updateLastCollectedAt(id: number, collectedAt: Date) {
    const blogSource = await this.blogSourceRepository.findOneBy({ id });

    if (!blogSource) {
      throw new NotFoundException('Blog source not found');
    }

    blogSource.lastCollectedAt = collectedAt;
    return this.blogSourceRepository.save(blogSource);
  }

  async updateCollectionMetadata(
    id: number,
    collectedAt: Date,
    rssUrl: string | null,
    iconUrl: string | null,
  ) {
    const blogSource = await this.blogSourceRepository.findOneBy({ id });

    if (!blogSource) {
      throw new NotFoundException('Blog source not found');
    }

    blogSource.lastCollectedAt = collectedAt;
    if (rssUrl) {
      blogSource.rssUrl = rssUrl;
    }
    if (iconUrl) {
      blogSource.iconUrl = iconUrl;
    }

    return this.blogSourceRepository.save(blogSource);
  }

  async deleteBlogSource(id: number) {
    const blogSource = await this.blogSourceRepository.findOneBy({ id });

    if (!blogSource) {
      throw new NotFoundException('Blog source not found');
    }

    await this.blogSourceRepository.remove(blogSource);
    return { message: 'deleted' };
  }
}
