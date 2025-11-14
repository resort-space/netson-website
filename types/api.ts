import { NextApiRequest } from 'next';

export interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

export interface GoldPriceData {
  id: number;
  brand: string;
  buy_price: number;
  sell_price: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface ChartData {
  labels: string[];
  buyPrices: number[];
  sellPrices: number[];
  averagePrices: number[];
}

export interface ChartResponse {
  success: boolean;
  data: Record<string, ChartData>;
  period: string;
  startDate: string;
  endDate: string;
}

export interface AdminUpdateRequest {
  brand: string;
  buyPrice: number;
  sellPrice: number;
  date: string;
}

export interface ExcelUploadResponse {
  success: boolean;
  message: string;
  summary: {
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors: string[];
  };
}


