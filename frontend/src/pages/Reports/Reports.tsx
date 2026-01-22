import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, Download, Package, ArrowDownCircle, ArrowUpCircle, RotateCcw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Layout from '../../components/Layout/Layout';
import { itemsApi } from '../../api/items';
import { entriesApi } from '../../api/entries';
import { exitsApi } from '../../api/exits';
import { returnsApi } from '../../api/returns';

const Reports = () => {
  const [exporting, setExporting] = useState<string | null>(null);

  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemsApi.getAll(),
  });

  const { data: entries = [] } = useQuery({
    queryKey: ['entries'],
    queryFn: () => entriesApi.getAll(),
  });

  const { data: exits = [] } = useQuery({
    queryKey: ['exits'],
    queryFn: () => exitsApi.getAll(),
  });

  const { data: returns = [] } = useQuery({
    queryKey: ['returns'],
    queryFn: () => returnsApi.getAll(),
  });

  const exportToExcel = (type: string) => {
    setExporting(type);

    let data: any[] = [];
    let fileName = '';

    switch (type) {
      case 'inventario':
        data = items.map((item) => ({
          'Nome': item.nome,
          'Categoria': item.categoria?.nome || '',
          'Código de Barras': item.codigoBarras || '',
          'Número de Série': item.numeroSerie || '',
          'Quantidade Total': item.quantidadeTotal,
          'Quantidade Disponível': item.quantidadeDisponivel,
          'Quantidade em Uso': item.quantidadeEmUso,
          'Localização': item.localizacao || '',
          'Valor Unitário (R$)': item.valorUnitario || 0,
          'Valor Total (R$)': (item.valorUnitario || 0) * item.quantidadeTotal,
          'Fornecedor': item.fornecedor || '',
          'Estoque Mínimo': item.estoqueMinimo || 0,
        }));
        fileName = `inventario_${format(new Date(), 'yyyy-MM-dd')}`;
        break;

      case 'entradas':
        data = entries.map((entry: any) => ({
          'Data': format(new Date(entry.dataEntrada), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
          'Item': entry.item?.nome || '',
          'Categoria': entry.item?.categoria?.nome || '',
          'Quantidade': entry.quantidade,
          'Valor Total (R$)': entry.valorTotal || 0,
          'Nota Fiscal': entry.notaFiscal || '',
          'Fornecedor': entry.fornecedor || '',
          'Responsável': entry.responsavel?.nome || '',
          'Observações': entry.observacoes || '',
        }));
        fileName = `entradas_${format(new Date(), 'yyyy-MM-dd')}`;
        break;

      case 'saidas':
        data = exits.map((exit: any) => ({
          'Data': format(new Date(exit.dataSaida), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
          'Item': exit.item?.nome || '',
          'Categoria': exit.item?.categoria?.nome || '',
          'Quantidade': exit.quantidade,
          'Solicitante': exit.solicitante?.nome || '',
          'Destino': exit.destino,
          'Motivo': exit.motivoSaida,
          'Previsão Devolução': exit.previsaoDevolucao
            ? format(new Date(exit.previsaoDevolucao), 'dd/MM/yyyy', { locale: ptBR })
            : '',
          'Status': exit.status === 'em_uso' ? 'Em Uso' : exit.status === 'devolvido' ? 'Devolvido' : 'Baixado',
          'Responsável Liberação': exit.responsavelLiberacao?.nome || '',
          'Observações': exit.observacoes || '',
        }));
        fileName = `saidas_${format(new Date(), 'yyyy-MM-dd')}`;
        break;

      case 'devolucoes':
        data = returns.map((ret: any) => ({
          'Data Devolução': format(new Date(ret.dataDevolucao), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
          'Item': ret.exit?.item?.nome || '',
          'Categoria': ret.exit?.item?.categoria?.nome || '',
          'Quantidade': ret.exit?.quantidade || 0,
          'Condição': ret.condicao === 'perfeito' ? 'Perfeito' : ret.condicao === 'defeito' ? 'Com Defeito' : 'Danificado',
          'Necessita Reparo': ret.necessitaReparo ? 'Sim' : 'Não',
          'Motivo Defeito': ret.motivoDefeito || '',
          'Solicitante': ret.exit?.solicitante?.nome || '',
          'Recebido por': ret.responsavelRecebimento?.nome || '',
          'Observações': ret.observacoes || '',
        }));
        fileName = `devolucoes_${format(new Date(), 'yyyy-MM-dd')}`;
        break;

      case 'estoque_baixo':
        data = items
          .filter((item) => item.estoqueMinimo && item.quantidadeDisponivel <= item.estoqueMinimo)
          .map((item) => ({
            'Nome': item.nome,
            'Categoria': item.categoria?.nome || '',
            'Quantidade Disponível': item.quantidadeDisponivel,
            'Estoque Mínimo': item.estoqueMinimo,
            'Diferença': item.quantidadeDisponivel - (item.estoqueMinimo || 0),
            'Localização': item.localizacao || '',
            'Fornecedor': item.fornecedor || '',
          }));
        fileName = `estoque_baixo_${format(new Date(), 'yyyy-MM-dd')}`;
        break;
    }

    // Criar workbook e worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dados');

    // Ajustar largura das colunas
    const colWidths = Object.keys(data[0] || {}).map((key) => ({
      wch: Math.max(key.length, 15),
    }));
    ws['!cols'] = colWidths;

    // Gerar arquivo
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}.xlsx`);

    setExporting(null);
  };

  const reports = [
    {
      id: 'inventario',
      title: 'Inventário Completo',
      description: 'Lista de todos os itens cadastrados com quantidades e valores',
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      id: 'entradas',
      title: 'Relatório de Entradas',
      description: 'Histórico de todas as entradas de materiais',
      icon: ArrowDownCircle,
      color: 'bg-green-500',
    },
    {
      id: 'saidas',
      title: 'Relatório de Saídas',
      description: 'Histórico de todas as saídas de materiais',
      icon: ArrowUpCircle,
      color: 'bg-yellow-500',
    },
    {
      id: 'devolucoes',
      title: 'Relatório de Devoluções',
      description: 'Histórico de devoluções e condição dos itens',
      icon: RotateCcw,
      color: 'bg-purple-500',
    },
    {
      id: 'estoque_baixo',
      title: 'Itens com Estoque Baixo',
      description: 'Itens que atingiram ou estão abaixo do estoque mínimo',
      icon: Package,
      color: 'bg-red-500',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-cmoc-primary mb-2">Relatórios</h1>
          <p className="text-gray-600">Exporte relatórios em formato Excel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`${report.color} p-3 rounded-lg`}>
                  <report.icon size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-cmoc-primary mb-1">{report.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{report.description}</p>
                  <button
                    onClick={() => exportToExcel(report.id)}
                    disabled={exporting === report.id}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    {exporting === report.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Exportando...
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        Exportar Excel
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div className="card">
          <h3 className="card-header flex items-center gap-2">
            <FileSpreadsheet size={24} />
            Resumo dos Dados
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-cmoc-primary">{items.length}</p>
              <p className="text-sm text-gray-500">Itens Cadastrados</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{entries.length}</p>
              <p className="text-sm text-gray-500">Entradas</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">{exits.length}</p>
              <p className="text-sm text-gray-500">Saídas</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">{returns.length}</p>
              <p className="text-sm text-gray-500">Devoluções</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
