import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Upload, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Layout from '../../components/Layout/Layout';
import { returnsApi } from '../../api/returns';
import { exitsApi } from '../../api/exits';
import { Return } from '../../types';

const ReturnsList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    exitId: '',
    condicao: '',
    motivoDefeito: '',
    necessitaReparo: false,
    observacoes: '',
  });
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotosPreview, setFotosPreview] = useState<string[]>([]);
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const { data: returns = [], isLoading } = useQuery({
    queryKey: ['returns'],
    queryFn: () => returnsApi.getAll(),
  });

  const { data: exits = [] } = useQuery({
    queryKey: ['exits'],
    queryFn: () => exitsApi.getAll({ status: 'em_uso' }),
  });

  const pendingExits = exits.filter((e) => e.status === 'em_uso');

  const createMutation = useMutation({
    mutationFn: (data: FormData) => returnsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['exits'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      closeModal();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Erro ao registrar devolução');
    },
  });

  const openModal = () => {
    setFormData({
      exitId: '',
      condicao: '',
      motivoDefeito: '',
      necessitaReparo: false,
      observacoes: '',
    });
    setFotos([]);
    setFotosPreview([]);
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFotos((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setFotosPreview((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
    setFotosPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const data = new FormData();
    data.append('exitId', formData.exitId);
    data.append('condicao', formData.condicao);
    if (formData.motivoDefeito) data.append('motivoDefeito', formData.motivoDefeito);
    data.append('necessitaReparo', String(formData.necessitaReparo));
    if (formData.observacoes) data.append('observacoes', formData.observacoes);
    fotos.forEach((foto) => data.append('fotos', foto));

    createMutation.mutate(data);
  };

  const getCondicaoBadge = (condicao: string) => {
    switch (condicao) {
      case 'perfeito':
        return <span className="badge badge-success">Perfeito</span>;
      case 'defeito':
        return <span className="badge badge-warning">Com Defeito</span>;
      case 'danificado':
        return <span className="badge badge-danger">Danificado</span>;
      default:
        return <span className="badge badge-info">{condicao}</span>;
    }
  };

  const selectedExit = pendingExits.find((e) => e.id === formData.exitId);

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
            <h1 className="text-2xl font-bold text-cmoc-primary mb-2">Devoluções</h1>
            <p className="text-gray-600">Registre a devolução de materiais</p>
          </div>
          <button onClick={openModal} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Nova Devolução
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
                  <th className="table-header-cell">Condição</th>
                  <th className="table-header-cell">Reparo</th>
                  <th className="table-header-cell">Solicitante</th>
                  <th className="table-header-cell">Recebido por</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {returns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-cell text-center text-gray-500">
                      Nenhuma devolução registrada
                    </td>
                  </tr>
                ) : (
                  returns.map((ret: Return) => (
                    <tr key={ret.id}>
                      <td className="table-cell">
                        {format(new Date(ret.dataDevolucao), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </td>
                      <td className="table-cell">
                        <div>
                          <p className="font-medium">{ret.exit?.item?.nome}</p>
                          <p className="text-xs text-gray-500">
                            {ret.exit?.item?.categoria?.nome}
                          </p>
                        </div>
                      </td>
                      <td className="table-cell">{ret.exit?.quantidade}</td>
                      <td className="table-cell">{getCondicaoBadge(ret.condicao)}</td>
                      <td className="table-cell">
                        {ret.necessitaReparo ? (
                          <span className="text-red-500">Sim</span>
                        ) : (
                          <span className="text-green-500">Não</span>
                        )}
                      </td>
                      <td className="table-cell">{ret.exit?.solicitante?.nome}</td>
                      <td className="table-cell">{ret.responsavelRecebimento?.nome}</td>
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
                <h2 className="text-xl font-semibold text-cmoc-primary">Nova Devolução</h2>
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
                    Saída a ser devolvida *
                  </label>
                  <select
                    value={formData.exitId}
                    onChange={(e) => setFormData({ ...formData, exitId: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Selecione...</option>
                    {pendingExits.map((exit) => (
                      <option key={exit.id} value={exit.id}>
                        {exit.item?.nome} ({exit.quantidade}x) - {exit.solicitante?.nome} -{' '}
                        {format(new Date(exit.dataSaida), 'dd/MM/yyyy')}
                      </option>
                    ))}
                  </select>
                  {selectedExit && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                      <p>
                        <strong>Item:</strong> {selectedExit.item?.nome}
                      </p>
                      <p>
                        <strong>Quantidade:</strong> {selectedExit.quantidade}
                      </p>
                      <p>
                        <strong>Destino:</strong> {selectedExit.destino}
                      </p>
                      <p>
                        <strong>Motivo:</strong> {selectedExit.motivoSaida}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condição do Item *
                  </label>
                  <select
                    value={formData.condicao}
                    onChange={(e) => setFormData({ ...formData, condicao: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="perfeito">Perfeito - volta ao estoque</option>
                    <option value="defeito">Com Defeito - precisa de reparo</option>
                    <option value="danificado">Danificado - baixa permanente</option>
                  </select>
                </div>

                {(formData.condicao === 'defeito' || formData.condicao === 'danificado') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição do Defeito/Dano
                      </label>
                      <textarea
                        value={formData.motivoDefeito}
                        onChange={(e) =>
                          setFormData({ ...formData, motivoDefeito: e.target.value })
                        }
                        className="input-field"
                        rows={2}
                        placeholder="Descreva o defeito ou dano encontrado..."
                      />
                    </div>

                    {formData.condicao === 'defeito' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="necessitaReparo"
                          checked={formData.necessitaReparo}
                          onChange={(e) =>
                            setFormData({ ...formData, necessitaReparo: e.target.checked })
                          }
                          className="w-4 h-4 text-cmoc-primary rounded"
                        />
                        <label htmlFor="necessitaReparo" className="text-sm text-gray-700">
                          Necessita de reparo
                        </label>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fotos do Defeito/Dano
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {fotosPreview.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-cmoc-primary">
                          <Camera size={20} className="text-gray-400" />
                          <span className="text-xs text-gray-500">Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </>
                )}

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
                    {createMutation.isPending ? 'Salvando...' : 'Registrar Devolução'}
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

export default ReturnsList;
