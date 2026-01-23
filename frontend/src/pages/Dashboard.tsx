import { useQuery } from '@tanstack/react-query';
import { Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { itemsApi } from '../api/items';
import { categoriesApi } from '../api/categories';
import Layout from '../components/Layout/Layout';

const Dashboard = () => {
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemsApi.getAll(),
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const totalItens = items.reduce((sum, item) => sum + item.quantidadeTotal, 0);
  const totalDisponivel = items.reduce((sum, item) => sum + item.quantidadeDisponivel, 0);
  const totalEmUso = items.reduce((sum, item) => sum + item.quantidadeEmUso, 0);
  const valorTotal = items.reduce(
    (sum, item) => sum + (item.valorUnitario || 0) * item.quantidadeTotal,
    0
  );

  const itensEstoqueBaixo = items.filter(
    (item) =>
      item.quantidadeDisponivel > 0 &&
      item.quantidadeDisponivel <= (item.estoqueMinimo || 0)
  );

  const stats = [
    {
      title: 'Total de Itens',
      value: totalItens,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Disponível',
      value: totalDisponivel,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Em Uso',
      value: totalEmUso,
      icon: TrendingDown,
      color: 'bg-yellow-500',
    },
    {
      title: 'Estoque Baixo',
      value: itensEstoqueBaixo.length,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ];

  if (itemsLoading || categoriesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-cmoc-primary mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-cmoc-primary mb-1 sm:mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Visão geral do estoque</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((stat) => (
            <div key={stat.title} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-xl sm:text-3xl font-bold text-cmoc-primary">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 sm:p-3 rounded-lg`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="card">
            <h3 className="card-header">Itens por Categoria</h3>
            <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto pr-2">
              {categories.map((category) => {
                const categoryItems = items.filter(
                  (item) => item.categoriaId === category.id
                );
                const total = categoryItems.reduce(
                  (sum, item) => sum + item.quantidadeTotal,
                  0
                );

                return (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg sm:text-2xl">{category.icone}</span>
                      <span className="text-sm sm:text-base text-gray-700 truncate">{category.nome}</span>
                    </div>
                    <span className="font-semibold text-cmoc-primary text-sm sm:text-base">{total}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 className="card-header">Itens com Estoque Baixo</h3>
            {itensEstoqueBaixo.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm sm:text-base">
                Nenhum item com estoque baixo
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto pr-2">
                {itensEstoqueBaixo.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.nome}</p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {item.categoria?.nome}
                      </p>
                    </div>
                    <span className="badge badge-warning whitespace-nowrap">
                      {item.quantidadeDisponivel} restantes
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">Valor Total do Inventário</h3>
          <p className="text-2xl sm:text-4xl font-bold text-cmoc-secondary">
            R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
