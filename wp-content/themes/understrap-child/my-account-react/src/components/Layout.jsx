import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation - Public Site Nav */}
      <TopNavigation />
      
      <div className="flex flex-1 bg-stone-100">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 overflow-x-hidden">
          {/* Mobile header with hamburger for account sidebar */}
          <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-stone-200 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              data-testid="open-sidebar-btn"
              aria-label="Open account menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Page content */}
          <div className="p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;