'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Users,
  FolderOpen,
  Receipt,
  Calculator,
  Home,
} from 'lucide-react';

const navigation = [
  { name: '대시보드', href: '/', icon: Home },
  { name: '회원 관리', href: '/members', icon: Users },
  { name: '프로젝트', href: '/projects', icon: FolderOpen },
  { name: '지출 청구', href: '/expense-claims', icon: Receipt },
  { name: '회계 관리', href: '/accounting', icon: Calculator },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1 p-4">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.name} href={item.href}>
            <Button
              variant={isActive ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start',
                isActive && 'bg-primary text-primary-foreground'
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}
