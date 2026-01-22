import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Layout from '../../components/Layout/Layout';
import { entriesApi } from '../../api/entries';
import { itemsApi } from '../../api/items';
import { Entry } from '../../types';

const EntriesList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    itemId: '',
    quantidade: '',
    valorTotal: '',
    notaFiscal: '',
    fornecedor: '',
    observacoes: '',
  });
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['entries'],
    queryFn: () => entriesApi.getAll(),
  });

  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: entriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      closeModal();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Erro ao criar entrada');
    },
  });

  const openModal = () => {
    setFormData({
      itemId: '',
      quantidade: '',
      valorTotal: '',
      notaFiscal: '',
      fornecedor: '',
      observacoes: '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      itemId: '',
      quantidade: '',
      valorTotal: '',
      notaFiscal: '',
      fornecedor: '',
      observacoes: '',
    });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    createMutation.mutate(formData as any);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cmoc-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cmoc-primary mb-2">Entradas</h1>
            <p className="text-gray-600">Registre a entrada de novos materiais</p>
          </div>
          <button onClick={openModal} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Nova Entrada
          </button>
        </div>

        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Data</th>
                  <th className="table-header-cell">Item</th>
                  <th className="table-header-cell">Quantidade</th>
                  <th className="table-header-cell">Valor Total</th>
                  <th className="table-header-cell">Nota Fiscal</th>
                  <th className="table-header-cell">Fornecedor</th>
                  <th className="table-header-cell">Responsável</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-cell text-center text-gray-500">
                      Nenhuma entrada registrada
                    </td>
                  </tr>
                ) : (
                  entries.map((entry: Entry) => (
                    <tr key={entry.id}>
                      <td className="table-cell">
                        {format(new Date(entry.dataEntrada), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </td>
                      <td className="table-cell">
                        <div>
                          <p className="font-medium">{entry.item?.nome}</p>
                          <p className="text-xs text-gray-500">
                            {entry.item?.categoria?.nome}
                          </p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="badge badge-success">+{entry.quantidade}</span>
                      </td>
                      <td className="table-cell">
                        {entry.valorTotal
                          ? `R$ ${entry.valorTotal.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}`
                          : '-'}
                      </td>
                      <td className="table-cell">{entry.notaFiscal || '-'}</td>
                      <td className="table-cell">{entry.fornecedor || '-'}</td>
                      <td className="table-cell">{entry.responsavel?.nome}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-cmoc-primary">Nova Entrada</h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded">
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item *
                  </label>
                  <select
                    value={formData.itemId}
                    onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Selecione um item...</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nome} - {item.categoria?.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantidade}
                      onChange={(e) =>
                        setFormData({ ...formData, quantidade: e.target.value })
                      }
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Total (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.valorTotal}
                      onChange={(e) =>
                        setFormData({ ...formData, valorTotal: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nota Fiscal
                    </label>
                    <input
                      type="text"
                      value={formData.notaFiscal}
                      onChange={(e) =>
                        setFormData({ ...formData, notaFiscal: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fornecedor
                    </label>
                    <input
                      type="text"
                      value={formData.fornecedor}
                      onChange={(e) =>
                        setFormData({ ...formData, fornecedor: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, observacoes: e.target.value })
                    }
                    className="input-field"
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn-outline flex-1">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="btn-primary flex-1"
                  >
                    {createMutation.isPending ? 'Salvando...' : 'Registrar Entrada'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EntriesList;
