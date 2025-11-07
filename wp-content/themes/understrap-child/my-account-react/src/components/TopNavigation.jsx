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
import { Menu, ChevronDown } from 'lucide-react';

const TopNavigation = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // Get menu from WordPress or use fallback
  const wpMenu = window.samsaraMyAccount?.topNavMenu || [];

  // Fallback menu if WordPress menu is not set
  const fallbackMenu = [
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

  // Use WordPress menu if available, otherwise use fallback
  const navItems = wpMenu.length > 0 ? wpMenu.map(item => {
    // Check if this is an internal link (account-related)
    const isInternal = item.href && (item.href.includes('/account') || item.href.startsWith('/account'));

    // Extract path from full URL for internal links
    let href = item.href;
    if (isInternal && item.href) {
      try {
        const url = new URL(item.href);
        href = url.pathname; // Get just the path portion (e.g., /account/)
      } catch (e) {
        // If URL parsing fails, assume it's already a path
        href = item.href;
      }
    }

    // Also process sub-items if they exist
    const processedItem = {
      ...item,
      href,
      isInternal
    };

    if (item.items && item.items.length > 0) {
      processedItem.items = item.items.map(subItem => {
        const subIsInternal = subItem.href && (subItem.href.includes('/account') || subItem.href.startsWith('/account'));
        let subHref = subItem.href;

        if (subIsInternal && subItem.href) {
          try {
            const url = new URL(subItem.href);
            subHref = url.pathname;
          } catch (e) {
            subHref = subItem.href;
          }
        }

        return {
          ...subItem,
          href: subHref,
          isInternal: subIsInternal
        };
      });
    }

    return processedItem;
  }) : fallbackMenu;

  // Desktop Navigation
  const DesktopNav = () => (
    <div className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-hide flex-nowrap">
      {navItems.map((item) => {
        if (item.items) {
          // Dropdown menu
          return (
            <div key={item.label} className="relative group">
              <button
                className="px-[26px] py-2 text-white/80 hover:text-samsara-gold font-medium text-[1.1rem] flex items-center gap-1 transition-colors"
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span dangerouslySetInnerHTML={{ __html: item.label }} />
                <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute left-0 top-full opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-[9999]">
                <div className="bg-white border border-stone-200 rounded-lg shadow-lg py-2 min-w-[240px]">
                  {item.items.map((subItem) => (
                    <a
                      key={subItem.label}
                      href={subItem.href}
                      className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-samsara-gold transition-colors"
                      data-testid={`nav-${subItem.label.toLowerCase().replace(/\s+/g, '-')}`}
                      dangerouslySetInnerHTML={{ __html: subItem.label }}
                    />

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
              className={`px-[26px] py-2 font-medium text-[1.1rem] transition-colors ${
                isActive('/account')
                  ? 'text-samsara-gold font-semibold'
                  : 'text-white/80 hover:text-samsara-gold'
              }`}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              dangerouslySetInnerHTML={{ __html: item.label }}
            />
          );
        }

        return (
          <a
            key={item.label}
            href={item.href}
            className="px-[26px] py-2 text-white/80 hover:text-samsara-gold font-medium text-[1.1rem] transition-colors"
            data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            dangerouslySetInnerHTML={{ __html: item.label }}
          />
        );
      })}
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
            className="lg:hidden text-white hover:text-samsara-gold"
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
                      className="w-full flex items-center justify-between px-4 py-3 text-stone-700 hover:bg-stone-50 font-medium text-[1.1rem] transition-colors"
                      data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <span dangerouslySetInnerHTML={{ __html: item.label }} />
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
                            className="block px-8 py-2 text-sm text-stone-600 hover:text-samsara-gold"
                            data-testid={`mobile-nav-${subItem.label.toLowerCase().replace(/\s+/g, '-')}`}
                            dangerouslySetInnerHTML={{ __html: subItem.label }}
                          />
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
                    className={`px-4 py-3 font-medium text-[1.1rem] transition-colors ${
                      isActive('/account')
                        ? 'text-samsara-gold bg-samsara-gold/10 font-semibold'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                    data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    dangerouslySetInnerHTML={{ __html: item.label }}
                  />
                );
              }

              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-stone-700 hover:bg-stone-50 font-medium text-[1.1rem] transition-colors"
                  data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  dangerouslySetInnerHTML={{ __html: item.label }}
                />
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <header className="w-full bg-samsara-black">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-[97px] items-center justify-between">
          {/* Logo */}
          <a href="https://samsaraexperience.com/" className="flex items-center" data-testid="nav-logo">
            <img
              src="https://customer-assets.emergentagent.com/job_quick-dash-6/artifacts/9sp1lhlg_samsara-logo-white-name.png"
              alt="Samsara"
              className="h-[60px] w-auto"
            />
          </a>

          {/* Desktop Navigation */}
          <DesktopNav />

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 lg:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
