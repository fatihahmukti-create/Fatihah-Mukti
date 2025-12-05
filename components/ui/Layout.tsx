import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  MessageSquareText, 
  LineChart, 
  UserCircle 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/chat', icon: <MessageSquareText size={24} />, label: 'Chat AI', special: true },
    { to: '/history', icon: <History size={20} />, label: 'History' },
    { to: '/progress', icon: <LineChart size={20} />, label: 'Progress' },
    { to: '/profile', icon: <UserCircle size={20} />, label: 'Profile' },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm z-10">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">N</div>
           <span className="font-bold text-lg text-blue-900">NutriTrack</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4 md:pl-64">
        <div className="max-w-4xl mx-auto h-full">
          {children}
        </div>
      </main>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white border-r border-slate-200">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">N</div>
          <span className="font-bold text-xl text-blue-900">NutriTrack</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
                <p className="text-sm font-medium mb-1">Upgrade to Pro</p>
                <p className="text-xs text-blue-100 mb-2">Get detailed micro analysis.</p>
                <button className="w-full text-xs bg-white text-blue-600 py-1.5 rounded-lg font-semibold">View Plans</button>
            </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-between items-end z-20 pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-400'
              } ${item.special ? '-mt-6' : ''}`
            }
          >
            {item.special ? (
                <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    {item.icon}
                </div>
            ) : (
                <>
                    {item.icon}
                    <span className="text-[10px] font-medium">{item.label}</span>
                </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
