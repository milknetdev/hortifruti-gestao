import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    const validUser = {
      email: `auth-test-${Date.now()}@example.com`,
      password: 'StrongP@ss123',
      name: 'Auth Test User',
    };

    it('deve registrar um novo usuario com dados validos', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(validUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user.email).toBe(validUser.email);
          expect(res.body.user.name).toBe(validUser.name);
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('deve rejeitar registro com email duplicado', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(validUser)
        .expect(409);
    });

    it('deve rejeitar registro sem email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ password: 'StrongP@ss123', name: 'Test' })
        .expect(400);
    });

    it('deve rejeitar registro sem senha', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'no-pass@test.com', name: 'Test' })
        .expect(400);
    });

    it('deve rejeitar registro com senha fraca', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'weak@test.com', password: '123', name: 'Test' })
        .expect(400);
    });

    it('deve rejeitar registro com email invalido', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'not-an-email', password: 'StrongP@ss123', name: 'Test' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    const user = {
      email: `login-test-${Date.now()}@example.com`,
      password: 'LoginP@ss123',
      name: 'Login Test User',
    };

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(user);
    });

    it('deve fazer login com credenciais validas', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: user.email, password: user.password })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
          expect(res.body.user.email).toBe(user.email);
        });
    });

    it('deve rejeitar login com senha incorreta', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: user.email, password: 'wrong-password' })
        .expect(401);
    });

    it('deve rejeitar login com email inexistente', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'whatever' })
        .expect(401);
    });

    it('deve rejeitar login sem campos obrigatorios', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: `refresh-test-${Date.now()}@example.com`,
          password: 'RefreshP@ss123',
          name: 'Refresh Test',
        })
        .then((r) => r);

      // If user doesn't exist, register first
      if (r.status !== 200) {
        const regRes = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            email: `refresh-test-${Date.now()}@example.com`,
            password: 'RefreshP@ss123',
            name: 'Refresh Test',
          });
        refreshToken = regRes.body.refresh_token;
      } else {
        refreshToken = res.body.refresh_token;
      }
    });

    it('deve renovar tokens com refresh token valido', async () => {
      // Register a fresh user for this test
      const regRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: `refresh-valid-${Date.now()}@example.com`,
          password: 'RefreshP@ss123',
          name: 'Refresh Valid Test',
        });

      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refresh_token: regRes.body.refresh_token })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
        });
    });

    it('deve rejeitar refresh token invalido', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refresh_token: 'invalid-token' })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    let accessToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: `me-test-${Date.now()}@example.com`,
          password: 'MeP@ss123',
          name: 'Me Test User',
        });
      accessToken = res.body.access_token;
    });

    it('deve retornar dados do usuario autenticado', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('name');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('deve rejeitar acesso sem token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });

    it('deve rejeitar acesso com token invalido', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('deve rejeitar acesso com formato de auth header invalido', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('deve fazer logout com sucesso', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: `logout-test-${Date.now()}@example.com`,
          password: 'LogoutP@ss123',
          name: 'Logout Test',
        });

      return request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${res.body.access_token}`)
        .expect(200);
    });
  });
});
