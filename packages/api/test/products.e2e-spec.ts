import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let adminToken: string;
  let createdProductId: string;

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

    // Registrar e logar usuario admin
    const adminRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `admin-products-${Date.now()}@example.com`,
        password: 'AdminP@ss123',
        name: 'Admin Products Test',
      });
    adminToken = adminRes.body.access_token;

    // Registrar usuario comum
    const userRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `user-products-${Date.now()}@example.com`,
        password: 'UserP@ss123',
        name: 'User Products Test',
      });
    accessToken = userRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /products', () => {
    it('deve listar produtos paginados', () => {
      return request(app.getHttpServer())
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('deve filtrar produtos por nome', () => {
      return request(app.getHttpServer())
        .get('/api/v1/products?search=banana')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
        });
    });

    it('deve filtrar produtos por categoria', () => {
      return request(app.getHttpServer())
        .get('/api/v1/products?category=frutas')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('deve rejeitar acesso sem autenticacao', () => {
      return request(app.getHttpServer())
        .get('/api/v1/products')
        .expect(401);
    });

    it('deve suportar paginacao', () => {
      return request(app.getHttpServer())
        .get('/api/v1/products?page=1&limit=5')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta).toHaveProperty('limit');
          expect(res.body.meta).toHaveProperty('total');
        });
    });

    it('deve suportar ordenacao', () => {
      return request(app.getHttpServer())
        .get('/api/v1/products?sortBy=price&sortOrder=asc')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  describe('POST /products', () => {
    const newProduct = {
      name: 'Produto Teste E2E',
      description: 'Produto criado durante teste E2E',
      price: 9.99,
      unit: 'kg',
      sku: 'TEST-E2E-001',
      stock: 100,
      weight: 0.5,
    };

    it('deve criar um novo produto', () => {
      return request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProduct)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(newProduct.name);
          expect(res.body.price).toBe(newProduct.price);
          createdProductId = res.body.id;
        });
    });

    it('deve rejeitar produto sem nome', () => {
      return request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...newProduct, name: undefined })
        .expect(400);
    });

    it('deve rejeitar produto com preco negativo', () => {
      return request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...newProduct, price: -5 })
        .expect(400);
    });
  });

  describe('GET /products/:id', () => {
    it('deve retornar um produto por ID', () => {
      if (!createdProductId) return;
      return request(app.getHttpServer())
        .get(`/api/v1/products/${createdProductId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('price');
        });
    });

    it('deve retornar 404 para produto inexistente', () => {
      return request(app.getHttpServer())
        .get('/api/v1/products/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('PATCH /products/:id', () => {
    it('deve atualizar um produto existente', () => {
      if (!createdProductId) return;
      return request(app.getHttpServer())
        .patch(`/api/v1/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 12.99 })
        .expect(200)
        .expect((res) => {
          expect(res.body.price).toBe(12.99);
        });
    });
  });

  describe('DELETE /products/:id', () => {
    it('deve excluir um produto', () => {
      if (!createdProductId) return;
      return request(app.getHttpServer())
        .delete(`/api/v1/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('deve retornar 404 ao excluir produto ja excluido', () => {
      if (!createdProductId) return;
      return request(app.getHttpServer())
        .delete(`/api/v1/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
