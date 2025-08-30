'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
}

const routeLabels: Record<string, string> = {
  receipts: 'Receipts',
  create: 'Create',
  review: 'Review',
  income: 'Income',
  expenses: 'Expenses',
  'add-transaction': 'Add Transaction',
  'add-users': 'Manage Users',
  'register-business': 'Register Business',
};

// Context-aware labels for dynamic routes
const getDynamicRouteLabel = (
  segments: string[],
  segment: string,
  index: number
): string => {
  // Receipt details
  if (segments[0] === 'receipts' && segment === '[id]') {
    return 'Receipt Details';
  }

  // Add transaction type
  if (segments[0] === 'add-transaction' && segment === '[type]') {
    const type = segments[index + 1]; // Get the actual type value
    if (type) {
      return type.charAt(0).toUpperCase() + type.slice(1);
    }
    return 'Transaction';
  }

  // Default for other dynamic routes
  return 'Details';
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on the home page
  if (pathname === '/') {
    return null;
  }

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Handle dynamic routes like [id]
      const isDynamicRoute = segment.startsWith('[') && segment.endsWith(']');

      let label = routeLabels[segment] ?? segment;

      // For dynamic routes, get context-aware labels
      if (isDynamicRoute) {
        label = getDynamicRouteLabel(segments, segment, index);
      }

      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrent: index === segments.length - 1,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mt-4 px-4 max-w-[calc(1000px+1rem)] mx-auto w-full">
      <Link
        href="/"
        className="flex items-center hover:text-foreground transition-colors"
        prefetch
        title="Home"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs.map((breadcrumb) => (
        <div key={breadcrumb.href} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {breadcrumb.isCurrent ? (
            <span className="font-medium text-foreground">
              {breadcrumb.label}
            </span>
          ) : (
            <Link
              href={breadcrumb.href}
              className="hover:text-foreground transition-colors"
            >
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
