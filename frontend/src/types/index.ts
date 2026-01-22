export interface User {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  permissao: 'admin' | 'gestor' | 'operador' | 'visualizador';
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  nome: string;
  descricao?: string;
  icone?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
}

export interface Item {
  id: string;
  nome: string;
  descricao?: string;
  categoriaId: string;
  codigoBarras?: string;
  numeroSerie?: string;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  quantidadeEmUso: number;
  localizacao?: string;
  valorUnitario?: number;
  fornecedor?: string;
  observacoes?: string;
  fotoUrl?: string;
  qrCode?: string;
  estoqueMinimo?: number;
  createdAt: string;
  updatedAt: string;
  categoria?: Category;
  entries?: Entry[];
  exits?: Exit[];
}

export interface Entry {
  id: string;
  itemId: string;
  quantidade: number;
  valorTotal?: number;
  notaFiscal?: string;
  fornecedor?: string;
  responsavelId: string;
  dataEntrada: string;
  observacoes?: string;
  createdAt: string;
  item?: Item;
  responsavel?: User;
}

export interface Exit {
  id: string;
  itemId: string;
  quantidade: number;
  responsavelLiberacaoId: string;
  solicitanteId: string;
  destino: string;
  motivoSaida: string;
  previsaoDevolucao?: string;
  dataSaida: string;
  status: 'em_uso' | 'devolvido' | 'baixado';
  observacoes?: string;
  createdAt: string;
  item?: Item;
  responsavelLiberacao?: User;
  solicitante?: User;
  return?: Return;
}

export interface Return {
  id: string;
  exitId: string;
  dataDevolucao: string;
  condicao: 'perfeito' | 'defeito' | 'danificado';
  motivoDefeito?: string;
  necessitaReparo: boolean;
  fotosDefeito?: string;
  responsavelRecebimentoId: string;
  observacoes?: string;
  createdAt: string;
  exit?: Exit;
  responsavelRecebimento?: User;
}

export interface Notification {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  userId: string;
  lida: boolean;
  dataCriacao: string;
  user?: User;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalItens: number;
  totalDisponivel: number;
  totalEmUso: number;
  valorTotal: number;
  categorias: {
    nome: string;
    quantidade: number;
  }[];
  movimentacoes: {
    data: string;
    entradas: number;
    saidas: number;
  }[];
}
