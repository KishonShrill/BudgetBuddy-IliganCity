import { Hono } from 'hono';
import { AppEnv } from '../types';
import { Category } from '../models';

const categories = new Hono<AppEnv>();

// GET /api/v1/categories - Fetch all categories
categories.get('/', async (c) => {
  try {
    const allCategories = await Category.find()
      .sort({
        category_list: -1,
        category_catalog: -1,
      })
      .lean()
      .exec();
    return c.json(allCategories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return c.json(
      { message: 'Failed to fetch categories.', error: error.message },
      500
    );
  }
});

export default categories;
