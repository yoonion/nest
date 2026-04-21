import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BlogSource } from '../blog-source/blog-source.entity';

@Entity()
@Index(['source', 'externalId'], { unique: true })
export class BlogPost {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BlogSource, { onDelete: 'CASCADE' })
  source: BlogSource;

  @Column({ type: 'varchar', length: 500 })
  externalId: string;

  @Column({ type: 'varchar', length: 1000 })
  url: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'datetime' })
  collectedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
