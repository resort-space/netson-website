'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Upload, Plus, Save, LogOut, User, FileText, Image, Settings, BarChart3, Package, Newspaper, ImageIcon } from 'lucide-react';
import Header from '../../components/Header';

interface AdminStats {
  products: number;
  articles: number;
  images: number;
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<AdminStats>({ products: 0, articles: 0, images: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
    loadStats();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/check');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      window.location.href = '/admin/login';
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Load dashboard stats
      const [productsRes, articlesRes, imagesRes] = await Promise.all([
        fetch('/api/products?limit=1'),
        fetch('/api/articles?published=true&limit=1'),
        fetch('/api/images?limit=1')
      ]);

      const productsData = productsRes.ok ? await productsRes.json() : { pagination: { total: 0 } };
      const articlesData = articlesRes.ok ? await articlesRes.json() : { pagination: { total: 0 } };
      const imagesData = imagesRes.ok ? await imagesRes.json() : { pagination: { total: 0 } };

      setStats({
        products: productsData.pagination?.total || 0,
        articles: articlesData.pagination?.total || 0,
        images: imagesData.pagination?.total || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in checkAuthStatus
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* User Info and Logout */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đang đăng nhập với tư cách:</p>
                  <p className="text-2xl font-bold text-gray-900">{user.username}</p>
                  <p className="text-sm text-blue-600 font-medium">Quản trị viên hệ thống</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* Dashboard Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg mb-6">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Quản Trị NetSon
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Quản lý sản phẩm, bài viết và hình ảnh cho website NetSon
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng sản phẩm</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.products}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Newspaper className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bài viết</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.articles}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hình ảnh</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.images}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Management */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Quản Lý Sản Phẩm</h3>
                  <p className="text-sm text-gray-600">Thêm, sửa, xóa sản phẩm cúp vinh danh</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/admin/products"
                  className="block w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-center"
                >
                  Quản Lý Sản Phẩm
                </Link>
                <button className="block w-full bg-green-100 hover:bg-green-200 text-green-700 py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-center">
                  Thêm Sản Phẩm Mới
                </button>
              </div>
            </div>

            {/* Article Management */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Quản Lý Bài Viết</h3>
                  <p className="text-sm text-gray-600">Viết bài, chỉnh sửa nội dung SEO</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/admin/articles"
                  className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-center"
                >
                  Quản Lý Bài Viết
                </Link>
                <Link href="/admin/articles/new" className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-center">
                  Viết Bài Mới
                </Link>
              </div>
            </div>

            {/* Image Management */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Quản Lý Hình Ảnh</h3>
                  <p className="text-sm text-gray-600">Upload và quản lý hình ảnh Cloudinary</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/admin/images"
                  className="block w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-center"
                >
                  Quản Lý Hình Ảnh
                </Link>
                <button className="block w-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-center">
                  Upload Hình Mới
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Cài Đặt</h3>
                  <p className="text-sm text-gray-600">Banner, thông tin liên hệ, cấu hình website</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/admin/settings"
                  className="block w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-center"
                >
                  Quản Lý Cài Đặt
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Thao Tác Nhanh</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/articles/new"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-3"
              >
                <Plus className="w-5 h-5" />
                <span>Viết Bài Mới</span>
              </Link>

              <Link
                href="/admin/products/new"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-3"
              >
                <Plus className="w-5 h-5" />
                <span>Thêm Sản Phẩm</span>
              </Link>

              <Link
                href="/admin/images"
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Ảnh</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
