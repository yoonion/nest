import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogSource } from './blog-source.entity';
import { CreateBlogSourceDto } from './dto/create-blog-source.dto';
import { UpdateBlogSourceDto } from './dto/update-blog-source.dto';

@Injectable()
export class BlogSourceService {
  constructor(
    @InjectRepository(BlogSource)
    private readonly blogSourceRepository: Repository<BlogSource>,
  ) {}

  async getBlogSources() {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const rows = await this.blogSourceRepository
      .createQueryBuilder('source')
      .leftJoin('source.posts', 'post')
      .select('source.id', 'id')
      .addSelect('source.name', 'name')
      .addSelect('source.url', 'url')
      .addSelect('source.isActive', 'isActive')
      .addSelect('source.iconUrl', 'iconUrl')
      .addSelect('source.rssUrl', 'rssUrl')
      .addSelect('source.lastCollectedAt', 'lastCollectedAt')
      .addSelect('source.createdAt', 'createdAt')
      .addSelect('source.updatedAt', 'updatedAt')
      .addSelect('COUNT(post.id)', 'postCount')
      .addSelect(
        'SUM(CASE WHEN post.publishedAt IS NOT NULL AND post.publishedAt >= :threeDaysAgo THEN 1 ELSE 0 END)',
        'newPostCount',
      )
      .groupBy('source.id')
      .orderBy('source.createdAt', 'DESC')
      .setParameter('threeDaysAgo', threeDaysAgo)
      .getRawMany<{
        id: number;
        name: string | null;
        url: string;
        isActive: boolean;
        iconUrl: string | null;
        rssUrl: string | null;
        lastCollectedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        postCount: string;
        newPostCount: string;
      }>();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      url: row.url,
      isActive: row.isActive,
      iconUrl: row.iconUrl,
      rssUrl: row.rssUrl,
      lastCollectedAt: row.lastCollectedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      postCount: Number(row.postCount) || 0,
      newPostCount: Number(row.newPostCount) || 0,
    }));
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

  async getBlogSourceById(id: number) {
    const source = await this.blogSourceRepository.findOneBy({ id });
    if (!source) {
      throw new NotFoundException('Blog source not found');
    }
    return source;
  }

  async updateActiveStatus(id: number, isActive: boolean) {
    const blogSource = await this.blogSourceRepository.findOneBy({ id });

    if (!blogSource) {
      throw new NotFoundException('Blog source not found');
    }

    blogSource.isActive = isActive;
    return this.blogSourceRepository.save(blogSource);
  }

  async updateIconUrl(id: number, iconUrl: string | null) {
    const blogSource = await this.blogSourceRepository.findOneBy({ id });

    if (!blogSource) {
      throw new NotFoundException('Blog source not found');
    }

    blogSource.iconUrl = iconUrl;
    return this.blogSourceRepository.save(blogSource);
  }

  async updateBlogSource(id: number, dto: UpdateBlogSourceDto) {
    const blogSource = await this.blogSourceRepository.findOneBy({ id });
    if (!blogSource) {
      throw new NotFoundException('Blog source not found');
    }

    if (typeof dto.name === 'string') {
      const normalizedName = dto.name.trim();
      if (normalizedName.length > 0) {
        blogSource.name = normalizedName;
      }
    }

    if (typeof dto.url === 'string') {
      const normalizedUrl = dto.url.trim();
      if (normalizedUrl.length > 0 && normalizedUrl !== blogSource.url) {
        const existing = await this.blogSourceRepository.findOne({
          where: { url: normalizedUrl },
        });
        if (existing && existing.id !== id) {
          throw new ConflictException('이미 등록된 블로그 URL입니다.');
        }
        blogSource.url = normalizedUrl;
      }
    }

    if (typeof dto.iconUrl === 'string') {
      const normalizedIconUrl = dto.iconUrl.trim();
      blogSource.iconUrl = normalizedIconUrl.length > 0 ? normalizedIconUrl : null;
    }

    if (typeof dto.isActive === 'boolean') {
      blogSource.isActive = dto.isActive;
    }

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
