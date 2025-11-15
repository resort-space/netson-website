'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Header from '../../../components/Header';
import Breadcrumb from '../../../components/Breadcrumb';
import { Image as ImageType } from '../../../lib/database';

export default function ImagesAdminPage() {
  const [user, setUser] = useState<any>(null);
  const [images, setImages] = useState<ImageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [title, setTitle] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [productId, setProductId] = useState('');
  const [products, setProducts] = useState<any[]>([]);

  // Modal state for assigning images to products
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
    loadImages();
    loadProducts();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/check');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products/crud');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProducts(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadImages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/images');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setImages(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file type
      if (!file.type.startsWith('image/')) {
        showMessage('Vui lòng chọn file ảnh hợp lệ', 'error');
        return;
      }
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showMessage('File ảnh không được vượt quá 5MB', 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      showMessage('Vui lòng chọn file ảnh', 'error');
      return;
    }

    setUploadLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      if (altText.trim()) formData.append('alt_text', altText.trim());
      if (title.trim()) formData.append('title', title.trim());
      if (productId.trim()) formData.append('product_id', productId.trim());
      formData.append('is_featured', isFeatured.toString());

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showMessage('Upload ảnh thành công!', 'success');
        // Reset form
        setSelectedFile(null);
        setAltText('');
        setTitle('');
        setIsFeatured(false);
        setProductId('');
        // Reload images
        loadImages();
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        showMessage(data.message || 'Lỗi upload ảnh', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('Lỗi kết nối server', 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <Breadcrumb items={[
        { label: 'Admin', href: '/admin' },
        { label: 'Quản Lý Hình Ảnh' }
      ]} />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản Lý Hình Ảnh</h1>
              <p className="text-gray-600 mt-2">Upload và quản lý hình ảnh sản phẩm</p>
            </div>
            <Link
              href="/admin"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Quay lại Dashboard
            </Link>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg border ${
              messageType === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center space-x-2">
                {messageType === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>{message}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Ảnh Mới</h2>

                <form onSubmit={handleUpload} className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn File Ảnh
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                      <div className="space-y-1 text-center">
                        {selectedFile ? (
                          <div className="flex items-center space-x-2">
                            <ImageIcon className="w-8 h-8 text-blue-600" />
                            <div className="text-left">
                              <p className="text-sm text-gray-900">{selectedFile.name}</p>
                              <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFile(null);
                                const fileInput = document.getElementById('file-input') as HTMLInputElement;
                                if (fileInput) fileInput.value = '';
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="file-input"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                              >
                                <span>Upload ảnh</span>
                                <input
                                  id="file-input"
                                  name="file"
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={handleFileSelect}
                                />
                              </label>
                              <p className="pl-1">hoặc kéo thả</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF tối đa 5MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiêu đề (tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập tiêu đề ảnh"
                    />
                  </div>

                  {/* Alt Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả ảnh (Alt Text - tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập mô tả cho ảnh"
                    />
                  </div>

                  {/* Product Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gán cho sản phẩm (tùy chọn)
                    </label>
                    <select
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn sản phẩm...</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.title} {product.price ? `(${product.price.toLocaleString('vi-VN')}₫)` : '(Liên hệ)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Featured Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                      Đặt làm ảnh nổi bật
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={uploadLoading || !selectedFile}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    {uploadLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang upload...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>Upload Ảnh</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Images List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Danh Sách Hình Ảnh ({images.length})
                </h2>

                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải hình ảnh...</p>
                  </div>
                ) : images.length === 0 ? (
                  <div className="text-center py-8">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Chưa có hình ảnh nào</p>
                    <p className="text-sm text-gray-400">Upload ảnh đầu tiên của bạn</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={image.secure_url}
                            alt={image.alt_text || image.title || 'Product image'}
                            className="w-full h-full object-cover"
                          />
                          {image.is_featured && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                              Nổi bật
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {image.title || 'Untitled'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(image.created_at).toLocaleDateString('vi-VN')}
                          </p>
                          {image.product_id && (
                            <p className="text-xs text-blue-600">
                              Sản phẩm: {image.product_id}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
