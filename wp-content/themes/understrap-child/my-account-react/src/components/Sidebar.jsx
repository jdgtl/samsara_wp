import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Repeat,
  User,
  LogOut,
  X,
  UserCog,
  ArrowLeft
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  // Get user data from WordPress global
  const userData = window.samsaraMyAccount?.userData || {
    firstName: 'User',
    lastName: '',
    displayName: 'User',
    email: '',
    memberSince: null
  };

  // Get user switching data
  const userSwitching = window.samsaraMyAccount?.userSwitching || {
    isSwitched: false,
    originalUser: null,
    switchBackUrl: null
  };

  const memberSinceFormatted = userData.memberSince
    ? new Date(userData.memberSince).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
    : 'Recently';

  const handleSwitchBack = () => {
    if (userSwitching.switchBackUrl) {
      // Decode HTML entities (&amp; -> &) that WordPress escapes in esc_url()
      const textarea = document.createElement('textarea');
      textarea.innerHTML = userSwitching.switchBackUrl;
      const decodedUrl = textarea.value;
      window.location.href = decodedUrl;
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShoppingBag, label: 'Orders', path: '/orders' },
    { icon: Repeat, label: 'Subscriptions', path: '/subscriptions' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
    { icon: User, label: 'Account', path: '/details' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    // Use WordPress logout URL from global config
    const logoutUrl = window.samsaraMyAccount?.logoutUrl || '/wp-login.php?action=logout';
    window.location.href = logoutUrl;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-72 bg-stone-50 border-r border-stone-200
          flex flex-col z-50 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        data-testid="sidebar"
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden text-stone-600 hover:text-stone-900"
          aria-label="Close sidebar"
          data-testid="close-sidebar-btn"
        >
          <X className="h-5 w-5" />
        </button>

        {/* User Profile Section */}
        <div className="p-6 space-y-3 flex flex-col items-center text-center" data-testid="user-profile-section">
          <Avatar className="h-20 w-20" data-testid="user-avatar">
            <AvatarImage src={userData.avatarUrl} alt={userData.displayName} />
            <AvatarFallback className="bg-samsara-gold text-samsara-black text-xl">
              {userData.firstName?.[0]}{userData.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-lg text-stone-900" data-testid="user-name">
              {userData.displayName}
            </h2>
            <p className="text-sm text-stone-600" data-testid="member-since">
              Member since {memberSinceFormatted}
            </p>
          </div>
        </div>

        <Separator className="bg-stone-200" />

        {/* User Switching Banner */}
        {userSwitching.isSwitched && userSwitching.originalUser && (
          <>
            <div className="p-4">
              <Alert className="border-amber-500 bg-amber-50">
                <UserCog className="h-4 w-4 text-amber-600" />
                <AlertDescription className="ml-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-amber-900">
                      Switched to {userData.displayName}
                    </p>
                    <p className="text-xs text-amber-700">
                      Original user: {userSwitching.originalUser.displayName}
                    </p>
                    {userSwitching.switchBackUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSwitchBack}
                        className="w-full mt-2 border-amber-600 text-amber-900 hover:bg-amber-100 hover:text-amber-900"
                      >
                        <ArrowLeft className="h-3 w-3 mr-2" />
                        Switch Back
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </div>
            <Separator className="bg-stone-200" />
          </>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1" data-testid="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  focus:outline-none focus:ring-2 focus:ring-samsara-gold focus:ring-offset-2
                  ${active 
                    ? 'bg-samsara-gold text-samsara-black' 
                    : 'text-stone-700 hover:bg-stone-200'
                  }
                `}
                data-testid={`nav-${item.label.toLowerCase()}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Separator className="bg-stone-200" />

        {/* Logout Button */}
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 border-stone-300 text-stone-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
            onClick={handleLogout}
            data-testid="logout-btn"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;