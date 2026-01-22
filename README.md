# Sistema de Gestão de Estoque CMOC

Sistema completo de gestão de estoque para o setor de TI, com controle de entrada/saída de materiais, histórico de movimentações, registro fotográfico de itens danificados e controle de responsáveis.

## Tecnologias

### Backend
- Node.js + Express + TypeScript
- Prisma ORM + SQLite
- JWT para autenticação
- Multer para upload de arquivos
- bcrypt para hash de senhas
- QRCode para geração de códigos

### Frontend
- React + TypeScript
- Vite (build tool)
- Tailwind CSS (estilização)
- React Router (navegação)
- React Query (cache e sincronização)
- Zustand (gerenciamento de estado)
- Axios (requisições HTTP)

## Cores da Marca CMOC

- **Primary (Roxo Escuro)**: `#1e1547`
- **Secondary (Verde)**: `#6cb52d`
- **Dark (Roxo Mais Escuro)**: `#130f2e`
- **Accent (Roxo Médio)**: `#4a3f7a`
- **Light (Cinza Claro)**: `#f8f9fa`

## Funcionalidades

### Implementadas
- ✅ Autenticação com JWT
- ✅ Dashboard com estatísticas
- ✅ Gestão de Categorias
- ✅ Gestão de Itens (CRUD)
- ✅ Upload de fotos de itens
- ✅ Geração automática de QR Code
- ✅ Controle de Entradas
- ✅ Controle de Saídas
- ✅ Devoluções com registro de condição
- ✅ Upload múltiplo de fotos de defeitos
- ✅ Gestão de Usuários e Permissões
- ✅ Sistema de permissões (Admin, Gestor, Operador, Visualizador)

### Em Desenvolvimento
- Sistema de Notificações
- Scanner de QR Code
- Relatórios e Exportação
- Alertas de estoque baixo
- Histórico detalhado de movimentações

## Instalação e Configuração

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Passo 1: Instalar Dependências

```bash
# Backend
cd backend
npm install

# Frontend (em outro terminal)
cd frontend
npm install
```

### Passo 2: Configurar Banco de Dados

```bash
cd backend

# Gerar cliente Prisma
npx prisma generate

# Executar migrations
npx prisma migrate dev --name init

# Popular banco com dados iniciais
npm run prisma:seed
```

### Passo 3: Iniciar o Projeto

```bash
# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
cd frontend
npm run dev
```

O sistema estará disponível em:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Credenciais Padrão

**Login de Administrador:**
- Email: `admin@cmoc.com`
- Senha: `admin123`

## Estrutura do Banco de Dados

### Principais Tabelas

1. **users** - Usuários do sistema
2. **categories** - Categorias de itens
3. **items** - Itens/materiais do estoque
4. **entries** - Entradas de materiais
5. **exits** - Saídas de materiais
6. **returns** - Devoluções de materiais
7. **notifications** - Notificações do sistema

## Permissões de Usuário

### Admin
- Controle total do sistema
- Gerenciar usuários
- Todas as operações CRUD

### Gestor
- Liberar itens
- Visualizar relatórios
- Gerenciar categorias
- Registrar entradas/saídas

### Operador
- Registrar entradas/saídas
- Visualizar itens
- Registrar devoluções

### Visualizador
- Apenas consulta
- Visualizar itens e relatórios

## Fluxo de Trabalho

### 1. Cadastrar Item
1. Acessar "Itens" > "Novo Item"
2. Preencher informações básicas
3. Fazer upload de foto (opcional)
4. QR Code é gerado automaticamente
5. Salvar item

### 2. Registrar Entrada
1. Acessar "Entradas" > "Nova Entrada"
2. Selecionar item
3. Informar quantidade e fornecedor
4. Estoque é atualizado automaticamente

### 3. Registrar Saída
1. Acessar "Saídas" > "Nova Saída"
2. Selecionar item e quantidade
3. Informar solicitante, destino e motivo
4. Estoque disponível é reduzido

### 4. Registrar Devolução
1. Acessar "Devoluções" > "Nova Devolução"
2. Selecionar a saída correspondente
3. Avaliar condição do item:
   - **Perfeito**: volta ao estoque disponível
   - **Defeito**: volta ao estoque, marca como necessita reparo
   - **Danificado**: baixa permanente do item
4. Upload de fotos se houver defeitos
5. Estoque é atualizado conforme condição

## Scripts Disponíveis

### Backend
```bash
npm run dev          # Inicia servidor em modo desenvolvimento
npm run build        # Compila TypeScript
npm start            # Inicia servidor em produção
npm run prisma:generate  # Gera cliente Prisma
npm run prisma:migrate   # Executa migrations
npm run prisma:seed      # Popula banco com dados iniciais
```

### Frontend
```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build de produção
```

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário logado

### Itens
- `GET /api/items` - Listar itens
- `GET /api/items/:id` - Obter item por ID
- `GET /api/items/qrcode/:qrCode` - Obter item por QR Code
- `POST /api/items` - Criar item
- `PUT /api/items/:id` - Atualizar item
- `DELETE /api/items/:id` - Deletar item

### Categorias
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria
- `PUT /api/categories/:id` - Atualizar categoria
- `DELETE /api/categories/:id` - Deletar categoria

### Entradas
- `GET /api/entries` - Listar entradas
- `POST /api/entries` - Criar entrada
- `PUT /api/entries/:id` - Atualizar entrada
- `DELETE /api/entries/:id` - Deletar entrada

### Saídas
- `GET /api/exits` - Listar saídas
- `POST /api/exits` - Criar saída
- `PUT /api/exits/:id` - Atualizar saída
- `DELETE /api/exits/:id` - Deletar saída

### Devoluções
- `GET /api/returns` - Listar devoluções
- `POST /api/returns` - Criar devolução
- `PUT /api/returns/:id` - Atualizar devolução
- `DELETE /api/returns/:id` - Deletar devolução

### Usuários
- `GET /api/users` - Listar usuários (Admin)
- `POST /api/users` - Criar usuário (Admin)
- `PUT /api/users/:id` - Atualizar usuário (Admin)
- `DELETE /api/users/:id` - Deletar usuário (Admin)

## Desenvolvimento

### Adicionar Nova Categoria Padrão

Editar `backend/prisma/seed.ts` e adicionar a categoria no array.

### Adicionar Novo Usuário

Via interface web (Admin) ou diretamente no seed.

### Customizar Cores

Editar `frontend/tailwind.config.js` na seção `colors.cmoc`.

## Melhorias Futuras

- [ ] Scanner QR Code via webcam
- [ ] Notificações em tempo real
- [ ] Relatórios em PDF/Excel
- [ ] Sistema de reserva de itens
- [ ] Alertas de estoque mínimo
- [ ] Dashboard com gráficos avançados
- [ ] Sistema de manutenção de equipamentos
- [ ] Histórico completo de auditoria
- [ ] App mobile (PWA)
- [ ] Integração com sistemas externos

## Suporte

Para dúvidas ou problemas, abra uma issue ou entre em contato com a equipe de TI da CMOC.

## Licença

Propriedade da CMOC. Todos os direitos reservados.

---

**Desenvolvido com ❤️ para CMOC**
