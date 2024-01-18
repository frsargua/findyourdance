import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  connsole.log('hello world');
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
