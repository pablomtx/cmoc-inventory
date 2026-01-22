# Guia de Início Rápido - Sistema CMOC

## Instalação Rápida (3 minutos)

### 1. Instalar Dependências

Abra **dois terminais** no diretório do projeto.

**Terminal 1 - Backend:**
```bash
cd backend
npm install
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
```

### 2. Configurar Banco de Dados

No **Terminal 1** (backend):
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

Aguarde a mensagem: `🎉 Seed concluído com sucesso!`

### 3. Iniciar o Sistema

**Terminal 1 - Backend:**
```bash
npm run dev
```

Aguarde: `🚀 Servidor rodando em http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Aguarde: `Local: http://localhost:5173/`

### 4. Acessar o Sistema

Abra seu navegador em: **http://localhost:5173**

**Login:**
- Email: `admin@cmoc.com`
- Senha: `admin123`

## Primeiro Uso

### Criar uma Categoria
1. Clique em "Categorias" no menu lateral
2. Clique em "Nova Categoria"
3. Preencha nome, descrição e emoji
4. Salvar

### Cadastrar um Item
1. Clique em "Itens" no menu lateral
2. Clique em "Novo Item"
3. Preencha:
   - Nome do item
   - Categoria
   - Localização (prateleira, sala, etc)
   - Valor unitário
   - Estoque mínimo (opcional)
4. Faça upload de uma foto (opcional)
5. Salvar - QR Code será gerado automaticamente

### Registrar uma Entrada
1. Clique em "Entradas" no menu lateral
2. Clique em "Nova Entrada"
3. Selecione o item
4. Informe quantidade
5. Informe fornecedor e nota fiscal (opcional)
6. Salvar - O estoque será atualizado automaticamente

### Registrar uma Saída
1. Clique em "Saídas" no menu lateral
2. Clique em "Nova Saída"
3. Selecione o item e quantidade
4. Selecione o solicitante (usuário)
5. Informe destino e motivo
6. Salvar - O estoque disponível será reduzido

### Registrar uma Devolução
1. Clique em "Devoluções" no menu lateral
2. Clique em "Nova Devolução"
3. Selecione a saída que está sendo devolvida
4. Avalie a condição:
   - **Perfeito**: Item volta ao estoque normalmente
   - **Defeito**: Item volta mas precisa de reparo
   - **Danificado**: Item é baixado permanentemente
5. Se houver defeito, faça upload de fotos
6. Salvar - O estoque será ajustado conforme a condição

## Criar Novos Usuários

1. Clique em "Usuários" no menu lateral (apenas Admin)
2. Clique em "Novo Usuário"
3. Preencha:
   - Nome
   - Email
   - Senha
   - Cargo
   - Permissão (Admin, Gestor, Operador ou Visualizador)
4. Salvar

## Permissões

- **Admin**: Acesso total
- **Gestor**: Pode gerenciar itens e categorias
- **Operador**: Pode registrar entradas/saídas
- **Visualizador**: Apenas visualização

## Solução de Problemas

### Erro ao iniciar o backend
```bash
cd backend
rm -rf node_modules
npm install
```

### Erro ao iniciar o frontend
```bash
cd frontend
rm -rf node_modules
npm install
```

### Erro no banco de dados
```bash
cd backend
rm prisma/dev.db
npx prisma migrate dev --name init
npm run prisma:seed
```

### Porta já em uso
Se a porta 3000 ou 5173 estiver em uso:
- Backend: Mude em `.env` a variável `PORT`
- Frontend: Mude em `vite.config.ts` a porta do servidor

## Próximos Passos

- Explore o Dashboard para ver estatísticas
- Configure alertas de estoque mínimo
- Imprima QR Codes dos itens
- Gere relatórios de movimentação

## Suporte

Consulte o README.md completo para mais informações.
