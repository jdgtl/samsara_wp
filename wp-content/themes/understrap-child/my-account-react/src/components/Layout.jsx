import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation - Public Site Nav */}
      <TopNavigation />

      <div className="flex flex-1 bg-stone-100">
        <Sidebar />

        <main className="flex-1 overflow-x-hidden">
          {/* Page content with bottom padding on mobile for bottom nav */}
          <div className="p-6 md:p-8 pb-24 md:pb-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;