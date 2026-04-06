import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  getPosts() {
    return this.postRepository.find({
      relations: ['user'],
    });
  }

  async getPost(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async createPost(dto: CreatePostDto, userId: number) {
    const post = this.postRepository.create({
      ...dto,
      user: { id: userId },
    });

    return this.postRepository.save(post);
  }

  async updatePost(id: number, dto: UpdatePostDto, userId: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // 작성자 인지 체크
    if (post.user.id !== userId) {
      throw new ForbiddenException('You are not the owner');
    }

    Object.assign(post, dto);

    return this.postRepository.save(post);
  }

  async deletePost(id: number, userId: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // 작성자 인지 체크
    if (post.user.id !== userId) {
      throw new ForbiddenException('You are not the owner');
    }

    await this.postRepository.delete(post.id);

    return { message: 'deleted' };
  }
}
