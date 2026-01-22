import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
  RotateCcw,
  Users,
  FolderOpen,
  FileSpreadsheet,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/items', icon: Package, label: 'Itens' },
    { path: '/entries', icon: ArrowDownCircle, label: 'Entradas' },
    { path: '/exits', icon: ArrowUpCircle, label: 'Saídas' },
    { path: '/returns', icon: RotateCcw, label: 'Devoluções' },
    { path: '/categories', icon: FolderOpen, label: 'Categorias' },
    { path: '/reports', icon: FileSpreadsheet, label: 'Relatórios' },
    { path: '/users', icon: Users, label: 'Usuários', adminOnly: true },
    { path: '/settings', icon: Settings, label: 'Configurações' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || user?.permissao === 'admin'
  );

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-cmoc-primary text-white w-64 min-h-screen flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 sm:p-6 border-b border-cmoc-accent flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              <span className="text-white">C</span>
              <span className="text-cmoc-secondary">M</span>
              <span className="text-white">OC</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-300">Gestão de Estoque de TI</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-cmoc-accent rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-2 sm:p-4 overflow-y-auto">
          <ul className="space-y-1 sm:space-y-2">
            {filteredMenuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    isActive(item.path)
                      ? 'bg-cmoc-secondary text-white'
                      : 'hover:bg-cmoc-accent'
                  }`}
                >
                  <item.icon size={18} className="sm:w-5 sm:h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-2 sm:p-4 border-t border-cmoc-accent">
          <div className="px-3 sm:px-4 py-2 mb-2">
            <p className="text-xs sm:text-sm font-medium truncate">{user?.nome}</p>
            <p className="text-xs text-gray-300 truncate">{user?.cargo}</p>
          </div>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 w-full rounded-lg hover:bg-cmoc-accent transition-colors text-sm sm:text-base"
          >
            <LogOut size={18} className="sm:w-5 sm:h-5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
