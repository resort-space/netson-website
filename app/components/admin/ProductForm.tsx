"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Product } from "../../../lib/database";

interface ProductFormData {
  title: string;
  description: string;
  category_id: string;
  price: string;
  meta_description: string;
  materials: string;
  stock_quantity: string;
  is_featured: boolean;
  is_active: boolean;
}

interface ProductFormProps {
  editingProduct: Product | null;
  categories: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function ProductForm({
  editingProduct,
  categories,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    title: editingProduct?.title || "",
    description: editingProduct?.description || "",
    category_id: editingProduct?.category_id?.toString() || "",
    price: editingProduct?.price?.toString() || "",
    meta_description: editingProduct?.meta_description || "",
    materials: editingProduct?.materials || "",
    stock_quantity: editingProduct?.stock_quantity?.toString() || "",
    is_featured: editingProduct?.is_featured || false,
    is_active: editingProduct?.is_active !== false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      title: formData.title,
      description: formData.description || "",
      category_id: formData.category_id
        ? parseInt(formData.category_id)
        : undefined,
      price: formData.price ? parseFloat(formData.price) : undefined,
      meta_description: formData.meta_description || "",
      materials: formData.materials || "",
      stock_quantity: formData.stock_quantity
        ? parseInt(formData.stock_quantity)
        : undefined,
      is_featured: formData.is_featured,
      is_active: formData.is_active,
    };

    onSubmit(productData);
  };

  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên sản phẩm *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormData("title", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Danh mục
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => updateFormData("category_id", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn danh mục...</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giá (VNĐ)
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => updateFormData("price", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập giá sản phẩm"
          />
        </div>

        {/* Stock Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số lượng tồn kho
          </label>
          <input
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => updateFormData("stock_quantity", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        {/* Materials */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chất liệu
          </label>
          <input
            type="text"
            value={formData.materials}
            onChange={(e) => updateFormData("materials", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Đồng, Nhôm..."
          />
        </div>

        {/* Featured */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_featured"
            checked={formData.is_featured}
            onChange={(e) => updateFormData("is_featured", e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="is_featured"
            className="ml-2 block text-sm text-gray-900"
          >
            Sản phẩm nổi bật
          </label>
        </div>

        {/* Active */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => updateFormData("is_active", e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="is_active"
            className="ml-2 block text-sm text-gray-900"
          >
            Kích hoạt sản phẩm
          </label>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả sản phẩm
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData("description", e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập mô tả chi tiết sản phẩm..."
          />
        </div>

        {/* Meta Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả SEO
          </label>
          <textarea
            value={formData.meta_description}
            onChange={(e) => updateFormData("meta_description", e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mô tả ngắn cho SEO..."
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          {editingProduct ? "Cập nhật" : "Thêm sản phẩm"}
        </button>
      </div>
    </form>
  );
}
