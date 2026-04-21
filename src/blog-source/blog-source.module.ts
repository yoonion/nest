import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogSource } from './blog-source.entity';
import { BlogSourceService } from './blog-source.service';
import { BlogSourceController } from './blog-source.controller';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([BlogSource])],
  controllers: [BlogSourceController],
  providers: [BlogSourceService, RolesGuard],
  exports: [BlogSourceService],
})
export class BlogSourceModule {}
