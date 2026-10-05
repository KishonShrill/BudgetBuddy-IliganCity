import { Hono } from 'hono';
import { Types } from 'mongoose';
import { ResultAsync, okAsync, errAsync } from 'neverthrow';
import { AppEnv } from '../types';
import { userVerify, requireRole } from '../helpers/auth';
import getPaginationParams from '../helpers/getPaginationParams';
import { Listing, PriceLog } from '../models';

const listings = new Hono<AppEnv>();

// GET /api/v1/listings - Fetch all listings with optional limit
listings.get('/', async (c) => {
    try {
        const limitStr = c.req.query('limit');
        const limit = limitStr ? parseInt(limitStr, 10) : 0;

        let query = Listing.find({}).sort({
            'product.product_id': -1,
            date_updated: -1,
        });

        if (limit > 0) {
            query = query.limit(limit);
        }

        const allListings = await query;
        return c.json(allListings);
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
});

// GET /api/v1/listings/:id - Fetch historical price logs for a listing
listings.get('/:id', async (c) => {
    const listingId = c.req.param('id');

    if (!Types.ObjectId.isValid(listingId)) {
        return c.json({ message: 'Invalid listing ID format' }, 400);
    }

    try {
        const history = await PriceLog.find({
            listing_id: new Types.ObjectId(listingId),
        }).sort({ date_recorded: 1 });

        return c.json({ data: history });
    } catch (error: any) {
        console.error('Error fetching price history:', error);
        return c.json(
            { message: 'Failed to fetch price history', error: error.message },
            500
        );
    }
});

// GET /api/v1/listings/category/:categoryId - Fetch paginated listings by category
listings.get('/category/:categoryId', async (c) => {
    const categoryId = c.req.param('categoryId');
    const { page, limit, skip } = getPaginationParams(c);

    try {
        const filter: any = {
            $or: [
                { category_id: categoryId },
                { 'category.name': categoryId },
                { 'category.list': categoryId },
            ],
        };

        const totalProducts = await Listing.countDocuments(filter);
        const productsList = await Listing.find(filter).skip(skip).limit(limit);
        const totalPages = Math.ceil(totalProducts / limit);

        return c.json({
            message: `Products for category ${categoryId} fetched successfully`,
            products: productsList,
            totalProducts,
            totalPages,
            currentPage: page,
        });
    } catch (error: any) {
        console.error(`Error fetching products for category ${categoryId}:`, error);
        return c.json(
            { message: 'Failed to fetch products by category.', error: error.message },
            500
        );
    }
});

// POST /api/v1/listings - Create single listing
listings.post('/', userVerify, requireRole('moderator'), async (c) => {
    const listingPayload = await c.req.json().catch(() => ({}));
    const productId = listingPayload?.product?.product_id;
    const locationId = listingPayload?.location?.id;

    if (typeof productId !== 'string' || typeof locationId !== 'string') {
        return c.json(
            {
                message:
                    'Invalid payload: product.product_id and location.id must be strings.',
            },
            400
        );
    }

    const existingListing = await Listing.findOne({
        'product.product_id': { $eq: productId },
        'location.id': { $eq: locationId },
    }).sort({ 'product.product_id': -1, 'location.id': -1 });

    if (existingListing) {
        return c.json(
            {
                message: `This product is already listed at ${listingPayload.location?.name || 'this location'}. Please edit the existing listing instead.`,
            },
            409
        );
    }

    return await ResultAsync.fromPromise(
        new Listing(listingPayload).save(),
        (error: any) => new Error(`Failed to save listing: ${error.message}`)
    ).match(
        (savedListing) =>
            c.json(
                {
                    message: 'Listing created successfully!',
                    listing: savedListing,
                },
                201
            ),
        (error: any) => {
            console.error('Error creating listing:', error);
            return c.json(
                {
                    message: 'Failed to create listing.',
                    error: error.message,
                },
                500
            );
        }
    );
});

// POST /api/v1/listings/bulk - Bulk create listings
listings.post('/bulk', userVerify, requireRole('moderator'), async (c) => {
    const listingsArray = await c.req.json().catch(() => null);

    if (!Array.isArray(listingsArray) || listingsArray.length === 0) {
        return c.json(
            { message: 'Payload must be a non-empty array of listings.' },
            400
        );
    }

    const hasInvalidItem = listingsArray.some(
        (item) =>
            !item ||
            typeof item?.product?.product_id !== 'string' ||
            typeof item?.location?.id !== 'string'
    );

    if (hasInvalidItem) {
        return c.json(
            {
                message:
                    'Invalid payload: each listing must include string product.product_id and location.id.',
            },
            400
        );
    }

    const incomingProductIds = listingsArray.map((item) => item.product.product_id);
    const targetLocationId = listingsArray[0].location.id;

    const allSameLocation = listingsArray.every(
        (item) => item.location.id === targetLocationId
    );
    if (!allSameLocation) {
        return c.json(
            {
                message:
                    'Invalid payload: all listings in a bulk request must target the same location.id.',
            },
            400
        );
    }

    const existingListings = await Listing.find({
        'location.id': { $eq: targetLocationId },
        'product.product_id': { $in: incomingProductIds },
    }).sort({ 'product.product_id': -1, 'location.id': -1 });

    if (existingListings.length > 0) {
        const duplicateNames = existingListings
            .map((l) => l.product?.product_name || l.product?.product_id)
            .join(', ');
        return c.json(
            {
                message: `Cannot process bulk upload. The following products are already listed at this location: ${duplicateNames}`,
            },
            409
        );
    }

    return await ResultAsync.fromPromise(
        Listing.insertMany(listingsArray),
        (error: any) => new Error(`Failed to save bulk listings: ${error.message}`)
    ).match(
        (savedListings) =>
            c.json(
                {
                    message: `Successfully created ${savedListings.length} listings!`,
                    count: savedListings.length,
                },
                201
            ),
        (error: any) => {
            console.error('Error creating bulk listings:', error);
            return c.json(
                {
                    message: 'Failed to create bulk listings.',
                    error: error.message,
                },
                500
            );
        }
    );
});

// PUT /api/v1/listings/:id - Update listing and log price changes
listings.put('/:id', userVerify, requireRole('moderator'), async (c) => {
    const id = c.req.param('id');

    if (!Types.ObjectId.isValid(id)) {
        return c.json({ message: 'Invalid listing ID format' }, 400);
    }

    const updatePayload = await c.req.json().catch(() => ({}));

    try {
        const existingListing = await Listing.findById(id);

        if (!existingListing) {
            return c.json({ message: 'Listing not found.' }, 404);
        }

        if (
            updatePayload.updated_price !== undefined &&
            existingListing.updated_price !== updatePayload.updated_price
        ) {
            await PriceLog.create({
                listing_id: existingListing._id,
                old_price: existingListing.updated_price,
                date_recorded: existingListing.date_updated || new Date(),
            });
        }

        return await ResultAsync.fromPromise(
            Listing.findByIdAndUpdate(id, updatePayload, {
                new: true,
                runValidators: true,
            }),
            (error: any) => new Error(`Database update error: ${error.message}`)
        ).match(
            (savedListing) =>
                c.json(
                    {
                        message: 'Listing updated successfully!',
                        listing: savedListing,
                    },
                    200
                ),
            (error: any) => {
                console.error('Error updating listing:', error);
                return c.json(
                    {
                        message: 'Failed to update listing.',
                        error: error.message,
                    },
                    500
                );
            }
        );
    } catch (error: any) {
        console.error('Server error during update process:', error);
        return c.json(
            {
                message: 'An unexpected error occurred.',
                error: error.message,
            },
            500
        );
    }
});

// DELETE /api/v1/listings/:id - Delete listing by MongoDB _id
listings.delete('/:id', userVerify, requireRole('admin'), async (c) => {
    const id = c.req.param('id');

    if (!Types.ObjectId.isValid(id)) {
        return c.json({ message: 'Invalid listing ID format' }, 400);
    }

    return await ResultAsync.fromPromise(
        Listing.findByIdAndDelete(id),
        (error: any) => new Error(`Database delete error: ${error.message}`)
    )
        .andThen((deletedListing) => {
            if (!deletedListing) return errAsync(new Error('Listing not found.'));
            return okAsync(deletedListing);
        })
        .match(
            (deletedListing) =>
                c.json(
                    {
                        message: 'Listing deleted successfully!',
                        listing: deletedListing,
                    },
                    200
                ),
            (error: any) => {
                console.error('Error deleting listing:', error);
                if (error.message === 'Listing not found.') {
                    return c.json({ message: error.message }, 404);
                }
                return c.json(
                    {
                        message: 'Failed to delete listing.',
                        error: error.message,
                    },
                    500
                );
            }
        );
});

export default listings;
