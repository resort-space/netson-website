'use client';

import { useState, useEffect } from 'react';
import GoldPriceChart from '../components/GoldPriceChart';
import { RefreshCw, TrendingUp, Info } from 'lucide-react';
import { useBrands } from '../contexts/BrandContext';

interface GoldPrice {
  id: number;
  brand: string;
  buy_price: number;
  sell_price: number;
  date: string;
  created_at: string;
  updated_at: string;
}

interface ChartData {
  date: string;
  buy_price: number;
  sell_price: number;
  average_price: number;
  brand: string;
}

export default function HomePage() {
  const [goldPrices, setGoldPrices] = useState<GoldPrice[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);


  const { brands, loading } = useBrands();
  
  console.log('🏷️ Brands from context:', brands);
  console.log('🔄 Loading state:', loading);
  console.log('📊 Chart data state:', chartData);
  console.log('📏 Brands length:', brands.length);
  console.log('📏 Chart data length:', chartData.length);
  


  const fetchGoldPrices = async () => {
    try {
      // Lấy dữ liệu của 7 ngày gần nhất để có thể so sánh
      const response = await fetch('/api/gold-prices?days=7');
      if (response.ok) {
        const data = await response.json();
        setGoldPrices(data.data || []);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching gold prices:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      console.log('🔍 Fetching chart data...');
      const response = await fetch('/api/gold-prices/chart?period=month');
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Chart API response:', data);
        const newChartData = data.data || [];
        console.log('📈 New chart data:', newChartData);
        setChartData(newChartData);
      }
    } catch (error) {
      console.error('❌ Error fetching chart data:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchGoldPrices(), fetchChartData()]);
      setIsLoading(false);
    };

    loadData();

    // Auto-refresh every hour between 9 AM and 7 PM
    const interval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      if (hour >= 9 && hour < 19) {
        loadData();
      }
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    await Promise.all([fetchGoldPrices(), fetchChartData()]);
    setIsLoading(false);
  };

  const getPreviousPrice = (brand: string, currentDate: string) => {
    const current = new Date(currentDate);
    const previous = new Date(current);
    previous.setDate(previous.getDate() - 1);
    
    // Chuyển đổi ngày hiện tại và ngày trước về format YYYY-MM-DD
    const currentDateStr = current.toISOString().split('T')[0];
    const previousDateStr = previous.toISOString().split('T')[0];
    
    console.log(`Tìm giá trước cho ${brand}:`);
    console.log(`Current date: ${currentDate} -> ${currentDateStr}`);
    console.log(`Previous date: ${previousDateStr}`);
    console.log(`Available dates:`, goldPrices.map(p => `${p.brand}: ${p.date} -> ${new Date(p.date).toISOString().split('T')[0]}`));
    
    // Tìm giá của ngày trước trong dữ liệu hiện tại
    const previousPrice = goldPrices.find(
      price => {
        const priceDateStr = new Date(price.date).toISOString().split('T')[0];
        return price.brand === brand && priceDateStr === previousDateStr;
      }
    );
    
    if (previousPrice) {
      console.log(`Tìm thấy giá trước: ${previousPrice.buy_price} / ${previousPrice.sell_price}`);
      return previousPrice;
    }
    
    // Nếu không tìm thấy, thử tìm trong khoảng 7 ngày gần nhất
    console.log(`Không tìm thấy ngày trước, tìm trong 7 ngày gần nhất...`);
    for (let i = 2; i <= 7; i++) {
      const checkDate = new Date(current);
      checkDate.setDate(checkDate.getDate() - i);
      const checkDateStr = checkDate.toISOString().split('T')[0];
      
      const foundPrice = goldPrices.find(
        price => {
          const priceDateStr = new Date(price.date).toISOString().split('T')[0];
          return price.brand === brand && priceDateStr === checkDateStr;
        }
      );
      
      if (foundPrice) {
        console.log(`Tìm thấy giá ở ngày ${checkDateStr}: ${foundPrice.buy_price} / ${foundPrice.sell_price}`);
        return foundPrice;
      }
    }
    
    console.log(`Không tìm thấy giá trước cho ${brand}`);
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-gold-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu giá vàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-yellow-100">
      {/* Compact Header with Refresh */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-amber-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="group bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-2 rounded-full hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 transform hover:-translate-y-0.5"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              <span className="text-sm font-medium">Làm mới dữ liệu</span>
            </button>
            
            {lastUpdated && (
              <div className="flex items-center space-x-2 text-slate-600 bg-white/70 backdrop-blur-sm px-3 py-2 rounded-full border border-amber-200/50">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">
                  Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Chart Section - Moved to top */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent mb-2">
              Biểu đồ giá vàng miếng
            </h2>
            <p className="text-slate-600">Theo dõi xu hướng giá vàng miếng theo thời gian</p>
          </div>
          
          {brands.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-gray-600">Đang tải danh sách thương hiệu...</div>
            </div>
          ) : (
            <GoldPriceChart data={chartData} brands={brands} />
          )}
        </div>

        {/* Price Table Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
              Bảng giá chi tiết
            </h2>
            <p className="text-slate-600">So sánh giá giữa các thương hiệu một cách dễ dàng</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-50 to-yellow-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Thương hiệu</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">Giá mua (*1000 VNĐ)</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">Giá bán (*1000 VNĐ)</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">Chênh lệch</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">
                      <div className="flex flex-col items-center space-y-1">
                        <span>Thay đổi</span>
                        <span className="text-xs font-normal text-slate-500">So với ngày trước</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {brands.map((brand, index) => {
                    const price = goldPrices.find(p => p.brand === brand.name);
                    
                    if (!price) {
                      return (
                        <tr key={brand.name} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm font-bold">{brand.name.charAt(0)}</span>
                              </div>
                              <span className="font-semibold text-slate-800">{brand.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-gray-400">Chưa có dữ liệu</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-gray-400">Chưa có dữ liệu</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-gray-400">-</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-gray-400">-</span>
                          </td>
                        </tr>
                      );
                    }

                    const previousPrice = getPreviousPrice(brand.name, price.date);
                    const buyPriceK = Math.round(price.buy_price / 1000);
                    const sellPriceK = Math.round(price.sell_price / 1000);
                    const spreadK = sellPriceK - buyPriceK;
                    
                    // Debug: Log để xem vấn đề
                    console.log(`Brand: ${brand.name}, Date: ${price.date}`);
                    console.log(`Current price: ${price.buy_price} / ${price.sell_price}`);
                    console.log(`Previous price:`, previousPrice);
                    console.log(`Gold prices array:`, goldPrices.map(p => `${p.brand}: ${p.date}`));
                    
                    const buyChange = previousPrice ? Math.round((price.buy_price - previousPrice.buy_price) / 1000) : 0;
                    const sellChange = previousPrice ? Math.round((price.sell_price - previousPrice.sell_price) / 1000) : 0;
                    
                    return (
                      <tr key={brand.name} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm font-bold">{brand.name.charAt(0)}</span>
                            </div>
                            <span className="font-semibold text-slate-800">{brand.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-emerald-600">{buyPriceK.toLocaleString('vi-VN')}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-red-600">{sellPriceK.toLocaleString('vi-VN')}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-medium text-blue-600">{spreadK.toLocaleString('vi-VN')}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col space-y-2">
                            {/* Giá mua */}
                            <div className="flex flex-col items-center space-y-1">
                              <span className="text-xs font-medium text-slate-600">Giá mua</span>
                              <div className={`text-xs px-3 py-1 rounded-full font-semibold ${buyChange > 0 ? 'bg-green-100 text-green-700' : buyChange < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                {buyChange > 0 ? '↗️ +' : buyChange < 0 ? '↘️ ' : '➖ '}
                                {buyChange !== 0 ? Math.abs(buyChange).toLocaleString('vi-VN') : '0'}
                              </div>
                            </div>
                            
                            {/* Giá bán */}
                            <div className="flex flex-col items-center space-y-1">
                              <span className="text-xs font-medium text-slate-600">Giá bán</span>
                              <div className={`text-xs px-3 py-1 rounded-full font-semibold ${sellChange > 0 ? 'bg-green-100 text-green-700' : sellChange < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                {sellChange > 0 ? '↗️ +' : sellChange < 0 ? '↘️ ' : '➖ '}
                                {sellChange !== 0 ? Math.abs(sellChange).toLocaleString('vi-VN') : '0'}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Contact & Contribution Section */}
        <div className="relative">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
              Thông tin liên hệ & Đóng góp
            </h3>
            <p className="text-lg text-slate-600">
              Liên hệ với chúng tôi để đóng góp ý kiến hoặc báo cáo vấn đề
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative bg-gradient-to-br from-white to-amber-50/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center border border-amber-100/50 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <span className="text-3xl">📧</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Email liên hệ</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Gửi email để đóng góp ý kiến, báo cáo lỗi hoặc đề xuất tính năng mới
                </p>
                <a 
                  href="mailto:quangvantiep.work@gmail.com" 
                  className="inline-block bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 font-medium"
                >
                  quangvantiep.work@gmail.com
                </a>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center border border-blue-100/50 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <span className="text-3xl">💡</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Đóng góp ý kiến</h3>
                <p className="text-slate-600 leading-relaxed">
                  Chia sẻ ý tưởng để cải thiện nền tảng theo dõi giá vàng, giúp chúng tôi phục vụ tốt hơn
                </p>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center border border-emerald-100/50 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <span className="text-3xl">🐛</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Báo cáo lỗi</h3>
                <p className="text-slate-600 leading-relaxed">
                  Nếu bạn gặp vấn đề khi sử dụng, hãy báo cáo để chúng tôi khắc phục nhanh chóng
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
