import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Repeat, CreditCard, User, LogOut } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const userData = window.samsaraMyAccount?.userData || {};

  const navItems = [
    { path: '/my-account', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/my-account/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/my-account/subscriptions', label: 'Subscriptions', icon: Repeat },
    { path: '/my-account/payments', label: 'Payments', icon: CreditCard },
    { path: '/my-account/details', label: 'Account', icon: User },
  ];

  const isActive = (path) => {
    if (path === '/my-account') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col">
      {/* User Profile */}
      <div className="p-6 border-b border-stone-200 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-3">
          {userData.firstName?.[0]}{userData.lastName?.[0]}
        </div>
        <h2 className="font-semibold text-lg">{userData.displayName}</h2>
        <p className="text-sm text-stone-600">
          Member since {new Date(userData.memberSince).getFullYear()}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-stone-200">
        <a
          href={window.samsaraMyAccount?.logoutUrl || '/'}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </a>
      </div>
    </aside>
  );
}
