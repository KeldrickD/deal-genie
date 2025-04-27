import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbPage {
  name: string;
  href: string;
}

interface BreadcrumbProps {
  pages: BreadcrumbPage[];
}

export default function Breadcrumb({ pages }: BreadcrumbProps) {
  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
            Home
          </Link>
        </li>
        
        {pages.map((page, index) => (
          <li key={page.href} className="inline-flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
            {index === pages.length - 1 ? (
              <span className="text-indigo-600 text-sm font-medium" aria-current="page">
                {page.name}
              </span>
            ) : (
              <Link href={page.href} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                {page.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
} 