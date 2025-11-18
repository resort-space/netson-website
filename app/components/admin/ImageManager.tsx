"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

interface ImageItem {
  id: number;
  url: string;
  is_featured: boolean;
}

interface ImageManagerProps {
  currentImages: ImageItem[];
  newImages: File[];
  onUpdateCurrentImages: (images: ImageItem[]) => void;
  onUpdateNewImages: (images: File[]) => void;
}

export default function ImageManager({
  currentImages,
  newImages,
  onUpdateCurrentImages,
  onUpdateNewImages,
}: ImageManagerProps) {
  const handleRemoveCurrentImage = (index: number) => {
    const updatedImages = currentImages.filter((_, i) => i !== index);
    onUpdateCurrentImages(updatedImages);
  };

  const handleToggleFeatured = (index: number) => {
    const updatedImages = currentImages.map((img, i) => ({
      ...img,
      is_featured: i === index,
    }));
    onUpdateCurrentImages(updatedImages);
  };

  const handleNewImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const updatedNewImages = [...newImages, ...files];
      onUpdateNewImages(updatedNewImages);
    }
  };

  const handleRemoveNewImage = () => {
    onUpdateNewImages([]);
  };

  return (
    <div className="md:col-span-2 border-t pt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Quản Lý Hình Ảnh Sản Phẩm
      </h3>

      {/* Current Images */}
      {currentImages.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Hình ảnh hiện tại ({currentImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                {image.is_featured && (
                  <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    Nổi bật
                  </div>
                )}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleRemoveCurrentImage(index)}
                    className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="absolute bottom-1 left-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(index)}
                    className={`w-full text-xs py-1 px-2 rounded text-white ${
                      image.is_featured
                        ? "bg-yellow-600"
                        : "bg-yellow-500 hover:bg-yellow-600"
                    }`}
                  >
                    {image.is_featured ? "Hủy nổi bật" : "Đặt nổi bật"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Images */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Thêm hình ảnh mới
        </h4>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleNewImagesSelect}
            className="w-full"
          />
          {newImages.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">
                {newImages.length} ảnh sẽ được thêm
              </p>
              <button
                type="button"
                onClick={handleRemoveNewImage}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Xóa tất cả ảnh mới
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Chọn nhiều ảnh để upload cùng lúc. Ảnh đầu tiên sẽ được đặt làm nổi
          bật nếu sản phẩm chưa có ảnh nổi bật.
        </p>
      </div>
    </div>
  );
}
