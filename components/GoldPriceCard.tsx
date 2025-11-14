import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface GoldPriceCardProps {
  brand: string;
  buyPrice: number;
  sellPrice: number;
  previousBuyPrice?: number;
  previousSellPrice?: number;
}

export default function GoldPriceCard({ 
  brand, 
  buyPrice, 
  sellPrice, 
  previousBuyPrice, 
  previousSellPrice 
}: GoldPriceCardProps) {
  // Convert to *1000 units for display
  const buyPriceK = Math.round(buyPrice / 1000);
  const sellPriceK = Math.round(sellPrice / 1000);
  
  // Calculate changes
  const buyChange = previousBuyPrice ? buyPrice - previousBuyPrice : 0;
  const sellChange = previousSellPrice ? sellPrice - previousSellPrice : 0;
  
  // Convert changes to *1000 units
  const buyChangeK = Math.round(buyChange / 1000);
  const sellChangeK = Math.round(sellChange / 1000);
  
  // Calculate spread
  const spread = sellPrice - buyPrice;
  const spreadK = Math.round(spread / 1000);

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN');
  };

  return (
    <div className="group relative bg-gradient-to-br from-white via-amber-50/30 to-yellow-50/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-amber-100/50 hover:-translate-y-1 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/10 to-yellow-400/10 rounded-full -translate-y-10 translate-x-10"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{brand}</h3>
          <div className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">*1000 VNĐ</div>
      </div>
      
        <div className="space-y-5">
        {/* Buy Price */}
          <div className="relative bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100/50 group-hover:shadow-md transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-emerald-700 flex items-center space-x-1">
                  <span>💰</span>
                  <span>Giá mua</span>
                </span>
            <div className="flex items-center space-x-2">
              {getChangeIcon(buyChange)}
                  <span className={`text-sm font-bold ${getChangeColor(buyChange)} bg-white/70 px-2 py-1 rounded-full`}>
                {buyChangeK > 0 ? '+' : ''}{formatPrice(buyChangeK)}
              </span>
            </div>
          </div>
              <div className="text-3xl font-bold text-emerald-800 mb-1">
            {formatPrice(buyPriceK)}
          </div>
              <div className="text-xs text-emerald-600 font-medium">
            = {formatPrice(buyPrice)} VNĐ
              </div>
          </div>
        </div>

        {/* Sell Price */}
          <div className="relative bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border border-red-100/50 group-hover:shadow-md transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-rose-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-red-700 flex items-center space-x-1">
                  <span>💸</span>
                  <span>Giá bán</span>
                </span>
            <div className="flex items-center space-x-2">
              {getChangeIcon(sellChange)}
                  <span className={`text-sm font-bold ${getChangeColor(sellChange)} bg-white/70 px-2 py-1 rounded-full`}>
                {sellChangeK > 0 ? '+' : ''}{formatPrice(sellChangeK)}
              </span>
            </div>
          </div>
              <div className="text-3xl font-bold text-red-800 mb-1">
            {formatPrice(sellPriceK)}
          </div>
              <div className="text-xs text-red-600 font-medium">
            = {formatPrice(sellPrice)} VNĐ
          </div>
        </div>
          </div>

          {/* Spread */}
          <div className="relative bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-100/50 group-hover:shadow-md transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-sky-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-700 flex items-center space-x-1">
                  <span>📊</span>
                  <span>Chênh lệch</span>
                </span>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-semibold">*1000 VNĐ</span>
              </div>
              <div className="text-2xl font-bold text-blue-800 mb-1">
            {formatPrice(spreadK)}
          </div>
              <div className="text-xs text-blue-600 font-medium">
            = {formatPrice(spread)} VNĐ
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
