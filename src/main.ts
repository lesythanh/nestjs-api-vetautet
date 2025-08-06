import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { MyLogger } from './logger/my.logger';
import { MyLoggerDev } from './logger/my.logger.dev';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestApplication>(AppModule, {
    // logger: new MyLogger(),
    // bufferLogs: true,
  });
  app.useLogger(new MyLogger());
  app.useGlobalPipes(new ValidationPipe());
  //enable CORS
  app.enableCors();

  app.useStaticAssets(join(__dirname, '../uploads'), {
    prefix: '/uploads',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
