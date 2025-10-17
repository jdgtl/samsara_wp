import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { ShoppingCart, Menu, ChevronDown } from 'lucide-react';

const TopNavigation = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      label: 'Online Training',
      href: 'https://samsaraexperience.com/training-basecamp/',
    },
    {
      label: 'Coaching',
      items: [
        { label: 'Athlete Team', href: 'https://samsaraexperience.com/athlete-team/' },
        { label: 'Book a Consult', href: 'https://samsaraexperience.com/consult/' },
      ],
    },
    {
      label: 'Snow Safety',
      items: [
        { label: 'Backcountry Semester', href: 'https://samsaraexperience.com/backcountry-semester/' },
        { label: 'Big Mountain Rope Skills Clinic', href: 'https://samsaraexperience.com/rope-skills/' },
        { label: 'Big Mountain Snow Safety Workshop', href: 'https://samsaraexperience.com/snow-safety/' },
      ],
    },
    {
      label: 'Blog',
      href: 'https://samsaraexperience.com/blog/',
    },
    {
      label: 'About',
      items: [
        { label: 'About Us', href: 'https://samsaraexperience.com/about/' },
        { label: 'Press', href: 'https://samsaraexperience.com/press/' },
        { label: 'Partners', href: 'https://samsaraexperience.com/partners/' },
        { label: 'Contact', href: 'https://samsaraexperience.com/contact/' },
      ],
    },
    {
      label: 'My Account',
      href: '/account',
      isInternal: true,
    },
    {
      label: 'Shop',
      href: 'https://samsaraexperience.com/shop/',
    },
  ];

  // Desktop Navigation
  const DesktopNav = () => (
    <div className="hidden lg:flex items-center gap-1">
      {navItems.map((item) => {
        if (item.items) {
          // Dropdown menu
          return (
            <div key={item.label} className="relative group">
              <button
                className="px-3 py-2 text-stone-700 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 transition-colors"
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.label}
                <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute left-0 top-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999]">
                <div className="bg-white border border-stone-200 rounded-lg shadow-lg py-2 min-w-[240px]">
                  {item.items.map((subItem) => (
                    <a
                      key={subItem.label}
                      href={subItem.href}
                      className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-emerald-700 transition-colors"
                      data-testid={`nav-${subItem.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {subItem.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        // Regular link
        if (item.isInternal) {
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`px-3 py-2 font-medium text-sm transition-colors ${
                isActive('/account')
                  ? 'text-emerald-700 font-semibold'
                  : 'text-stone-700 hover:text-emerald-700'
              }`}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {item.label}
            </Link>
          );
        }

        return (
          <a
            key={item.label}
            href={item.href}
            className="px-3 py-2 text-stone-700 hover:text-emerald-700 font-medium text-sm transition-colors"
            data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {item.label}
          </a>
        );
      })}

      {/* Cart Icon */}
      <a
        href="https://samsaraexperience.com/cart/"
        className="ml-2 p-2 text-stone-700 hover:text-emerald-700 transition-colors"
        aria-label="Shopping Cart"
        data-testid="nav-cart"
      >
        <ShoppingCart className="h-5 w-5" />
      </a>
    </div>
  );

  // Mobile Navigation
  const MobileNav = () => {
    const [expandedItem, setExpandedItem] = useState(null);

    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            data-testid="mobile-nav-trigger"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] overflow-y-auto">
          <nav className="flex flex-col gap-1 mt-8">
            {navItems.map((item) => {
              if (item.items) {
                const isExpanded = expandedItem === item.label;
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => setExpandedItem(isExpanded ? null : item.label)}
                      className="w-full flex items-center justify-between px-4 py-3 text-stone-700 hover:bg-stone-50 font-medium text-sm transition-colors"
                      data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="bg-stone-50 py-1">
                        {item.items.map((subItem) => (
                          <a
                            key={subItem.label}
                            href={subItem.href}
                            onClick={() => setMobileOpen(false)}
                            className="block px-8 py-2 text-sm text-stone-600 hover:text-emerald-700"
                            data-testid={`mobile-nav-${subItem.label.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {subItem.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              if (item.isInternal) {
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 font-medium text-sm transition-colors ${
                      isActive('/account')
                        ? 'text-emerald-700 bg-emerald-50 font-semibold'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                    data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-stone-700 hover:bg-stone-50 font-medium text-sm transition-colors"
                  data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.label}
                </a>
              );
            })}

            {/* Cart in Mobile */}
            <a
              href="https://samsaraexperience.com/cart/"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-stone-700 hover:bg-stone-50 font-medium text-sm transition-colors flex items-center gap-2"
              data-testid="mobile-nav-cart"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
            </a>
          </nav>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center" data-testid="nav-logo">
            <img 
              src="https://customer-assets.emergentagent.com/job_quick-dash-6/artifacts/9sp1lhlg_samsara-logo-white-name.png" 
              alt="Samsara" 
              className="h-8 w-auto brightness-0"
              style={{ filter: 'brightness(0)' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <DesktopNav />

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href="https://samsaraexperience.com/cart/"
              className="p-2 text-stone-700 hover:text-emerald-700 transition-colors"
              aria-label="Shopping Cart"
              data-testid="mobile-cart-icon"
            >
              <ShoppingCart className="h-5 w-5" />
            </a>
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
