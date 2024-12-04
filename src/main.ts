import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false, maxParamLength: 300 }),
  );

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  const cors = require('cors');
  app.use(cors());
  await app.register(require('@fastify/helmet'));

  const config = new DocumentBuilder()
    .setTitle('Elixir API')
    .setDescription('The Elixir API description for developers')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(process.env.API_PORT || 4000, '0.0.0.0');
}

bootstrap().then(() => console.log('Server started 🚀🚀🚀'));
