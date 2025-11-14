'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Settings, Globe, Menu, X } from 'lucide-react';

interface HeaderProps {
  locale?: string;
  onLocaleChange?: (locale: string) => void;
}

export default function Header({ locale = 'vi', onLocaleChange }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const translations = {
    vi: {
      home: 'Trang chủ',
      admin: 'Quản trị',
      language: 'Ngôn ngữ',
      vietnamese: 'Tiếng Việt',
      english: 'Tiếng Anh',
    },
    en: {
      home: 'Home',
      admin: 'Admin',
      language: 'Language',
      vietnamese: 'Vietnamese',
      english: 'English',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.vi;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLocaleChange = (newLocale: string) => {
    if (onLocaleChange) {
      onLocaleChange(newLocale);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-amber-200/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-3">
              <div className="relative w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative text-white font-bold text-xl">🏆</span>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  Giá Vàng VN
                </span>
                <div className="text-xs text-slate-500 font-medium">Cập nhật theo thời gian thực</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="group flex items-center space-x-2 px-4 py-2 rounded-xl text-slate-600 hover:text-amber-600 hover:bg-amber-50/50 transition-all duration-300"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">{t.home}</span>
            </Link>
            
            <Link
              href="/admin"
              className="group flex items-center space-x-2 px-4 py-2 rounded-xl text-slate-600 hover:text-amber-600 hover:bg-amber-50/50 transition-all duration-300"
            >
              <Settings className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">{t.admin}</span>
            </Link>

            {/* Language Selector */}
            <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm border border-amber-200/50 rounded-xl px-4 py-2">
              <Globe className="w-5 h-5 text-amber-600" />
              <select
                value={locale}
                onChange={(e) => handleLocaleChange(e.target.value)}
                className="bg-transparent border-none text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="vi">{t.vietnamese}</option>
                <option value="en">{t.english}</option>
              </select>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-amber-200/50 text-slate-600 hover:text-amber-600 hover:bg-amber-50/50 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-amber-200/50 py-6 bg-white/50 backdrop-blur-sm">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:text-amber-600 hover:bg-amber-50/50 transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">{t.home}</span>
              </Link>
              
              <Link
                href="/admin"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:text-amber-600 hover:bg-amber-50/50 transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">{t.admin}</span>
              </Link>

              {/* Mobile Language Selector */}
              <div className="flex items-center justify-between px-4 py-3 mt-4 pt-6 border-t border-amber-200/50">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-slate-700">{t.language}:</span>
                </div>
                <select
                  value={locale}
                  onChange={(e) => handleLocaleChange(e.target.value)}
                  className="bg-white/70 border border-amber-200/50 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="vi">{t.vietnamese}</option>
                  <option value="en">{t.english}</option>
                </select>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
