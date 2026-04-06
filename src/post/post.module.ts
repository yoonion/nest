import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Post } from './post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User])],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
