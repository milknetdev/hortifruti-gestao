'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/stores/admin-store';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderTree,
  Users,
  Warehouse,
  DollarSign,
  Percent,
  Ticket,
  Truck,
  Megaphone,
  UserCog,
  Paintbrush,
  Settings,
  Store,
  ChevronLeft,
  ChevronRight,
  Leaf,
  X,
  FileSpreadsheet,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', href: '/admin/', icon: LayoutDashboard },
      { label: 'Pedidos', href: '/admin/pedidos', icon: ShoppingBag },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { label: 'Produtos', href: '/admin/produtos', icon: Package },
      { label: 'Categorias', href: '/admin/categorias', icon: FolderTree },
      { label: 'Clientes', href: '/admin/clientes', icon: Users },
    ],
  },
  {
    title: 'Operações',
    items: [
      { label: 'Estoque', href: '/admin/estoque', icon: Warehouse },
      { label: 'Financeiro', href: '/admin/financeiro', icon: DollarSign },
      { label: 'Comissões', href: '/admin/comissoes', icon: Percent },
      { label: 'Indicações', href: '/admin/indicacoes', icon: Users },
      { label: 'Pontos de Retirada', href: '/admin/pontos-retirada', icon: Store },
      { label: 'Cupons', href: '/admin/cupons', icon: Ticket },
      { label: 'Entregas', href: '/admin/entregas', icon: Truck },
      { label: 'Exportar', href: '/admin/exportar', icon: FileSpreadsheet },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { label: 'Banners', href: '/admin/banners', icon: Megaphone },
    ],
  },
  {
    title: 'Configurações',
    items: [
      { label: 'Equipe', href: '/admin/equipe', icon: UserCog },
      { label: 'Personalização', href: '/admin/personalizacao', icon: Paintbrush },
      { label: 'Configurações', href: '/admin/configuracoes', icon: Settings },
      { label: 'Logs de Auditoria', href: '/admin/logs', icon: History, superAdminOnly: true },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

function SidebarContent({ collapsed, pathname, onClose }: { collapsed: boolean; pathname: string; onClose?: () => void }) {
  const { user } = useAdminStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'super_admin';

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#16a34a] rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-white font-bold text-lg">HortiFruti</span>
          )}
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-white/60 hover:text-white lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Menu Groups */}
      <ScrollArea className="flex-1 py-2">
        <nav className="px-2 space-y-6">
          {menuGroups.map((group) => {
            const filteredItems = group.items.filter((item: any) => {
              if (item.superAdminOnly && !isSuperAdmin) return false;
              return true;
            });
            
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.title}>
                {!collapsed && (
                  <p className="px-3 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    {group.title}
                  </p>
                )}
                <div className="space-y-1">
                  {filteredItems.map((item: any) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-[#16a34a] text-white shadow-lg shadow-[#16a34a]/20'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-white/40 text-center">HortiFruti Gestão v1.0</p>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ collapsed = false, onToggle, isMobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  if (isMobile) {
    return (
      <Sheet open onOpenChange={(open) => !open && onClose?.()}>
        <SheetContent side="left" className="w-[280px] p-0 bg-[#1a1a2e] border-r-0">
          <SidebarContent collapsed={false} pathname={pathname} onClose={onClose} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col bg-[#1a1a2e] h-screen fixed left-0 top-0 z-40 transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      <SidebarContent collapsed={collapsed} pathname={pathname} />
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-7 w-6 h-6 bg-[#1a1a2e] border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-[#16a34a] transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      )}
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-gray-600"
        onClick={() => setOpen(true)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </Button>
      {open && (
        <Sheet open onOpenChange={setOpen}>
          <SheetContent side="left" className="w-[280px] p-0 bg-[#1a1a2e] border-r-0">
            <SidebarContent collapsed={false} pathname={usePathname()} onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}