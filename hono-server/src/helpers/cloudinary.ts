import { Bindings } from '../types';

export async function generateCloudinarySignature(
  params: Record<string, string | number>,
  apiSecret: string
): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const serialized =
    sortedKeys.map((key) => `${key}=${params[key]}`).join('&') + apiSecret;
  const encoder = new TextEncoder();
  const data = encoder.encode(serialized);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

export async function uploadToCloudinary(
  file: File | Blob,
  publicId: string,
  env: Bindings
): Promise<CloudinaryUploadResult> {
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary environment credentials are not properly configured.');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'iligancitystores_products';
  const overwrite = 'true';

  const signature = await generateCloudinarySignature(
    {
      folder,
      overwrite,
      public_id: publicId,
      timestamp,
    },
    apiSecret
  );

  const formData = new FormData();
  formData.append('file', file);
  formData.append('public_id', publicId);
  formData.append('folder', folder);
  formData.append('overwrite', overwrite);
  formData.append('timestamp', timestamp.toString());
  formData.append('api_key', apiKey);
  formData.append('signature', signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Cloudinary upload error:', errorText);
    throw new Error(`Cloudinary upload failed: ${response.statusText}`);
  }

  const result = (await response.json()) as CloudinaryUploadResult;
  return result;
}

export async function destroyFromCloudinary(
  publicId: string,
  env: Bindings
): Promise<{ result: string }> {
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials missing.');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  // If publicId does not include the folder, prepend it
  const fullPublicId = publicId.startsWith('iligancitystores_products/')
    ? publicId
    : `iligancitystores_products/${publicId}`;

  const signature = await generateCloudinarySignature(
    {
      public_id: fullPublicId,
      timestamp,
    },
    apiSecret
  );

  const formData = new FormData();
  formData.append('public_id', fullPublicId);
  formData.append('timestamp', timestamp.toString());
  formData.append('api_key', apiKey);
  formData.append('signature', signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Cloudinary destroy error:', errorText);
    throw new Error(`Cloudinary destroy failed: ${response.statusText}`);
  }

  const result = (await response.json()) as { result: string };
  return result;
}
