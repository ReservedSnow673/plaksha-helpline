import 'reflect-metadata';
import './env';

import { loadConfig } from '@plaksha/shared-config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { RedisIoAdapter } from './modules/websocket/redis-io.adapter';
import { ProblemDetailsFilter } from './common/filters/problem-details.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
  const config = loadConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();
  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
  app.enableCors({
    origin: config.corsAllowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });
  app.setGlobalPrefix('v1', { exclude: ['health', 'health/ready'] });
  app.useGlobalFilters(new ProblemDetailsFilter());

  const redisAdapter = new RedisIoAdapter(app, config.redis.url);
  await redisAdapter.connectToRedis();
  app.useWebSocketAdapter(redisAdapter);

  if (config.nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Plaksha Helpline API')
      .setDescription('Emergency response platform internal API')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, { swaggerOptions: { persistAuthorization: true } });
  }

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`[api] listening on port ${port} env=${config.nodeEnv}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[api] fatal bootstrap error', err);
  process.exit(1);
});
