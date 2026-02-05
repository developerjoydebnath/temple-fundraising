'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import api from '@/lib/api';
import {
  ChevronRight,
  CreditCard,
  ExternalLink,
  HandCoins,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCog,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { name: 'Donors', icon: Users, href: '/admin/donors' },
  { name: 'Donations', icon: HandCoins, href: '/admin/donations' },
  { name: 'Activity Log', icon: History, href: '/admin/history' },
  { name: 'Payment Methods', icon: CreditCard, href: '/admin/payment-methods' },
  { name: 'Admins', icon: UserCog, href: '/admin/admins' },
];

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isLoading } = useSWR('/auth/me', fetcher);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      toast.success('Logged out successfully');
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const isRestrictedPage = ['/admin/admins', '/admin/payment-methods', '/admin/history'].includes(pathname);

  // Protected route check on client side
  if (!isLoading && isRestrictedPage && !isAdmin) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-md text-center">
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <Menu className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
            <p className="text-slate-500 mb-8">
                This area is reserved for administrators only.
            </p>
            <Button className="bg-orange-600 w-full" onClick={() => router.push('/admin/dashboard')}>
                Back to Dashboard
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="hidden md:flex flex-col border-r border-slate-200 shadow-sm z-20">
        <NavContent pathname={pathname} handleLogout={handleLogout} user={user} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white flex items-center justify-between px-4 md:px-8 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-4">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-none w-64">
                <NavContent pathname={pathname} handleLogout={handleLogout} user={user} />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold text-slate-800 capitalize">
              {pathname.split('/').pop()?.replace('-', ' ')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-sm font-medium text-slate-600 hidden sm:block">
                Welcome, {user?.name || 'User'}
             </div>
             <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold border border-orange-200">
               {user?.name?.[0] || 'U'}
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

const NavContent = ({ pathname, handleLogout, user }: { pathname: string, handleLogout: () => void, user: any }) => {
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
    
    return (
        <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-64">
          <div className="p-6 mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="bg-orange-600 p-1.5 rounded-lg text-white">🛕</span>
              Temple Admin
            </h2>
          </div>
          <ScrollArea className="flex-1 px-4 py-2">
            <nav className="space-y-1">
              {menuItems.filter(item => {
                  if (['/admin/admins', '/admin/payment-methods', '/admin/history'].includes(item.href)) {
                      return isAdmin;
                  }
                  return true;
              }).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                  prefetch={false}
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-orange-600 shadow-lg shadow-orange-600/20 text-white font-medium' 
                        : 'hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Link>
                );
              })}
              <div className="pt-4 mt-4 border-t border-slate-800">
                <Link
                prefetch={false}
                  href="/"
                  target="_blank"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 hover:text-white group"
                >
                  <ExternalLink className="h-5 w-5 group-hover:text-orange-500" />
                  View Landing Page
                </Link>
              </div>
            </nav>
          </ScrollArea>
          <div className="p-4 border-t border-slate-800">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5 gap-3 rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
    );
};