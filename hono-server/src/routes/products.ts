import { Hono } from 'hono';
import { Types } from 'mongoose';
import { ResultAsync, okAsync, errAsync } from 'neverthrow';
import { AppEnv } from '../types';
import { userVerify, requireRole } from '../helpers/auth';
import generateProductId from '../helpers/generateProductId';
import {
  uploadToCloudinary,
  destroyFromCloudinary,
} from '../helpers/cloudinary';
import { Product, Listing } from '../models';

const products = new Hono<AppEnv>();

// GET /api/v1/products - Fetch all products
products.get('/', userVerify, async (c) => {
  try {
    const allProducts = await Product.find(
      {},
      {
        'location.id': 0,
      }
    ).sort({ product_id: -1 });

    return c.json(allProducts);
  } catch (error: any) {
    return c.json({ message: error.message }, 500);
  }
});

// GET /api/v1/products/:id - Fetch single product by MongoDB _id
products.get('/:id', async (c) => {
  const id = c.req.param('id');

  if (!Types.ObjectId.isValid(id)) {
    return c.json({ message: 'Invalid product ID format' }, 400);
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return c.json({ message: 'Product not found' }, 404);
    }
    return c.json(product);
  } catch (error: any) {
    console.error('Error fetching product by ID:', error);
    return c.json({ message: error.message }, 500);
  }
});

// POST /api/v1/products - Create new product or bulk import
products.post('/', userVerify, requireRole('moderator'), async (c) => {
  // 1. Bulk import mode
  if (c.req.query('bulk') === 'true') {
    const productsArray = await c.req.json().catch(() => null);

    if (!Array.isArray(productsArray)) {
      return c.json(
        { message: 'Bulk import payload must be an array.' },
        400
      );
    }

    return await ResultAsync.fromPromise(
      (async () => {
        const startingIdString = await generateProductId();
        const [prefix, sequenceStr] = startingIdString.split('-');
        const startingSequence = parseInt(sequenceStr, 10);
        const paddingLength = sequenceStr.length;

        const productsToInsert = productsArray.map((item: any, index: number) => {
          const currentSeq = startingSequence + index;
          const newId = `${prefix}-${String(currentSeq).padStart(
            paddingLength,
            '0'
          )}`;

          return {
            product_id: newId,
            product_name: item.product_name,
            imageUrl: item.imageUrl || null,
            category: item.category,
          };
        });

        return await Product.insertMany(productsToInsert);
      })(),
      (error: any) => new Error(`Bulk database insert failed: ${error.message}`)
    ).match(
      (savedProducts) =>
        c.json(
          {
            message: `Successfully bulk imported ${savedProducts.length} products!`,
            products: savedProducts,
          },
          201
        ),
      (error: any) => {
        console.error('Error processing bulk import:', error);
        return c.json(
          {
            message: 'Failed to process bulk import.',
            error: error.message,
          },
          500
        );
      }
    );
  }

  // 2. Single product upload mode
  let body: any;
  const contentType = c.req.header('content-type') || '';
  if (
    contentType.includes('multipart/form-data') ||
    contentType.includes('application/x-www-form-urlencoded')
  ) {
    body = await c.req.parseBody();
  } else {
    body = await c.req.json().catch(() => ({}));
  }

  const productName = body['product_name'] as string;
  const rawCategory = body['category'];
  let category: any = null;
  if (typeof rawCategory === 'string') {
    try {
      category = JSON.parse(rawCategory);
    } catch {
      category = null;
    }
  } else if (rawCategory && typeof rawCategory === 'object') {
    category = rawCategory;
  }

  const imageFile = body['imageUrl'] || body['productImage'];

  const handleUpload = (file: any, idToUse: string) => {
    if (!file || !(file instanceof Blob || file instanceof File)) {
      return okAsync(null);
    }

    return ResultAsync.fromPromise(
      uploadToCloudinary(file, idToUse, c.env),
      (error: any) => new Error(`Cloudinary upload failed: ${error.message}`)
    );
  };

  return await ResultAsync.fromPromise(
    generateProductId(),
    (error: any) => new Error(`Failed to generate product ID: ${error.message}`)
  )
    .andThen((newProductId) => {
      return handleUpload(imageFile, newProductId).map((uploadResult) => {
        return new Product({
          product_id: newProductId,
          product_name: productName,
          imageUrl: uploadResult ? uploadResult.secure_url : null,
          category: category,
        });
      });
    })
    .andThen((newProduct) => {
      return ResultAsync.fromPromise(
        newProduct.save(),
        (error: any) => new Error(`Failed to save product: ${error.message}`)
      );
    })
    .match(
      (savedProduct) =>
        c.json(
          {
            message: 'Product added successfully!',
            product: savedProduct,
          },
          201
        ),
      (error: any) => {
        console.error('Error processing product:', error);
        return c.json(
          {
            message: 'Failed to process product.',
            error: error.message,
          },
          500
        );
      }
    );
});

