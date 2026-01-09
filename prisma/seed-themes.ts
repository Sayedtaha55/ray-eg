import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedThemes() {
  const themes = [
    {
      name: 'modern',
      displayName: 'عصري',
      description: 'تصميم عصري بألوان زاهية وخطوط واضحة',
      category: 'modern',
      primary: '#00E5FF',
      secondary: '#BD00FF',
      accent: '#000000',
      background: '#FFFFFF',
      text: '#000000',
      fontFamily: 'Inter',
      borderRadius: '1rem'
    },
    {
      name: 'classic',
      displayName: 'كلاسيكي',
      description: 'تصميم كلاسيكي بألوان هادئة وأنيقة',
      category: 'classic',
      primary: '#2C3E50',
      secondary: '#E74C3C',
      accent: '#34495E',
      background: '#FFFFFF',
      text: '#2C3E50',
      fontFamily: 'Georgia',
      borderRadius: '0.5rem'
    },
    {
      name: 'minimal',
      displayName: 'بسيط',
      description: 'تصميم بسيط ونظيف بألوان محايدة',
      category: 'minimal',
      primary: '#333333',
      secondary: '#666666',
      accent: '#000000',
      background: '#FFFFFF',
      text: '#333333',
      fontFamily: 'Arial',
      borderRadius: '0.25rem'
    },
    {
      name: 'luxury',
      displayName: 'فاخر',
      description: 'تصميم فاخر بألوان ذهبية وغنية',
      category: 'luxury',
      primary: '#D4AF37',
      secondary: '#8B7355',
      accent: '#2C1810',
      background: '#FFFFFF',
      text: '#2C1810',
      fontFamily: 'Playfair Display',
      borderRadius: '0.75rem'
    },
    {
      name: 'nature',
      displayName: 'طبيعي',
      description: 'تصميم طبيعي بألوان خضراء وهادئة',
      category: 'nature',
      primary: '#27AE60',
      secondary: '#8BC34A',
      accent: '#1B5E20',
      background: '#FFFFFF',
      text: '#2E7D32',
      fontFamily: 'Roboto',
      borderRadius: '1.5rem'
    },
    {
      name: 'ocean',
      displayName: 'بحري',
      description: 'تصميم بحري بألوان زرقاء هادئة',
      category: 'ocean',
      primary: '#2196F3',
      secondary: '#00BCD4',
      accent: '#01579B',
      background: '#FFFFFF',
      text: '#0D47A1',
      fontFamily: 'Open Sans',
      borderRadius: '2rem'
    }
  ];

  for (const theme of themes) {
    await prisma.themeTemplate.upsert({
      where: { name: theme.name },
      update: theme,
      create: theme
    });
  }

  console.log('✅ Themes seeded successfully!');
}

seedThemes()
  .catch((e) => {
    console.error('❌ Error seeding themes:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
