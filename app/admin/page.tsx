'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Download, Plus, Save, LogOut, User } from 'lucide-react';
import Header from '../../components/Header';
import { useBrands } from '../../contexts/BrandContext';

interface GoldPriceForm {
  brand: string;
  date: string;
  buyPrice: string;
  sellPrice: string;
}

interface BrandForm {
  id?: number;
  name: string;
  description: string;
  isActive: boolean;
}

export default function AdminPage() {
  const [locale, setLocale] = useState('vi');
  const [formData, setFormData] = useState<GoldPriceForm>({
    brand: 'SJC',
    date: new Date().toISOString().split('T')[0],
    buyPrice: '',
    sellPrice: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { brands, loading, addBrand, updateBrand, deleteBrand } = useBrands();
  const [brandForm, setBrandForm] = useState<BrandForm>({
    name: '',
    description: '',
    isActive: true
  });
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const router = useRouter();

  const defaultBrands = ['SJC', 'PNJ', 'DOJI', 'Phú Quý', 'Bảo Tín Minh Châu'];

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Cập nhật chartData khi brands thay đổi
  useEffect(() => {
    if (brands.length > 0) {
      // Trigger re-render của biểu đồ và bảng giá
      // Bạn có thể thêm logic gọi API để lấy dữ liệu mới nếu cần
      console.log('Brands updated:', brands);
      console.log('Brands type:', typeof brands);
      console.log('Brands length:', brands.length);
      console.log('First brand:', brands[0]);
    }
  }, [brands]);

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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleManualUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setMessage('');

    try {
      // Convert *1000 units to actual VND values
      const actualBuyPrice = Math.round(parseFloat(formData.buyPrice) * 1000);
      const actualSellPrice = Math.round(parseFloat(formData.sellPrice) * 1000);

      const response = await fetch('/api/admin/update-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: formData.brand,
          date: formData.date,
          buyPrice: actualBuyPrice,
          sellPrice: actualSellPrice
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('✅ Cập nhật giá vàng thành công!');
        setFormData(prev => ({ ...prev, buyPrice: '', sellPrice: '' }));
      } else {
        setMessage(`❌ Lỗi: ${result.message}`);
      }
    } catch (error) {
      setMessage('❌ Lỗi kết nối server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('❌ Vui lòng chọn file Excel');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/upload-excel', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ Upload thành công! Đã cập nhật ${result.updatedCount} bản ghi`);
        setFile(null);
      } else {
        setMessage(`❌ Lỗi: ${result.message}`);
      }
    } catch (error) {
      setMessage('❌ Lỗi kết nối server');
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    try {
      // Lấy dữ liệu giá vàng
      const response = await fetch('/api/gold-prices?days=30');
      if (!response.ok) {
        setMessage('❌ Lỗi khi lấy dữ liệu');
        return;
      }

      const data = await response.json();
      const goldPrices = data.data || [];

      if (goldPrices.length === 0) {
        setMessage('❌ Không có dữ liệu để xuất');
        return;
      }

      // Tạo nội dung CSV
      const csvContent = [
        'Thương hiệu,Ngày,Giá mua (*1000 VNĐ),Giá bán (*1000 VNĐ),Giá mua (VNĐ),Giá bán (VNĐ)',
        ...goldPrices.map((item: any) => 
          `${item.brand},${item.date},${Math.round(item.buy_price / 1000)},${Math.round(item.sell_price / 1000)},${item.buy_price},${item.sell_price}`
        )
      ].join('\n');

      // Tạo và tải file CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `gold-prices-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage('✅ Xuất CSV thành công!');
    } catch (error) {
      setMessage('❌ Lỗi khi xuất CSV');
      console.error('Export error:', error);
    }
  };

  const downloadTemplate = () => {
    window.open('/api/admin/download-template', '_blank');
  };

  // Brand Management Functions
  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brandForm.name.trim()) {
      setMessage('❌ Tên thương hiệu không được để trống');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      if (isEditingBrand && editingBrandId !== null) {
        // Update existing brand
        const response = await fetch(`/api/admin/brands/${editingBrandId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(brandForm)
        });

        if (response.ok) {
          setMessage('✅ Cập nhật thương hiệu thành công!');
          updateBrand(editingBrandId, brandForm.name);
          
          // Cập nhật formData.brand nếu đang sửa thương hiệu đang được chọn
          if (formData.brand === brands[editingBrandId]?.name) {
            setFormData(prev => ({ ...prev, brand: brandForm.name }));
          }
        } else {
          setMessage('❌ Lỗi khi cập nhật thương hiệu');
        }
      } else {
        // Add new brand
        const result = await addBrand(brandForm.name);
        
        if (result.success) {
          setMessage('✅ Thêm thương hiệu thành công!');
        } else {
          setMessage(`❌ Lỗi khi thêm thương hiệu: ${result.error}`);
        }
      }

      // Reset form
      setBrandForm({ name: '', description: '', isActive: true });
      setIsEditingBrand(false);
      setEditingBrandId(null);
      setShowBrandModal(false);
    } catch (error) {
      setMessage('❌ Lỗi kết nối server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBrand = (brandToEdit: any) => {
    setBrandForm({
      name: brandToEdit.name,
      description: brandToEdit.description || `${brandToEdit.name} - Thương hiệu vàng uy tín`,
      isActive: brandToEdit.is_active
    });
    setIsEditingBrand(true);
    setEditingBrandId(brandToEdit.id);
    setShowBrandModal(true);
  };

  const handleDeleteBrand = async (brandToDelete: any) => {
    if (!confirm(`Bạn có chắc muốn xóa thương hiệu "${brandToDelete.name}"?`)) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/admin/brands/${brandToDelete.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('✅ Xóa thương hiệu thành công!');
        deleteBrand(brandToDelete.id);
        
        // Cập nhật formData.brand nếu thương hiệu bị xóa đang được chọn
        if (formData.brand === brandToDelete.name) {
          // Chọn thương hiệu đầu tiên còn lại
          const newBrand = brands.length > 1 ? brands[1].name : '';
          setFormData(prev => ({ ...prev, brand: newBrand }));
        }
      } else {
        setMessage('❌ Lỗi khi xóa thương hiệu');
      }
    } catch (error) {
      setMessage('❌ Lỗi kết nối server');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddBrandModal = () => {
    setBrandForm({ name: '', description: '', isActive: true });
    setIsEditingBrand(false);
    setEditingBrandId(null);
    setShowBrandModal(true);
  };

  // Show loading while checking auth
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-yellow-100">
      <Header locale={locale} onLocaleChange={setLocale} />
      
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* User Info and Logout */}
          <div className="relative bg-gradient-to-r from-white via-amber-50/30 to-yellow-50/50 rounded-2xl shadow-lg border border-amber-100/50 p-6 mb-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-yellow-400/10 rounded-full -translate-y-16 translate-x-16"></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Đang đăng nhập với tư cách:</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{user.username}</p>
                  <p className="text-sm text-amber-600 font-medium">Quản trị viên hệ thống</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="group bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 transform hover:-translate-y-0.5"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* Dashboard Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full shadow-lg mb-6">
              <span className="text-3xl">🏆</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-800 bg-clip-text text-transparent mb-4">
              Quản Trị Giá Vàng
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Cập nhật giá vàng thủ công hoặc upload file Excel để quản lý dữ liệu
            </p>
          </div>

          {/* Brand Management Section */}
          <div className="relative bg-gradient-to-r from-white via-purple-50/30 to-indigo-50/50 rounded-2xl shadow-lg border border-purple-100/50 p-8 overflow-hidden mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 rounded-full -translate-y-16 translate-x-16"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🏷️</span>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Quản lý thương hiệu</h3>
                </div>
                <button
                  onClick={openAddBrandModal}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm thương hiệu</span>
                </button>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-lg text-gray-600">Đang tải danh sách thương hiệu...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {brands.map((brand, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-800">{brand.name}</h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditBrand(brand)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Sửa"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBrand(brand)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Xóa"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">Thương hiệu vàng uy tín</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
              {/* Manual Update Section */}
              <div className="relative bg-gradient-to-br from-white via-emerald-50/30 to-green-50/50 rounded-2xl shadow-lg border border-emerald-100/50 p-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/10 to-green-400/10 rounded-full -translate-y-12 translate-x-12"></div>
                
                <div className="relative space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Cập Nhật Thủ Công</h2>
                </div>

                  <form onSubmit={handleManualUpdate} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                      Thương hiệu
                    </label>
                    <select
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                        className="w-full bg-white/70 border border-emerald-200/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                      required
                    >
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.name}>{brand.name}</option>
                      ))}
                    </select>
                  </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                      Ngày
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                        className="w-full bg-white/70 border border-emerald-200/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                      required
                    />
                  </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        💰 Giá mua (*1000 VNĐ)
                    </label>
                    <input
                      type="number"
                      name="buyPrice"
                      value={formData.buyPrice}
                      onChange={handleInputChange}
                      placeholder="7000"
                      min="0"
                      step="1"
                        className="w-full bg-white/70 border border-emerald-200/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                      required
                    />
                      <p className="text-xs text-emerald-600 font-medium">Ví dụ: 7000 = 7,000,000 VNĐ</p>
                  </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        💸 Giá bán (*1000 VNĐ)
                    </label>
                    <input
                      type="number"
                      name="sellPrice"
                      value={formData.sellPrice}
                      onChange={handleInputChange}
                      placeholder="7200"
                      min="0"
                      step="1"
                        className="w-full bg-white/70 border border-emerald-200/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                      required
                    />
                      <p className="text-xs text-emerald-600 font-medium">Ví dụ: 7200 = 7,200,000 VNĐ</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                      className="group w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 transform hover:-translate-y-0.5"
                  >
                      <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-bold text-lg">{isLoading ? 'Đang cập nhật...' : 'Cập nhật giá'}</span>
                  </button>
                </form>
                </div>
              </div>

              {/* Excel Upload Section */}
              <div className="relative bg-gradient-to-br from-white via-blue-50/30 to-sky-50/50 rounded-2xl shadow-lg border border-blue-100/50 p-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-sky-500/5"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-sky-400/10 rounded-full -translate-y-12 translate-x-12"></div>
                
                <div className="relative space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Upload className="w-6 h-6 text-white" />
                </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Upload Excel</h2>
                  </div>

                  <div className="relative bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/50 rounded-xl p-6 mb-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
                    <div className="relative">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Download className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-cyan-800">Tải Template Excel</h3>
                      </div>
                      <p className="text-sm text-cyan-700 mb-4 leading-relaxed">
                    Tải xuống template Excel để nhập dữ liệu giá vàng theo định dạng chuẩn (*1000 VNĐ).
                  </p>
                  <button
                    onClick={downloadTemplate}
                        className="group bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 transform hover:-translate-y-0.5"
                  >
                        <Download className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        <span className="font-medium">Tải Template</span>
                  </button>
                    </div>
                </div>

                  <form onSubmit={handleFileUpload} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        📁 Chọn file Excel
                    </label>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                        className="w-full bg-white/70 border border-blue-200/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!file || isLoading}
                      className="group w-full bg-gradient-to-r from-blue-500 to-sky-500 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-sky-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 transform hover:-translate-y-0.5"
                  >
                      <Upload className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-bold text-lg">{isLoading ? 'Đang upload...' : 'Upload Excel'}</span>
                  </button>
                  
                  {/* Export CSV Button */}
                  <button
                    type="button"
                    onClick={exportData}
                    disabled={isLoading}
                    className="group w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 transform hover:-translate-y-0.5 mt-4"
                  >
                      <Download className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-bold text-lg">Xuất CSV</span>
                  </button>
                </form>
                </div>
              </div>
            </div>

            {/* Message Display */}
            {message && (
            <div className={`relative mt-8 p-6 rounded-2xl border shadow-lg ${
                message.includes('✅')
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200/50 text-emerald-800'
                : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200/50 text-red-800'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.includes('✅') ? 'bg-emerald-500' : 'bg-red-500'
                }`}>
                  <span className="text-white text-lg">{message.includes('✅') ? '✅' : '❌'}</span>
                </div>
                <span className="font-medium text-lg">{message}</span>
              </div>
              </div>
            )}

            {/* Instructions */}
          <div className="mt-12 relative bg-gradient-to-r from-white via-purple-50/30 to-indigo-50/50 rounded-2xl shadow-lg border border-purple-100/50 p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 rounded-full -translate-y-16 translate-x-16"></div>
            
            <div className="relative">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Hướng dẫn sử dụng</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mt-1">
                      <span className="text-emerald-600 font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 mb-1">Cập nhật thủ công</h4>
                      <p className="text-sm text-slate-600">Nhập giá theo đơn vị *1000 VNĐ (Ví dụ: 7000 = 7,000,000 VNĐ)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 mb-1">Upload Excel</h4>
                      <p className="text-sm text-slate-600">Tải template, điền dữ liệu theo đơn vị *1000 VNĐ và upload file</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mt-1">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 mb-1">Định dạng Excel</h4>
                      <p className="text-sm text-slate-600">Thương hiệu, Giá mua (*1000 VNĐ), Giá bán (*1000 VNĐ), Ngày</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mt-1">
                      <span className="text-amber-600 font-bold">💡</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 mb-1">Đơn vị hiển thị</h4>
                      <p className="text-sm text-slate-600">*1000 VNĐ để dễ nhập (Ví dụ: 7000 = 7 triệu VNĐ)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                      <span className="text-green-600 font-bold">📊</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 mb-1">Xuất dữ liệu</h4>
                      <p className="text-sm text-slate-600">Xuất dữ liệu giá vàng ra file CSV để phân tích</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">
                {isEditingBrand ? 'Sửa thương hiệu' : 'Thêm thương hiệu'}
              </h3>
              <button
                onClick={() => setShowBrandModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleBrandSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tên thương hiệu
                </label>
                <input
                  type="text"
                  value={brandForm.name}
                  onChange={(e) => setBrandForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Nhập tên thương hiệu"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={brandForm.description}
                  onChange={(e) => setBrandForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Mô tả thương hiệu"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={brandForm.isActive}
                  onChange={(e) => setBrandForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-sm text-slate-700">
                  Kích hoạt
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50"
                >
                  {isLoading ? 'Đang xử lý...' : (isEditingBrand ? 'Cập nhật' : 'Thêm mới')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBrandModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
