import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Construir lista de orígenes permitidos: CLIENT_URL (comma separated) + orígenes de desarrollo comunes
  const envOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(s => s.trim()) : [];
  const defaultDevOrigins = ['http://localhost:4200', 'http://localhost:4300', 'http://localhost:4400'];
  const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultDevOrigins])).filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // peticiones sin origin (curl, servidor) se permiten
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // en desarrollo, si no se configuró CLIENT_URL, permitir temporalmente cualquier origen
      if (process.env.NODE_ENV !== 'production' && allowedOrigins.length === defaultDevOrigins.length) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: origin not allowed'), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    credentials: true,
    maxAge: 600,
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  console.log(`Server listening on port ${port}`);
}
bootstrap();
