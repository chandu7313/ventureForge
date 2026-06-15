import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Validation & Error Handling
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('StartupSaarthi AI API')
    .setDescription('The backend API for StartupSaarthi AI validation platform.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Graceful Shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 API is running on: http://localhost:${port}`);
}
bootstrap();
