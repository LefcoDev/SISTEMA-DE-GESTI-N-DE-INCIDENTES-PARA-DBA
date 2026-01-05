import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isChat = location.pathname === '/chat';

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`lg:pl-72 h-full flex flex-col ${isChat ? '' : 'overflow-auto'}`}>
        <Header setSidebarOpen={setSidebarOpen} />
        {isChat ? (
          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        ) : (
          <main className="py-10 flex-1">
            <div className="px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
