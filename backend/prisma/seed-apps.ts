import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default apps...');

  const apps = [
    {
      key: 'image-editor',
      name: 'محرر الصور',
      description: 'محرر صور احترافي لإنشاء خرائط تفاعلية للمنتجات من صورة واحدة. أضف نقاط ساخنة واربطها بالمنتجات مع تحديد أسعار خاصة.',
      version: '1.0.0',
      permissions: ['products', 'shop'],
      hooks: [],
    },
    {
      key: 'voice-ordering',
      name: 'Voice Ordering',
      description: 'Enable voice-based ordering and AI assistant flows.',
      version: '1.0.0',
      permissions: ['orders', 'products'],
      hooks: ['onOrderCreate'],
    },
    {
      key: 'whatsapp-button',
      name: 'WhatsApp Button',
      description: 'Show a WhatsApp contact button on your storefront.',
      version: '1.0.0',
      permissions: ['shop'],
      hooks: [],
    },
  ];

  for (const app of apps) {
    await prisma.app.upsert({
      where: { key: app.key },
      update: {},
      create: app,
    });
    console.log(`✅ Seeded app: ${app.key}`);
  }

  console.log('✅ Default apps seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding apps:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
