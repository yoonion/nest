import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BlogPost } from '../blog-post/blog-post.entity';

@Entity()
export class BlogSource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 500 })
  url: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  rssUrl: string | null;

  @Column({ type: 'datetime', nullable: true })
  lastCollectedAt: Date | null;

  @OneToMany(() => BlogPost, (post) => post.source)
  posts: BlogPost[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
