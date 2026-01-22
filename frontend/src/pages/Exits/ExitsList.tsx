import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Layout from '../../components/Layout/Layout';
import { exitsApi } from '../../api/exits';
import { itemsApi } from '../../api/items';
import { usersApi } from '../../api/users';
import { Exit } from '../../types';

const MOTIVOS_SAIDA = [
  'Manutenção',
  'Instalação',
  'Empréstimo',
  'Substituição',
  'Teste',
  'Descarte',
  'Outro',
];

const ExitsList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    itemId: '',
    quantidade: '',
    solicitanteId: '',
    destino: '',
    motivoSaida: '',
    previsaoDevolucao: '',
    observacoes: '',
  });
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const { data: exits = [], isLoading } = useQuery({
    queryKey: ['exits'],
    queryFn: () => exitsApi.getAll(),
  });

  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemsApi.getAll(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: exitsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exits'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      closeModal();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Erro ao criar saída');
    },
  });

  const openModal = () => {
    setFormData({
      itemId: '',
      quantidade: '',
      solicitanteId: '',
      destino: '',
      motivoSaida: '',
      previsaoDevolucao: '',
      observacoes: '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    createMutation.mutate(formData as any);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'em_uso':
        return <span className="badge badge-warning">Em Uso</span>;
      case 'devolvido':
        return <span className="badge badge-success">Devolvido</span>;
      case 'baixado':
        return <span className="badge badge-danger">Baixado</span>;
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  const selectedItem = items.find((i) => i.id === formData.itemId);

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
            <h1 className="text-2xl font-bold text-cmoc-primary mb-2">Saídas</h1>
            <p className="text-gray-600">Registre a saída de materiais</p>
          </div>
          <button onClick={openModal} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Nova Saída
          </button>
        </div>

        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Data</th>
                  <th className="table-header-cell">Item</th>
                  <th className="table-header-cell">Qtd</th>
                  <th className="table-header-cell">Solicitante</th>
                  <th className="table-header-cell">Destino</th>
                  <th className="table-header-cell">Motivo</th>
                  <th className="table-header-cell">Prev. Devolução</th>
                  <th className="table-header-cell">Status</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {exits.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="table-cell text-center text-gray-500">
                      Nenhuma saída registrada
                    </td>
                  </tr>
                ) : (
                  exits.map((exit: Exit) => (
                    <tr key={exit.id}>
                      <td className="table-cell">
                        {format(new Date(exit.dataSaida), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </td>
                      <td className="table-cell">
                        <div>
                          <p className="font-medium">{exit.item?.nome}</p>
                          <p className="text-xs text-gray-500">
                            {exit.item?.categoria?.nome}
                          </p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="badge badge-danger">-{exit.quantidade}</span>
                      </td>
                      <td className="table-cell">{exit.solicitante?.nome}</td>
                      <td className="table-cell">{exit.destino}</td>
                      <td className="table-cell">{exit.motivoSaida}</td>
                      <td className="table-cell">
                        {exit.previsaoDevolucao
                          ? format(new Date(exit.previsaoDevolucao), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })
                          : '-'}
                      </td>
                      <td className="table-cell">{getStatusBadge(exit.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-cmoc-primary">Nova Saída</h2>
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
                    {items
                      .filter((item) => item.quantidadeDisponivel > 0)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nome} (Disponível: {item.quantidadeDisponivel})
                        </option>
                      ))}
                  </select>
                  {selectedItem && (
                    <p className="text-sm text-gray-500 mt-1">
                      Disponível: {selectedItem.quantidadeDisponivel} | Em uso:{' '}
                      {selectedItem.quantidadeEmUso}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedItem?.quantidadeDisponivel || 1}
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
                      Solicitante *
                    </label>
                    <select
                      value={formData.solicitanteId}
                      onChange={(e) =>
                        setFormData({ ...formData, solicitanteId: e.target.value })
                      }
                      className="input-field"
                      required
                    >
                      <option value="">Selecione...</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destino *
                  </label>
                  <input
                    type="text"
                    value={formData.destino}
                    onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                    className="input-field"
                    placeholder="Ex: Sala 101, Setor Administrativo"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motivo *
                    </label>
                    <select
                      value={formData.motivoSaida}
                      onChange={(e) =>
                        setFormData({ ...formData, motivoSaida: e.target.value })
                      }
                      className="input-field"
                      required
                    >
                      <option value="">Selecione...</option>
                      {MOTIVOS_SAIDA.map((motivo) => (
                        <option key={motivo} value={motivo}>
                          {motivo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Previsão de Devolução
                    </label>
                    <input
                      type="date"
                      value={formData.previsaoDevolucao}
                      onChange={(e) =>
                        setFormData({ ...formData, previsaoDevolucao: e.target.value })
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
                    {createMutation.isPending ? 'Salvando...' : 'Registrar Saída'}
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

export default ExitsList;