// PUT /api/v1/products/:id - Update product by MongoDB _id
products.put('/:id', userVerify, requireRole('moderator'), async (c) => {
  const id = c.req.param('id');

  if (!Types.ObjectId.isValid(id)) {
    return c.json({ message: 'Invalid product ID format' }, 400);
  }

  let body: any;
  const contentType = c.req.header('content-type') || '';
  if (
    contentType.includes('multipart/form-data') ||
    contentType.includes('application/x-www-form-urlencoded')
  ) {
    body = await c.req.parseBody();
  } else {
    body = await c.req.json().catch(() => ({}));
  }

  const productId = body['product_id'] as string;
  const productName = body['product_name'] as string;
  const rawCategory = body['category'];
  let category: any = null;
  if (typeof rawCategory === 'string') {
    try {
      category = JSON.parse(rawCategory);
    } catch {
      category = null;
    }
  } else if (rawCategory && typeof rawCategory === 'object') {
    category = rawCategory;
  }

  const imageFile = body['productImage'] || body['imageUrl'];

  const handleUpload = (file: any, idToUse: string) => {
    if (!file || !(file instanceof Blob || file instanceof File)) {
      return okAsync(null);
    }
    return ResultAsync.fromPromise(
      uploadToCloudinary(file, idToUse, c.env),
      (error: any) => new Error(`Cloudinary upload failed: ${error.message}`)
    );
  };

  return await ResultAsync.fromPromise(
    Product.findById(id),
    (error: any) => new Error(`Database find error: ${error.message}`)
  )
    .andThen((product) => {
      if (!product) return errAsync(new Error('Product not found.'));

      const oldProductId = product.product_id;

      return handleUpload(imageFile, product.product_id).map((uploadResult) => {
        if (uploadResult) {
          product.imageUrl = uploadResult.secure_url;
        }

        if (productId) product.product_id = productId;
        if (productName) product.product_name = productName;
        if (category) product.category = category;

        return { product, oldProductId };
      });
    })
    .andThen(({ product, oldProductId }) => {
      return ResultAsync.fromPromise(
        product.save(),
        (error: any) => new Error(`Failed to save updated product: ${error.message}`)
      ).map((savedProduct) => ({ savedProduct, oldProductId }));
    })
    .andThen(({ savedProduct, oldProductId }) => {
      const listingUpdatePayload: any = {
        $set: {
          'product.product_id': savedProduct.product_id,
          'product.product_name': savedProduct.product_name,
          'product.imageUrl': savedProduct.imageUrl || null,
          date_updated: new Date(),
        },
      };

      if (savedProduct.category) {
        listingUpdatePayload.$set['category.list'] =
          savedProduct.category.list || null;
        listingUpdatePayload.$set['category.name'] =
          savedProduct.category.name || null;
        listingUpdatePayload.$set['category.catalog'] =
          savedProduct.category.catalog || null;
      }

      return ResultAsync.fromPromise(
        Listing.updateMany(
          { 'product.product_id': oldProductId },
          listingUpdatePayload
        ).exec(),
        (error: any) => new Error(`Failed to sync related listings: ${error.message}`)
      ).map(() => savedProduct);
    })
    .match(
      (savedProduct) =>
        c.json(
          {
            message: 'Product and related listings updated successfully!',
            product: savedProduct,
          },
          200
        ),
      (error: any) => {
        console.error('Error updating product:', error);
        if (error.message === 'Product not found.') {
          return c.json({ message: error.message }, 404);
        }
        return c.json(
          {
            message: 'Failed to complete the update process.',
            error: error.message,
          },
          500
        );
      }
    );
});

// DELETE /api/v1/products/:id - Delete product by MongoDB _id
products.delete('/:id', userVerify, requireRole('admin'), async (c) => {
  const id = c.req.param('id');

  if (!Types.ObjectId.isValid(id)) {
    return c.json({ message: 'Invalid product ID format' }, 400);
  }

  return await ResultAsync.fromPromise(
    Product.findById(id),
    (error: any) => new Error(`Database find error: ${error.message}`)
  )
    .andThen((product) => {
      if (!product) return errAsync(new Error('Product not found.'));

      if (product.imageUrl) {
        const exactPublicId = `iligancitystores_products/${product.product_id}`;
        destroyFromCloudinary(exactPublicId, c.env).catch((err) => {
          console.error('Non-fatal error cleaning up Cloudinary:', err);
        });
      }

      return ResultAsync.fromPromise(
        Product.findByIdAndDelete(id),
        (error: any) => new Error(`Database delete error: ${error.message}`)
      );
    })
    .match(
      (deletedProduct) =>
        c.json(
          {
            message: 'Product deleted successfully!',
            product: deletedProduct,
          },
          200
        ),
      (error: any) => {
        console.error('Error deleting product:', error);
        if (error.message === 'Product not found.') {
          return c.json({ message: error.message }, 404);
        }
        return c.json(
          {
            message: 'Failed to delete product.',
            error: error.message,
          },
          500
        );
      }
    );
});

export default products;
