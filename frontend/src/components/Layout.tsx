import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, FileText, User, LogOut, Menu, Moon, Sun, Monitor, Settings } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useQueryClient } from 'react-query';
import Button from '@/components/ui/Button';
// import { cn } from '@/lib/utils';
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, theme, toggleTheme, isMobile } = useUIStore();
  const queryClient = useQueryClient();

  const menuItems = [
    { text: 'Chat', icon: MessageCircle, path: '/chat' },
    { text: 'Documents', icon: FileText, path: '/documents' },
    { text: 'Profile', icon: User, path: '/profile' },
    { text: 'Debug', icon: Settings, path: '/debug' },
  ];

  const handleLogout = () => {
    console.log('Logout button clicked - starting logout process');
    
    // Clear everything manually
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear any cached data
    queryClient?.clear();
    
    console.log('Local storage cleared - redirecting to login');
    
    // Force page reload to login
    window.location.href = '/login';
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#1a1a1a', color: '#e5e5e5' }}>
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          !isMobile && 'relative translate-x-0'
        )}
        style={{ backgroundColor: '#2a2a2a', borderRight: '1px solid #444' }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid #444' }}>
          <h1 className="text-xl font-bold" style={{ color: '#e5e5e5' }}>AI Chatbot</h1>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              
              return (
                <li key={item.text}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) toggleSidebar();
                    }}
                    className={cn(
                      'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">
              {user?.full_name || user?.username}
            </span>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {getThemeIcon()}
            </Button>
          </div>
          <Button
            variant="outline"
            className="w-full bg-gray-200 text-gray-900 border-gray-600 hover:bg-gray-300 hover:border-gray-700 active:bg-gray-400 active:scale-95 transition-all duration-200"
            onClick={handleLogout}
            style={{ color: '#1a1a1a' }}
          >
            <LogOut className="w-4 h-4 mr-2 text-gray-900" />
            <span className="text-gray-900 font-medium">Logout</span>
          </Button>
        </div>
      </div>

      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className={cn('flex-1 flex flex-col', !isMobile && 'ml-64')}>
        {/* Top Bar */}
        <header className="flex items-center justify-between p-4 relative z-50" style={{ borderBottom: '1px solid #444', backgroundColor: '#2a2a2a' }}>
          <div className="flex items-center space-x-4">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <Menu className="w-5 h-5" style={{ color: '#e5e5e5' }} />
              </Button>
            )}
            <h2 className="text-lg font-semibold" style={{ color: '#e5e5e5' }}>
              {menuItems.find(item => location.pathname.startsWith(item.path))?.text || 'AI Chatbot'}
            </h2>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;