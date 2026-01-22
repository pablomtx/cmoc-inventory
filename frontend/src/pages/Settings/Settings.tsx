import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import Layout from '../../components/Layout/Layout';
import { Save, User, Lock } from 'lucide-react';

const Settings = () => {
  const { user } = useAuthStore();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha !== confirmarSenha) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

    if (novaSenha.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' });
      return;
    }

    // Aqui você pode implementar a chamada API para alterar a senha
    setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-cmoc-primary mb-2">Configurações</h1>
          <p className="text-gray-600">Gerencie suas configurações pessoais</p>
        </div>

        {/* Informações do Usuário */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-cmoc-primary" size={24} />
            <h2 className="text-xl font-semibold text-cmoc-primary">Meus Dados</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Nome</label>
              <p className="text-gray-900">{user?.nome}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Cargo</label>
              <p className="text-gray-900">{user?.cargo}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Permissão</label>
              <p className="text-gray-900 capitalize">{user?.permissao}</p>
            </div>
          </div>
        </div>

        {/* Alterar Senha */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="text-cmoc-primary" size={24} />
            <h2 className="text-xl font-semibold text-cmoc-primary">Alterar Senha</h2>
          </div>

          {message.text && (
            <div
              className={`p-3 rounded-lg mb-4 ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-green-50 text-green-600'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha Atual
              </label>
              <input
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nova Senha
              </label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save size={20} />
              Salvar Alterações
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
