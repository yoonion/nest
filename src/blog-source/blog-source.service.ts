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

  async createBlogSource(dto: CreateBlogSourceDto) {
    const normalizedUrl = dto.url.trim();
    const existing = await this.blogSourceRepository.findOne({
      where: { url: normalizedUrl },
    });

    if (existing) {
      throw new ConflictException('이미 등록된 블로그 URL입니다.');
    }

    const blogSource = this.blogSourceRepository.create({
      url: normalizedUrl,
      isActive: true,
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
}
