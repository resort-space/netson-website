'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import CategoryNavigation from '../components/CategoryNavigation';
import Breadcrumb from '../components/Breadcrumb';
import Banner from '../components/Banner';
import { Product } from '../lib/database';

export default function HomePage() {
  const [showPopupBanner, setShowPopupBanner] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'popular' | 'rating' | 'latest' | 'price_low' | 'price_high'>('default');
  const [isLoading, setIsLoading] = useState(true);

  // Show popup banner on first visit
  useEffect(() => {
    const hasSeenBanner = localStorage.getItem('netson-banner-seen');
    if (!hasSeenBanner) {
      setShowPopupBanner(true);
    }
  }, []);

  const handleBannerClose = () => {
    setShowPopupBanner(false);
    localStorage.setItem('netson-banner-seen', 'true');
  };

  const handleCategoryChange = (categorySlug: string | null) => {
    setCurrentCategory(categorySlug);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
  };

  // Load products when category or search changes
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        let url = '/api/products?';
        if (currentCategory) {
          url += `category=${currentCategory}&`;
        }
        if (searchQuery) {
          url += `search=${encodeURIComponent(searchQuery)}&`;
        }
        url += `sort_by=${sortBy}`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setProducts(data.data || []);
          }
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [currentCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Pop-up Banner */}
      <Banner
        isVisible={showPopupBanner}
        onClose={handleBannerClose}
        title="Chào mừng đến với NetSon!"
        message="Chuyên sản xuất cúp vinh danh chất lượng cao. Thiết kế theo yêu cầu riêng biệt."
      />

      {/* Header */}
      <Header />

      {/* Breadcrumb */}
      <Breadcrumb items={[]} />

      {/* Category Navigation with Search */}
      <CategoryNavigation
        currentCategory={currentCategory || undefined}
        onCategoryChange={handleCategoryChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Banner Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {currentCategory ? `Danh mục: ${currentCategory}` : 'NetSon - Cúp Vinh Danh Chuyên Nghiệp'}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              {currentCategory
                ? 'Khám phá bộ sưu tập sản phẩm chất lượng cao của chúng tôi'
                : 'Sản xuất và chế tác các loại cúp, huy chương, bằng khen vinh danh với thiết kế tinh tế và chất lượng vượt trội'
              }
            </p>
          </div>
        </div>
      </section>

      {/* Sort Options */}
      <section className="bg-white py-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-lg font-semibold text-gray-800">
              Sắp xếp theo:
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'default' as const, label: 'Mặc định' },
                { value: 'popular' as const, label: 'Phổ biến' },
                { value: 'rating' as const, label: 'Đánh giá' },
                { value: 'latest' as const, label: 'Mới nhất' },
                { value: 'price_low' as const, label: 'Thấp đến cao' },
                { value: 'price_high' as const, label: 'Cao đến thấp' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    sortBy === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải sản phẩm...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-500">
                <p className="text-xl mb-2">Không tìm thấy sản phẩm nào</p>
                <p className="text-sm">Hãy thử tìm kiếm với từ khóa khác</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-square bg-gray-200 relative">
                    {product.featured_image || (product.images && product.images.length > 0) ? (
                      <img
                        src={product.featured_image || product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span>Không có ảnh</span>
                      </div>
                    )}
                    {product.is_featured && (
                      <span className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                        Nổi bật
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.title}
                    </h3>

                    <div className="flex justify-between items-center mb-3">
                      <div className="text-lg font-bold text-blue-600">
                        {product.price ? `${product.price.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        ⭐ {product.rating.toFixed(1)} ({product.likes} lượt thích)
                      </div>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Cần Tư Vấn Thiết Kế Cúp?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Chúng tôi chuyên thiết kế và sản xuất cúp theo yêu cầu riêng biệt của quý khách hàng. Liên hệ ngay để được tư vấn miễn phí!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200">
              Liên Hệ Ngay
            </a>
            <a href="/about" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold transition-all duration-200">
              Về Chúng Tôi
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
