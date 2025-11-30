// components/Layout.tsx
'use client';

import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  role: string;
}

export default function Layout({ children, role }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar role={role} />

      {/* Main Content Area - Independent Scroll */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="min-h-full flex flex-col">
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </div>
            <Footer variant="light" />
          </div>
        </main>
      </div>
    </div>
  );
}