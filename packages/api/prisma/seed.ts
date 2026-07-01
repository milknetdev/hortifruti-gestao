import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  const customerPassword = await bcrypt.hash('Cliente@123', 12);

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'hortifruti-central' },
    update: {},
    create: { name: 'HortiFruti Central', slug: 'hortifruti-central', active: true },
  });
  console.log('Tenant criado:', tenant.name);

  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@hortifruti.com' } },
    update: {},
    create: {
      email: 'admin@hortifruti.com', password: hashedPassword, name: 'Administrador',
      role: 'SUPER_ADMIN', tenant: { connect: { id: tenant.id } }, active: true,
    },
  });
  console.log('Admin criado:', admin.email);

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'funcionario@hortifruti.com' } },
    update: {},
    create: {
      email: 'funcionario@hortifruti.com', password: hashedPassword, name: 'Funcionario Teste',
      role: 'EMPLOYEE', tenant: { connect: { id: tenant.id } }, active: true,
    },
  });

  const customer = await prisma.customer.upsert({
    where: { tenantId_email: { email: 'cliente@email.com', tenantId: tenant.id } },
    update: {},
    create: {
      email: 'cliente@email.com', password: customerPassword, name: 'Maria Santos',
      phone: '(11) 99999-9999', cpf: '123.456.789-00',
      tenant: { connect: { id: tenant.id } }, active: true,
    },
  });
  console.log('Cliente criado:', customer.email);

  const categoriesData = [
    { name: 'Frutas', slug: 'frutas', icon: '🍎', color: '#ef4444', sortOrder: 1 },
    { name: 'Verduras', slug: 'verduras', icon: '🥬', color: '#22c55e', sortOrder: 2 },
    { name: 'Legumes', slug: 'legumes', icon: '🥕', color: '#f97316', sortOrder: 3 },
    { name: 'Temperos e Ervas', slug: 'temperos', icon: '🌿', color: '#10b981', sortOrder: 4 },
    { name: 'Organicos', slug: 'organicos', icon: '🌱', color: '#84cc16', sortOrder: 5 },
    { name: 'Bebidas', slug: 'bebidas', icon: '🥤', color: '#06b6d4', sortOrder: 6 },
    { name: 'Graos e Cereais', slug: 'graos', icon: '🌾', color: '#d97706', sortOrder: 7 },
    { name: 'Ovos e Laticinios', slug: 'ovos-laticinios', icon: '🥚', color: '#fbbf24', sortOrder: 8 },
    { name: 'Panificacao', slug: 'panificacao', icon: '🍞', color: '#a855f7', sortOrder: 9 },
    { name: 'Congelados', slug: 'congelados', icon: '🧊', color: '#3b82f6', sortOrder: 10 },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: cat.slug } },
      update: {},
      create: { ...cat, tenant: { connect: { id: tenant.id } }, active: true },
    });
  }
  console.log('Categorias criadas:', categoriesData.length);

  const productsData = [
    { name: 'Banana Prata', slug: 'banana-prata', category: 'frutas', costPrice: 2.5, salePrice: 4.99, stock: 100, minStock: 20, weight: 1, unit: 'KG', featured: true },
    { name: 'Maca Fuji', slug: 'maca-fuji', category: 'frutas', costPrice: 4, salePrice: 7.99, stock: 80, minStock: 15, weight: 1, unit: 'KG' },
    { name: 'Laranja Pera', slug: 'laranja-pera', category: 'frutas', costPrice: 2, salePrice: 3.99, stock: 150, minStock: 30, weight: 1, unit: 'KG' },
    { name: 'Limao Tahiti', slug: 'limao-tahiti', category: 'frutas', costPrice: 2, salePrice: 4.49, stock: 100, minStock: 20, weight: 1, unit: 'KG', featured: true },
    { name: 'Mamao Formosa', slug: 'mamao-formosa', category: 'frutas', costPrice: 3, salePrice: 5.99, stock: 50, minStock: 10, weight: 1, unit: 'KG' },
    { name: 'Abacaxi', slug: 'abacaxi', category: 'frutas', costPrice: 3, salePrice: 6.99, stock: 40, minStock: 8, weight: 1.5, unit: 'UN' },
    { name: 'Alface Crespa', slug: 'alface-crespa', category: 'verduras', costPrice: 1.5, salePrice: 3.49, stock: 60, minStock: 15, weight: 0.2, unit: 'UN' },
    { name: 'Couve', slug: 'couve', category: 'verduras', costPrice: 1.5, salePrice: 2.99, stock: 50, minStock: 10, weight: 0.3, unit: 'PCT' },
    { name: 'Espinafre', slug: 'espinafre', category: 'verduras', costPrice: 2, salePrice: 4.49, stock: 40, minStock: 10, weight: 0.3, unit: 'PCT' },
    { name: 'Brocolis', slug: 'brocolis', category: 'verduras', costPrice: 3.5, salePrice: 6.99, stock: 45, minStock: 10, weight: 0.5, unit: 'KG' },
    { name: 'Rucula', slug: 'rucula', category: 'verduras', costPrice: 1.5, salePrice: 3.49, stock: 35, minStock: 8, weight: 0.1, unit: 'PCT' },
    { name: 'Agriao', slug: 'agriao', category: 'verduras', costPrice: 2, salePrice: 3.99, stock: 30, minStock: 8, weight: 0.1, unit: 'PCT' },
    { name: 'Tomate', slug: 'tomate', category: 'legumes', costPrice: 3, salePrice: 5.99, stock: 120, minStock: 25, weight: 1, unit: 'KG', featured: true },
    { name: 'Cenoura', slug: 'cenoura', category: 'legumes', costPrice: 2, salePrice: 4.49, stock: 100, minStock: 20, weight: 1, unit: 'KG' },
    { name: 'Batata', slug: 'batata', category: 'legumes', costPrice: 2.5, salePrice: 4.99, stock: 150, minStock: 30, weight: 1, unit: 'KG' },
    { name: 'Cebola', slug: 'cebola', category: 'legumes', costPrice: 1.8, salePrice: 3.99, stock: 100, minStock: 20, weight: 1, unit: 'KG' },
    { name: 'Abobrinha', slug: 'abobrinha', category: 'legumes', costPrice: 2.5, salePrice: 4.99, stock: 60, minStock: 10, weight: 1, unit: 'KG' },
    { name: 'Berinjela', slug: 'berinjela', category: 'legumes', costPrice: 3, salePrice: 5.99, stock: 40, minStock: 8, weight: 1, unit: 'KG' },
    { name: 'Batata Doce', slug: 'batata-doce', category: 'legumes', costPrice: 3, salePrice: 5.99, stock: 80, minStock: 15, weight: 1, unit: 'KG' },
    { name: 'Pimentao Verde', slug: 'pimentao-verde', category: 'legumes', costPrice: 3.5, salePrice: 6.49, stock: 50, minStock: 10, weight: 0.5, unit: 'KG' },
    { name: 'Chuchu', slug: 'chuchu', category: 'legumes', costPrice: 1.5, salePrice: 3.49, stock: 70, minStock: 15, weight: 1, unit: 'KG' },
    { name: 'Cebolinha', slug: 'cebolinha', category: 'temperos', costPrice: 1, salePrice: 2.49, stock: 90, minStock: 20, weight: 0.05, unit: 'UN' },
    { name: 'Salsinha', slug: 'salsinha', category: 'temperos', costPrice: 1, salePrice: 2.49, stock: 100, minStock: 20, weight: 0.05, unit: 'UN' },
    { name: 'Coentro', slug: 'coentro', category: 'temperos', costPrice: 1.2, salePrice: 2.99, stock: 80, minStock: 15, weight: 0.05, unit: 'UN' },
    { name: 'Hortela', slug: 'hortela', category: 'temperos', costPrice: 1.5, salePrice: 3.49, stock: 50, minStock: 10, weight: 0.03, unit: 'UN' },
    { name: 'Gengibre', slug: 'gengibre', category: 'temperos', costPrice: 8, salePrice: 14.99, stock: 30, minStock: 5, weight: 0.2, unit: 'KG' },
    { name: 'Alho', slug: 'alho', category: 'temperos', costPrice: 15, salePrice: 24.99, stock: 40, minStock: 10, weight: 0.1, unit: 'KG' },
    { name: 'Tomate Organico', slug: 'tomate-organico', category: 'organicos', costPrice: 5, salePrice: 9.99, stock: 30, minStock: 10, weight: 1, unit: 'KG', featured: true },
    { name: 'Alface Organica', slug: 'alface-organica', category: 'organicos', costPrice: 3, salePrice: 6.49, stock: 40, minStock: 10, weight: 0.3, unit: 'UN' },
    { name: 'Banana Organica', slug: 'banana-organica', category: 'organicos', costPrice: 4.5, salePrice: 8.99, stock: 50, minStock: 10, weight: 1, unit: 'KG' },
    { name: 'Cenoura Organica', slug: 'cenoura-organica', category: 'organicos', costPrice: 4, salePrice: 7.99, stock: 35, minStock: 8, weight: 1, unit: 'KG' },
    { name: 'Maca Organica', slug: 'maca-organica', category: 'organicos', costPrice: 6, salePrice: 11.99, stock: 25, minStock: 5, weight: 1, unit: 'KG', promotional: true, promotionalPrice: 8.99 },
  ];

  const catMap: Record<string, string> = {};
  const allCats = await prisma.category.findMany({ where: { tenantId: tenant.id } });
  allCats.forEach((c: any) => { catMap[c.slug] = c.id; });

  for (const prod of productsData) {
    const catId = catMap[prod.category];
    if (!catId) continue;
    const profitMargin = ((prod.salePrice - prod.costPrice) / prod.costPrice * 100).toFixed(2);
    await prisma.product.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: prod.slug } },
      update: {},
      create: {
        name: prod.name, slug: prod.slug,
        category: { connect: { id: catId } },
        costPrice: prod.costPrice, salePrice: prod.salePrice,
        promotionalPrice: prod.promotionalPrice || null,
        profitMargin: parseFloat(profitMargin),
        stock: prod.stock, minStock: prod.minStock,
        weight: prod.weight, unit: prod.unit,
        available: true, featured: prod.featured || false,
        promotional: prod.promotional || false, active: true,
        tenant: { connect: { id: tenant.id } },
        description: prod.name + ' fresco e de qualidade.',
      },
    });
  }
  console.log('Produtos criados:', productsData.length);

  // Create delivery zones (match schema fields)
  const zones = [
    { name: 'Centro', fee: 5.99, estimatedMinutes: 30, neighborhoods: 'Centro, Republica, Liberdade', cities: 'Sao Paulo', zipCodes: '01000-000 a 01099-999' },
    { name: 'Zona Leste', fee: 9.99, estimatedMinutes: 45, neighborhoods: 'Tatuape, Mooca, Penha', cities: 'Sao Paulo', zipCodes: '03000-000 a 03999-999' },
    { name: 'Zona Sul', fee: 12.99, estimatedMinutes: 60, neighborhoods: 'Vila Mariana, Moema, Ipiranga', cities: 'Sao Paulo', zipCodes: '04000-000 a 04999-999' },
  ];

  for (const zone of zones) {
    const existing = await prisma.deliveryZone.findFirst({ where: { name: zone.name, tenantId: tenant.id } });
    if (!existing) {
      await prisma.deliveryZone.create({
        data: {
          name: zone.name, fee: zone.fee, estimatedMinutes: zone.estimatedMinutes,
          neighborhoods: zone.neighborhoods, cities: zone.cities, zipCodes: zone.zipCodes,
          tenant: { connect: { id: tenant.id } }, active: true,
          freeAbove: 100, estimatedDays: 1, availableDays: '[1,2,3,4,5,6]', startTime: '08:00', endTime: '20:00',
        },
      });
    }
  }
  console.log('Zonas de entrega criadas:', zones.length);

  // Create coupons (match schema - requires validFrom/validUntil)
  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  const couponsData = [
    { code: 'BEMVINDO10', type: 'PERCENTAGE', value: 10, minOrderValue: 30, usageLimit: 1000 },
    { code: 'FTEGRATIS', type: 'FREE_SHIPPING', value: 0, minOrderValue: 50, usageLimit: 500 },
    { code: 'DESCONTO15', type: 'FIXED', value: 15, minOrderValue: 60, usageLimit: 200 },
  ];

  for (const coupon of couponsData) {
    await prisma.coupon.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: coupon.code } },
      update: {},
      create: {
        code: coupon.code, type: coupon.type, value: coupon.value,
        minOrderValue: coupon.minOrderValue, usageLimit: coupon.usageLimit,
        tenant: { connect: { id: tenant.id } },
        active: true, usageCount: 0, validFrom: now, validUntil: nextYear,
      },
    });
  }
  console.log('Cupons criados:', couponsData.length);

  // Create banners (requires image field)
  const bannersData = [
    { title: 'Frutas Frescas', subtitle: 'As melhores frutas da estacao', sortOrder: 1, link: '/produtos?category=frutas', image: '/banners/frutas.jpg' },
    { title: 'Organicos Direto do Campo', subtitle: 'Produtos organicos certificados', sortOrder: 2, link: '/produtos?category=organicos', image: '/banners/organicos.jpg' },
    { title: 'Entrega Gratis', subtitle: 'Em compras acima de R$100', sortOrder: 3, link: '/produtos', image: '/banners/entrega.jpg' },
  ];

  for (const banner of bannersData) {
    const existing = await prisma.banner.findFirst({ where: { title: banner.title, tenantId: tenant.id } });
    if (!existing) {
      await prisma.banner.create({
        data: { ...banner, tenant: { connect: { id: tenant.id } }, active: true },
      });
    }
  }
  console.log('Banners criados:', bannersData.length);

  console.log('Seed concluido com sucesso!');
}

main()
  .catch((e) => { console.error('Erro no seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
