import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // DTO에 없는 값 제거
    forbidNonWhitelisted: true, // 이상한 값 들어오면 에러
    transform: true, // 타입 변환 (string → number)
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
