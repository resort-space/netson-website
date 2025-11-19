"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Header from "../../../components/Header";
import Breadcrumb from "../../../components/Breadcrumb";
import { Product } from "../../../lib/database";
import ProductForm from "@/app/components/admin/ProductForm";
import ImageManager from "@/app/components/admin/ImageManager";

export default function ProductsAdminPage() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Image management state for editing
  const [currentImages, setCurrentImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
    loadData();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/check");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push("/admin/login");
      }
    } catch (error) {
      router.push("/admin/login");
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products/crud"),
        fetch("/api/categories"),
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        if (productsData.success) {
          setProducts(productsData.data || []);
        }
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        if (categoriesData.success) {
          setCategories(categoriesData.data || []);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for ProductForm component
  const handleProductSubmit = async (productData: any) => {
    try {
      const url = editingProduct
        ? `/api/products/crud?id=${editingProduct.id}`
        : "/api/products/crud";

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const productId = editingProduct?.id || data.data.id;

        // Handle image updates for editing products
        if (
          editingProduct &&
          (currentImages.length > 0 || newImages.length > 0)
        ) {
          await handleImageUpdates(productId);
        }

        // Handle new images for new products
        if (!editingProduct && newImages.length > 0) {
          await handleNewProductImages(productId);
        }

        showMessage(
          editingProduct
            ? "Cập nhật sản phẩm thành công!"
            : "Tạo sản phẩm thành công!",
          "success"
        );
        resetForm();
        loadData();
      } else {
        showMessage(data.message || "Có lỗi xảy ra", "error");
      }
    } catch (error) {
      console.error("Submit error:", error);
      showMessage("Lỗi kết nối server", "error");
    }
  };

  // Handle image updates for existing products
  const handleImageUpdates = async (productId: number) => {
    try {
      // Find new featured image
      const featuredImage = currentImages.find((img) => img.is_featured)?.url;

      // Upload new images
      if (newImages.length > 0) {
        for (const file of newImages) {
          const formData = new FormData();
          formData.append("image", file);
          formData.append("product_id", productId.toString());

          // Set as featured if no featured image is set and this is the first new image
          if (
            !featuredImage &&
            newImages.indexOf(file) === 0 &&
            currentImages.length === 0
          ) {
            formData.append("is_featured", "true");
          }

          const response = await fetch("/api/admin/upload-image", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            console.error("Failed to upload image:", file.name);
          }
        }
      }

      // Update featured image if changed
      if (featuredImage !== editingProduct?.featured_image) {
        // This would require additional API endpoint to update featured image
        // For now, we'll skip this complex update
      }
    } catch (error) {
      console.error("Error handling image updates:", error);
    }
  };

  // Handle images for new products
  const handleNewProductImages = async (productId: number) => {
    try {
      for (const file of newImages) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("product_id", productId.toString());

        // Set first image as featured
        if (newImages.indexOf(file) === 0) {
          formData.append("is_featured", "true");
        }

        const response = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          console.error("Failed to upload image:", file.name);
        }
      }
    } catch (error) {
      console.error("Error handling new product images:", error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);

    // Set current images for the product (the ProductForm component will handle form data)
    setCurrentImages(
      (product.images || []).map((url, index) => ({
        id: index,
        url: url,
        is_featured: url === product.featured_image,
        image_id: null, // We'll need to track this
      }))
    );

    setNewImages([]);
    setShowForm(true);
  };

  const handleDelete = async (productId: number) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
      const response = await fetch(`/api/products/crud?id=${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showMessage("Xóa sản phẩm thành công!", "success");
        loadData();
      } else {
        showMessage(data.message || "Có lỗi xảy ra", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showMessage("Lỗi kết nối server", "error");
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setShowForm(false);
    setCurrentImages([]); // Always empty for new products, populated for editing
    setNewImages([]);
  };

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Quản Lý Sản Phẩm" },
        ]}
      />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản Lý Sản Phẩm
              </h1>
              <p className="text-gray-600 mt-2">Thêm, sửa, xóa sản phẩm</p>
            </div>
            <div className="space-x-4">
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Thêm sản phẩm</span>
              </button>
              <Link
                href="/admin"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Quay lại Dashboard
              </Link>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                messageType === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center space-x-2">
                {messageType === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>{message}</span>
              </div>
            </div>
          )}

          {/* Product Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingProduct
                      ? "Chỉnh sửa sản phẩm"
                      : "Thêm sản phẩm mới"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>

                <div>
                  {/* Product Form Component */}
                  <ProductForm
                    editingProduct={editingProduct}
                    categories={categories}
                    onSubmit={handleProductSubmit}
                    onCancel={resetForm}
                  />

                  {/* Image Manager - Show for both create and edit */}
                  <ImageManager
                    currentImages={currentImages}
                    newImages={newImages}
                    onUpdateCurrentImages={setCurrentImages}
                    onUpdateNewImages={setNewImages}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Danh Sách Sản Phẩm ({products.length})
              </h3>
            </div>

            {isLoading ? (
              <div className="text-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Đang tải sản phẩm...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Chưa có sản phẩm nào</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Thêm sản phẩm đầu tiên
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Danh mục
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {product.featured_image ||
                            (product.images && product.images.length > 0) ? (
                              <img
                                src={
                                  product.featured_image || product.images[0]
                                }
                                alt={product.title}
                                className="w-10 h-10 rounded-md object-cover mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded-md mr-3 flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.title}
                              </div>
                              {product.is_featured && (
                                <span className="inline-block mt-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                                  Nổi bật
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category?.name || "Chưa phân loại"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.price
                            ? `${product.price.toLocaleString("vi-VN")}₫`
                            : "Liên hệ"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                              product.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.is_active ? "Hoạt động" : "Tạm ẩn"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
