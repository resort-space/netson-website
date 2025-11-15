'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BannerProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  imageUrl?: string;
  linkUrl?: string;
  backgroundColor?: string;
  textColor?: string;
}

export default function Banner({
  isVisible,
  onClose,
  title = "Chào mừng đến với NetSon!",
  message = "Chuyên sản xuất cúp vinh danh chất lượng cao. Thiết kế theo yêu cầu riêng biệt.",
  imageUrl,
  linkUrl,
  backgroundColor = "bg-gradient-to-r from-blue-600 to-purple-600",
  textColor = "text-white"
}: BannerProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Delay to allow for animation
      setTimeout(() => setShow(true), 100);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const handleBannerClick = () => {
    if (linkUrl) {
      window.open(linkUrl, '_blank');
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
      show ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Banner Content */}
      <div className={`relative max-w-2xl w-full ${backgroundColor} rounded-2xl shadow-2xl overflow-hidden transform transition-transform duration-300 ${
        show ? 'scale-100' : 'scale-95'
      }`}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div
          className={`${textColor} p-8 md:p-12 cursor-pointer`}
          onClick={handleBannerClick}
        >
          {imageUrl ? (
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  {title}
                </h2>
                <p className="text-lg md:text-xl opacity-90 mb-6">
                  {message}
                </p>
                <div className="inline-block bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition-colors">
                  Tìm hiểu thêm →
                </div>
              </div>
              <div className="flex-shrink-0">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {title}
              </h2>
              <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-2xl mx-auto">
                {message}
              </p>
              <div className="inline-block bg-white/20 hover:bg-white/30 px-8 py-4 rounded-lg font-semibold transition-colors">
                Khám phá ngay →
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
