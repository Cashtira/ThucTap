import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Lab Manager Pro',
  description: 'Quản lý thiết bị phòng thí nghiệm',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-white text-black font-sans flex min-h-screen">
        
        {/* --- 1. THANH MENU DỌC (SIDEBAR) --- */}
        <aside className="w-64 bg-gray-50 border-r border-gray-200 hidden md:flex flex-col p-4 fixed h-full overflow-y-auto">
          {/* Logo */}
          <div className="mb-8 px-4">
            <h1 className="text-2xl font-black text-blue-600">ASIC LAB ⚡</h1>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2 flex-1">
            <NavItem href="/" icon="" label="Quản lý Kho" />
            <NavItem href="/loans" icon="" label="Danh sách Mượn" />
            <NavItem href="/scan" icon="" label="Scan QR Mượn" />
          </nav>

          {/* Footer nhỏ ở dưới */}
          <div className="mt-auto p-4 text-xs text-gray-400">
            © 2025 Lab Manager
          </div>
        </aside>

        {/* --- 2. THANH MENU NGANG (CHO MOBILE) --- */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-50 shadow-lg">
           <Link href="/" className="text-2xl">📦</Link>
           <Link href="/scan" className="text-2xl bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-white -mt-6 border-4 border-white shadow">📸</Link>
           <Link href="/loans" className="text-2xl">📑</Link>
        </div>

        {/* --- 3. NỘI DUNG CHÍNH (MAIN CONTENT) --- */}
        <main className="flex-1 md:ml-64 p-4 md:p-8 bg-white min-h-screen pb-20 md:pb-8">
          {children}
        </main>

      </body>
    </html>
  );
}

// Component nhỏ hiển thị từng nút menu
function NavItem({ href, icon, label }: { href: string, icon: string, label: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 px-4 py-3 text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors">
      <span className="text-xl">{icon}</span>
      {label}
    </Link>
  );
}