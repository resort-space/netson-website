import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import db from '../../../../lib/database';
import { ApiResponse, CloudinaryUploadResponse, Image } from '../../../../types/api';

// Configure Cloudinary - use CLOUDINARY_URL if available, otherwise individual params
const cloudinaryConfig = process.env.CLOUDINARY_URL
  ? { url: process.env.CLOUDINARY_URL }
  : {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    };

cloudinary.config(cloudinaryConfig);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'Không tìm thấy file ảnh'
      }, { status: 400 });
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        message: 'Only image files are allowed!'
      }, { status: 400 });
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        message: 'File size exceeds 5MB limit'
      }, { status: 400 });
    }

    const product_id = formData.get('product_id') as string;
    const alt_text = (formData.get('alt_text') as string) || '';
    const title = (formData.get('title') as string) || '';
    const is_featured = formData.get('is_featured') === 'true';

    // Validate product_id if provided
    let validatedProductId = null;
    if (product_id && product_id.trim()) {
      const parsedProductId = parseInt(product_id.trim());
      if (!isNaN(parsedProductId)) {
        // Check if product exists
        const productCheck = await db.query('SELECT id FROM products WHERE id = $1', [parsedProductId]);
        if (productCheck.rows.length > 0) {
          validatedProductId = parsedProductId;
        } else {
          console.warn(`Product with ID ${parsedProductId} does not exist, setting product_id to null`);
        }
      }
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'netson-products',
          public_id: `product_${Date.now()}_${Math.random().toString(36).substring(2)}`,
          format: 'jpg', // Convert to jpg
          quality: 'auto', // Auto quality optimization
          width: 1200, // Max width
          height: 1200, // Max height
          crop: 'limit' // Don't crop, just limit dimensions
        },
        (error: any, result: any) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              public_id: result.public_id,
              url: result.url,
              secure_url: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes
            });
          } else {
            reject(new Error('Upload failed'));
          }
        }
      );

      uploadStream.end(buffer);
    });

    // Save image metadata to database
    const imageResult = await db.query(`
      INSERT INTO images (
        public_id, url, secure_url, width, height, format, bytes,
        folder, alt_text, title, product_id, is_featured, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
      )
      RETURNING id, public_id, url, secure_url, width, height, format, bytes,
                folder, alt_text, title, product_id, is_featured, created_at, updated_at
    `, [
      uploadResult.public_id,
      uploadResult.url,
      uploadResult.secure_url,
      uploadResult.width,
      uploadResult.height,
      uploadResult.format,
      uploadResult.bytes,
      'netson-products',
      alt_text,
      title,
      validatedProductId,
      is_featured
    ]);

    const savedImage: Image = {
      id: imageResult.rows[0].id,
      public_id: imageResult.rows[0].public_id,
      url: imageResult.rows[0].url,
      secure_url: imageResult.rows[0].secure_url,
      width: imageResult.rows[0].width,
      height: imageResult.rows[0].height,
      format: imageResult.rows[0].format,
      bytes: imageResult.rows[0].bytes,
      folder: imageResult.rows[0].folder,
      alt_text: imageResult.rows[0].alt_text,
      title: imageResult.rows[0].title,
      product_id: imageResult.rows[0].product_id,
      is_featured: imageResult.rows[0].is_featured,
      sort_order: imageResult.rows[0].sort_order || 0,
      created_at: imageResult.rows[0].created_at.toISOString(),
      updated_at: imageResult.rows[0].updated_at.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: uploadResult,
      message: 'Upload ảnh thành công'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Lỗi upload ảnh'
    }, { status: 500 });
  }
}
