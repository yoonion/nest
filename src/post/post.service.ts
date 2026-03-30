import { Injectable, NotFoundException } from '@nestjs/common';
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
    })

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async createPost(dto: CreatePostDto) {
    const user = await this.userRepository.findOneBy({
      id: dto.userId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const post = this.postRepository.create({
      title: dto.title,
      content: dto.content,
      user,
    });

    return this.postRepository.save(post);
  }

  async updatePost(id: number, dto: UpdatePostDto) {
    const post = await this.postRepository.findOneBy({id});

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    Object.assign(post, dto);

    return this.postRepository.save(post);
  }

  async deletePost(id: number) {
    const post = await this.postRepository.findOneBy({id});

    if (!post) {
      throw new NotFoundException('Post not found');
    }
    await this.postRepository.delete(post.id);

    return { message: 'deleted' };
  }
}
