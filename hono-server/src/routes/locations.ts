import { Hono } from 'hono';
import { Types } from 'mongoose';
import { AppEnv } from '../types';
import { Listing, Location } from '../models';

const locations = new Hono<AppEnv>();

// GET /api/v1/locations - Fetch all locations
locations.get('/', async (c) => {
  try {
    const allLocations = await Location.find().sort({ location_name: -1 }).lean().exec();
    return c.json(allLocations);
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    return c.json(
      { message: 'Failed to fetch locations.', error: error.message },
      500
    );
  }
});

// GET /api/v1/locations/:locationId - Fetch products for a specific location
locations.get('/:locationId', async (c) => {
  const locationId = c.req.param('locationId');

  if (!Types.ObjectId.isValid(locationId)) {
    return c.json({ message: 'Invalid location ID format' }, 400);
  }

  try {
    const locationObjectId = new Types.ObjectId(locationId);
    const locationDoc = await Location.findOne(
      { _id: locationObjectId },
      { location_name: 1, _id: 0 }
    ).lean();

    if (!locationDoc) {
      return c.json({ message: 'Location not found' }, 404);
    }

    const products = await Listing.aggregate([
      {
        $match: {
          'location.id': locationObjectId,
        },
      },
      { $sort: { 'product.product_id': -1 } },
      {
        $project: {
          'product.product_id': true,
          'product.product_name': true,
          updated_price: true,
          date_updated: true,
          'product.imageUrl': true,
          'location.name': true,
          'category.list': true,
          'category.name': true,
          'category.catalog': true,
        },
      },
    ]);

    return c.json({
      products,
      location_name: locationDoc.location_name,
    });
  } catch (error: any) {
    console.error(`Error fetching products for location ${locationId}:`, error);
    return c.json(
      {
        message: 'Failed to fetch products by location.',
        error: error.message,
      },
      500
    );
  }
});

export default locations;
