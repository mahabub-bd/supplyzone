import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configure CORS first, before any other middleware
  app.enableCors({
    origin: [
      'http://localhost:8000',
      'http://localhost:5000',
      'http://localhost',

      'http://smartsalepos.shop',
      'https://smartsalepos.shop',
      'http://api.smartsalepos.shop',
      'https://api.smartsalepos.shop',
      'http://51.91.253.223',
      'http://supplyzoneltd.com',
      'https://supplyzoneltd.com',
      'http://api.supplyzoneltd.com',
      'https://api.supplyzoneltd.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
    ],
    exposedHeaders: ['Authorization', 'Content-Disposition'],
    credentials: true,
  });

  app.setGlobalPrefix('v1');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Smart Sale POS API')
    .setDescription('API documentation for Smart Sale POS System')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter token using: Bearer <token>',
        in: 'header',
      },
      'token',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument, {
    customSiteTitle: 'Smart Sale POS – API Docs',
    customfavIcon: 'https://smartsalepos.com/favicon.ico',
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customCss: `
      .topbar { background-color: #0d9488; } 
      .topbar-wrapper span { color: white !important; font-weight: bold; }
      .swagger-ui .info h1 { color: #0d9488; }
      .swagger-ui .scheme-container { background-color: #fafafa; }
      .swagger-ui .opblock.opblock-get { border-color: #0d9488; }
      .swagger-ui .opblock.opblock-post { border-color: #2563eb; }
      .swagger-ui .opblock.opblock-put { border-color: #ca8a04; }
      .swagger-ui .opblock.opblock-delete { border-color: #dc2626; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      displayRequestDuration: true,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  const port = configService.get<number>('PORT') || 8000;
  const host = configService.get<string>('APP_HOST') || 'http://localhost';
  const swaggerPath = configService.get<string>('SWAGGER_PATH') || '/docs';
  // Start server
  await app.listen(port);
  console.log(`🚀 Smart Sale POS API is running on ${host}:${port}`);
  console.log(`📘 Swagger Docs available at ${host}:${port}${swaggerPath}`);
}

bootstrap();
