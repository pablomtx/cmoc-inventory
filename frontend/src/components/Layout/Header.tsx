import { Bell, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} className="text-cmoc-primary" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-cmoc-primary">
              Gestão de Estoque de TI
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            title="Notificações"
          >
            <Bell size={20} className="sm:w-6 sm:h-6 text-cmoc-primary" />
            <span className="absolute top-0 right-0 sm:top-1 sm:right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
              0
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
