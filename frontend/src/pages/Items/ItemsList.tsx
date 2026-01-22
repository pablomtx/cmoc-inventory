import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { itemsApi } from '../../api/items';
import { categoriesApi } from '../../api/categories';

const ItemsList = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ['items', selectedCategory, search, statusFilter],
    queryFn: () =>
      itemsApi.getAll({
        categoriaId: selectedCategory || undefined,
        search: search || undefined,
        status: statusFilter || undefined,
      }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const getStatusBadge = (item: any) => {
    if (item.quantidadeDisponivel === 0) {
      return <span className="badge badge-danger">Esgotado</span>;
    }
    if (
      item.estoqueMinimo &&
      item.quantidadeDisponivel <= item.estoqueMinimo
    ) {
      return <span className="badge badge-warning">Estoque Baixo</span>;
    }
    return <span className="badge badge-success">Disponível</span>;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cmoc-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cmoc-primary mb-2">Itens</h1>
            <p className="text-gray-600">Gerencie o inventário de itens</p>
          </div>
          <Link to="/items/new" className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Novo Item
          </Link>
        </div>

        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar itens..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="">Todas as categorias</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">Todos os status</option>
              <option value="disponivel">Disponível</option>
              <option value="esgotado">Esgotado</option>
              <option value="estoque_baixo">Estoque Baixo</option>
            </select>

            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setStatusFilter('');
              }}
              className="btn-outline"
            >
              Limpar Filtros
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Item</th>
                  <th className="table-header-cell">Categoria</th>
                  <th className="table-header-cell">Localização</th>
                  <th className="table-header-cell">Total</th>
                  <th className="table-header-cell">Disponível</th>
                  <th className="table-header-cell">Em Uso</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Ações</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="table-cell text-center text-gray-500">
                      Nenhum item encontrado
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          {item.fotoUrl && (
                            <img
                              src={item.fotoUrl}
                              alt={item.nome}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.nome}</p>
                            <p className="text-xs text-gray-500">
                              {item.codigoBarras}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="flex items-center gap-2">
                          {item.categoria?.icone}
                          {item.categoria?.nome}
                        </span>
                      </td>
                      <td className="table-cell">{item.localizacao || '-'}</td>
                      <td className="table-cell">{item.quantidadeTotal}</td>
                      <td className="table-cell">{item.quantidadeDisponivel}</td>
                      <td className="table-cell">{item.quantidadeEmUso}</td>
                      <td className="table-cell">{getStatusBadge(item)}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/items/${item.id}`}
                            className="p-2 hover:bg-gray-100 rounded"
                            title="Ver detalhes"
                          >
                            <Eye size={18} className="text-cmoc-primary" />
                          </Link>
                          <Link
                            to={`/items/${item.id}/edit`}
                            className="p-2 hover:bg-gray-100 rounded"
                            title="Editar"
                          >
                            <Edit size={18} className="text-cmoc-secondary" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ItemsList;
