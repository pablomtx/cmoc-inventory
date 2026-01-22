import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin padrão
  const senhaHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cmoc.com' },
    update: {},
    create: {
      nome: 'Administrador CMOC',
      email: 'admin@cmoc.com',
      senha: senhaHash,
      cargo: 'Administrador de TI',
      permissao: 'admin',
      ativo: true,
    },
  });

  console.log('✅ Usuário admin criado:', admin.email);

  // Criar categorias padrão
  const categorias = [
    { nome: 'Notebooks', descricao: 'Notebooks e laptops', icone: '💻' },
    { nome: 'Desktops', descricao: 'Computadores de mesa', icone: '🖥️' },
    { nome: 'Monitores', descricao: 'Monitores e displays', icone: '🖥️' },
    { nome: 'Periféricos', descricao: 'Teclados, mouses, webcams', icone: '⌨️' },
    { nome: 'Impressoras', descricao: 'Impressoras e multifuncionais', icone: '🖨️' },
    { nome: 'Rede', descricao: 'Switches, roteadores, access points', icone: '🌐' },
    { nome: 'Cabos', descricao: 'Cabos HDMI, USB, rede, energia', icone: '🔌' },
    { nome: 'Componentes', descricao: 'RAM, HD, SSD, placas', icone: '💾' },
    { nome: 'Licenças', descricao: 'Licenças de software', icone: '🔑' },
    { nome: 'Acessórios', descricao: 'Diversos acessórios de TI', icone: '🎧' },
  ];

  for (const cat of categorias) {
    await prisma.category.upsert({
      where: { nome: cat.nome },
      update: {},
      create: cat,
    });
  }

  console.log('✅ Categorias padrão criadas');

  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📧 Login padrão:');
  console.log('   Email: admin@cmoc.com');
  console.log('   Senha: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
