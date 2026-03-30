import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // dto 없는 값 필드 제거
    forbidNonWhitelisted: true, // dto 없는 값 넘어오면 ERROR
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
