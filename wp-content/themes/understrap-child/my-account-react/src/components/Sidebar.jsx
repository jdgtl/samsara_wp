import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import AvatarDisplay from './AvatarDisplay';
import { useAvatar } from '../contexts/AvatarContext';
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
  const { avatarType, selectedEmoji, uploadedAvatarUrl, loading: avatarLoading } = useAvatar();

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
      {/* Desktop Sidebar (≥ md / 768px) */}
      <aside
        className="hidden md:flex md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-stone-50 border-r border-stone-200 flex-col relative z-50"
        data-testid="sidebar-desktop"
      >
        {/* User Profile Section */}
        <div className="p-6 space-y-3 flex flex-col items-center text-center" data-testid="user-profile-section">
          <AvatarDisplay
            avatarType={avatarType}
            selectedEmoji={selectedEmoji}
            uploadedAvatarUrl={uploadedAvatarUrl}
            userData={userData}
            size="h-20 w-20"
            textSize="text-xl"
            loading={avatarLoading}
          />
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

        {/* Navigation Items - Scrollable with padding for logout */}
        <nav className="flex-1 overflow-y-auto p-4 pb-20 space-y-1" data-testid="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
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

        {/* Logout Button - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-stone-200 bg-stone-50">
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
        </div>
      </aside>

      {/* Mobile Bottom Navigation (< md / 768px) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-50 safe-area-inset-bottom"
        data-testid="bottom-nav-mobile"
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 min-w-0
                  ${active
                    ? 'text-samsara-gold'
                    : 'text-stone-600'
                  }
                `}
                data-testid={`bottom-nav-${item.label.toLowerCase()}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={`h-6 w-6 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;