'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Calendar, Filter } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface Brand {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

interface GoldPriceChartProps {
  data: {
    date: string;
    buy_price: number;
    sell_price: number;
    average_price: number;
    brand: string;
  }[];
  brands: Brand[];
}

export default function GoldPriceChart({ data, brands }: GoldPriceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(brands.map(b => b.name));
  const [chartData, setChartData] = useState<any>(null);

  const periods = [
    { value: 'day', label: 'Ngày' },
    { value: 'week', label: 'Tuần' },
    { value: 'month', label: 'Tháng' },
    { value: 'year', label: 'Năm' },
    { value: 'decade', label: 'Thập kỷ' },
    { value: '50years', label: '50 năm' },
  ];

  // Update selectedBrands when brands change
  useEffect(() => {
    if (brands && brands.length > 0) {
      setSelectedBrands(brands.map(b => b.name));
    }
  }, [brands]);

  useEffect(() => {
    // Ensure data is an array and has the expected structure
    if (data && Array.isArray(data) && data.length > 0 && selectedBrands.length > 0) {
      const filteredData = data.filter(item => 
        item && item.brand && selectedBrands.includes(item.brand)
      );

      if (filteredData.length === 0) {
        setChartData(null);
        return;
      }

      // Tạo màu động cho mỗi thương hiệu để tránh trùng
      const generateColor = (index: number) => {
        const baseColors = [
          'rgb(245, 158, 11)',   // amber-500
          'rgb(59, 130, 246)',   // blue-500
          'rgb(16, 185, 129)',   // emerald-500
          'rgb(239, 68, 68)',    // red-500
          'rgb(139, 92, 246)',   // violet-500
          'rgb(236, 72, 153)',   // pink-500
          'rgb(168, 85, 247)',   // purple-500
          'rgb(34, 197, 94)',    // green-500
          'rgb(249, 115, 22)',   // orange-500
          'rgb(6, 182, 212)',    // cyan-500
          'rgb(147, 51, 234)',   // violet-600
          'rgb(220, 38, 127)',   // pink-600
          'rgb(5, 150, 105)',    // emerald-600
          'rgb(185, 28, 28)',    // red-700
          'rgb(30, 64, 175)',    // blue-700
          'rgb(120, 53, 15)',    // amber-800
        ];
        
        // Nếu index vượt quá baseColors, tạo màu ngẫu nhiên
        if (index >= baseColors.length) {
          const hue = (index * 137.508) % 360; // Golden angle để tạo màu đẹp
          const saturation = 70 + (index % 20); // 70-90%
          const lightness = 45 + (index % 15);  // 45-60%
          return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        }
        
        return baseColors[index];
      };

      const datasets: any[] = [];

      // Tạo 2 datasets riêng biệt cho mỗi thương hiệu
      selectedBrands.forEach((brand, index) => {
        const brandData = filteredData.filter(item => item.brand === brand);
        const color = generateColor(index);

        // Dataset giá mua - hiển thị trong legend
        const buyDataset = {
          label: `${brand} - Mua`,
          data: brandData.map(item => ({
            x: new Date(item.date),
            y: Math.round(item.buy_price / 1000)
          })),
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          borderDash: [8, 4], // Nét đứt
          tension: 0.2,
          pointRadius: 3,
          pointHoverRadius: 5,
        };
        datasets.push(buyDataset);

        // Dataset giá bán - hiển thị trong legend
        const sellDataset = {
          label: `${brand} - Bán`,
          data: brandData.map(item => ({
            x: new Date(item.date),
            y: Math.round(item.sell_price / 1000)
          })),
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          borderDash: [], // Nét liền
          tension: 0.2,
          pointRadius: 3,
          pointHoverRadius: 5,
        };
        datasets.push(sellDataset);
      });

      setChartData({
        datasets,
      });
    } else {
      setChartData(null);
    }
  }, [data, selectedBrands]);

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };



  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: false,
          padding: 20,
          font: { size: 12, weight: 'bold' as const },
          color: '#374151',
          boxWidth: 40,
          boxHeight: 2,
        },
        title: {
          display: true,
          text: 'Chọn thương hiệu để hiển thị:',
          font: { size: 14, weight: 'bold' as const },
          color: '#374151',
        },
        subtitle: {
          display: true,
          text: 'Nét đứt = Giá mua | Nét liền = Giá bán',
          font: { size: 12, weight: 'normal' as const },
          color: '#6b7280',
        },
      },
      title: {
        display: true,
        text: `Biểu đồ giá vàng - ${periods.find(p => p.value === selectedPeriod)?.label}`,
        font: { size: 16, weight: 'bold' as const },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#f59e0b',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: false,
        boxWidth: 40,
        boxHeight: 2,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const isDashed = context.dataset.borderDash && context.dataset.borderDash.length > 0;
            const lineType = isDashed ? 'Giá mua (Nét đứt)' : 'Giá bán (Nét liền)';
            return `${label} - ${lineType}: ${value.toLocaleString('vi-VN')} (*1000 VNĐ)`;
          },
          title: function(context: any) {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: selectedPeriod === 'day' ? 'day' : 
                selectedPeriod === 'week' ? 'week' : 
                selectedPeriod === 'month' ? 'month' : 
                selectedPeriod === 'year' ? 'year' : 'year',
        } as const,
        title: {
          display: true,
          text: 'Thời gian',
          font: { size: 14, weight: 'bold' as const },
          color: '#374151',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
          font: { size: 12 },
          maxTicksLimit: 8,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Giá (*1000 VNĐ)',
          font: { size: 14, weight: 'bold' as const },
          color: '#374151',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
          font: { size: 12 },
          callback: function(value: any) {
            return value.toLocaleString('vi-VN');
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  // Show loading state if no data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Không có dữ liệu biểu đồ</div>
        </div>
      </div>
    );
  }

  // Show loading state if chart data is not ready
  if (!chartData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu biểu đồ...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-2">
          <Calendar className="w-6 h-6 text-gold-600" />
          <h2 className="text-2xl font-bold text-gray-800">Biểu đồ giá vàng</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Period Selector */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>


        </div>
      </div>

      {/* Brand Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Lọc theo thương hiệu:</h3>
        <div className="flex flex-wrap gap-2">
          {brands.map(brand => (
            <button
              key={brand.id}
              onClick={() => handleBrandToggle(brand.name)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedBrands.includes(brand.name)
                  ? 'bg-gold-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {brand.name}
            </button>
          ))}
        </div>
      </div>

      {/* Unit Information */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-blue-800">📊 Đơn vị hiển thị:</span>
          <span className="text-sm text-blue-700">*1000 VNĐ (Ví dụ: 7000 = 7,000,000 VNĐ)</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-96">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Data Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Tóm tắt dữ liệu:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Tổng số bản ghi:</span>
            <span className="ml-2 text-gray-800">{data.length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Thương hiệu được chọn:</span>
            <span className="ml-2 text-gray-800">{selectedBrands.length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Khoảng thời gian:</span>
            <span className="ml-2 text-gray-800">{periods.find(p => p.value === selectedPeriod)?.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
