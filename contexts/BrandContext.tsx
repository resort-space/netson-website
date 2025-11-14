'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Brand {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BrandContextType {
  brands: Brand[];
  loading: boolean;
  updateBrands: (newBrands: Brand[]) => void;
  addBrand: (brandName: string) => Promise<{ success: boolean; data?: Brand; error?: string }>;
  updateBrand: (id: number, newName: string) => void;
  deleteBrand: (id: number) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Load brands từ database khi component mount
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/brands');
        if (response.ok) {
          const result = await response.json();
          console.log('🔍 API brands response:', result);
          if (result.success) {
            console.log('🏷️ Brands loaded from API:', result.data);
            setBrands(result.data);
          } else {
            console.log('⚠️ API failed, using fallback brands');
            // Fallback to default brands if API fails
            setBrands([
              { id: 1, name: 'SJC', description: 'SJC Gold', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
              { id: 2, name: 'PNJ', description: 'Phú Nhuận Jewelry', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
              { id: 3, name: 'DOJI', description: 'DOJI Gold', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
              { id: 4, name: 'Phú Quý', description: 'Phú Quý Gold', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
              { id: 5, name: 'Bảo Tín Minh Châu', description: 'Bảo Tín Minh Châu Gold', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
            ]);
          }
        } else {
          console.log('⚠️ API response not ok, using fallback brands');
          // Fallback to default brands if API fails
          setBrands([
            { id: 1, name: 'SJC', description: 'SJC Gold', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 2, name: 'PNJ', description: 'Phú Nhuận Jewelry', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 3, name: 'DOJI', description: 'DOJI Gold', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 4, name: 'Phú Quý', description: 'Phú Quý Gold', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 5, name: 'Bảo Tín Minh Châu', description: 'Bảo Tín Minh Châu Gold', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
          ]);
        }
      } catch (error) {
        console.error('Error loading brands:', error);
        // Fallback to default brands if API fails
        setBrands([
          { id: 1, name: 'SJC', description: 'SJC Gold', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 2, name: 'PNJ', description: 'Phú Nhuận Jewelry', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 3, name: 'DOJI', description: 'DOJI Gold', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 4, name: 'Phú Quý', description: 'Phú Quý Gold', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 5, name: 'Bảo Tín Minh Châu', description: 'Bảo Tín Minh Châu Gold', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  const updateBrands = (newBrands: Brand[]) => {
    setBrands(newBrands);
  };

  const addBrand = async (brandName: string) => {
    try {
      const response = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: brandName, description: '', isActive: true })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setBrands(prev => [...prev, result.data]);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error adding brand:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const updateBrand = async (id: number, newName: string) => {
    try {
      // Update local state
      setBrands(prev => prev.map(brand => 
        brand.id === id ? { ...brand, name: newName } : brand
      ));
    } catch (error) {
      console.error('Error updating brand:', error);
    }
  };

  const deleteBrand = async (id: number) => {
    try {
      // Remove from local state
      setBrands(prev => prev.filter(brand => brand.id !== id));
    } catch (error) {
      console.error('Error deleting brand:', error);
    }
  };

  return (
    <BrandContext.Provider value={{ brands, loading, updateBrands, addBrand, updateBrand, deleteBrand }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrands() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrands must be used within a BrandProvider');
  }
  return context;
}
