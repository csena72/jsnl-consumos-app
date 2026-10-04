import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { UPLOADS_DIR } from './lecturas/lecturas.controller';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  app.useStaticAssets(UPLOADS_DIR, { prefix: '/uploads' });

  const documento = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Consumos App API')
      .setDescription('API REST de la Cooperativa de Agua Potable Tacural')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build(),
  );
  // El prefijo global 'api' no se aplica a setup(): se indica la ruta completa.
  SwaggerModule.setup('api/docs', app, documento);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
