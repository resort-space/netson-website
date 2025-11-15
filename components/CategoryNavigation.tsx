'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

interface CategoryNavigationProps {
  currentCategory?: string;
  onCategoryChange?: (categorySlug: string | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function CategoryNavigation({
  currentCategory,
  onCategoryChange,
  searchQuery = '',
  onSearchChange
}: CategoryNavigationProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Load categories from API
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCategories(data.data || []);
          }
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to default categories
        setCategories([
          { id: 1, name: 'Cúp Vinh Danh', slug: 'cup-vinh-danh', is_active: true },
          { id: 2, name: 'Cúp Thể Thao', slug: 'cup-the-thao', is_active: true },
          { id: 3, name: 'Bảng Vinh Danh', slug: 'bang-vinh-danh', is_active: true },
          { id: 4, name: 'Kỷ Niệm Chương', slug: 'ky-niem-chuong', is_active: true },
          { id: 5, name: 'Cúp Chế Tác Theo Yêu Cầu', slug: 'cup-che-tac-yeu-cau', is_active: true },
          { id: 6, name: 'Sản Phẩm Đã Thực Hiện', slug: 'san-pham-da-thuc-hien', is_active: true },
        ]);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryClick = (categorySlug: string | null) => {
    if (onCategoryChange) {
      onCategoryChange(categorySlug);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
          <Link
            href="/products"
            onClick={() => handleCategoryClick(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !currentCategory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả sản phẩm
          </Link>
          {categories
            .filter(cat => cat.is_active)
            .map((category) => (
              <Link
                key={category.id}
                href={`/products/${category.slug}`}
                onClick={() => handleCategoryClick(category.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  currentCategory === category.slug
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </Link>
            ))}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
