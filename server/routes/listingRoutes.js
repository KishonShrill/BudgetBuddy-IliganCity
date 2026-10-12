// routes/productRoutes.js
import { user_verify, requireRole } from '../helpers/auth.js';
import { ResultAsync, okAsync, errAsync } from 'neverthrow';
import express from 'express';
import mongoose from 'mongoose';
import getPaginationParams from '../helpers/getPaginationParams.js';

import { Listing, PriceLog } from '../models/models.js'; // adjust path

const router = express.Router();


router.get('/', async (req, res) => {
    // #swagger.tags = ['v1 | Listing']
    // #swagger.description = 'Fetch all listing products.'
    try {
        const limitStr = req.query.limit;
        const limit = limitStr ? parseInt(limitStr, 10) : 0;

        let query = Listing.find(
            {}
        ).sort({ "prouct.product_id": -1, date_updated: -1 });

        if (limit > 0) {
            query = query.limit(limit);
        }

        const products = await query;

        res.json(products);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

// Endpoint: Get all listings for a specific product across all stores
router.get('/product/:productId', async (req, res) => {
    // #swagger.tags = ['v1 | Listing']
    // #swagger.description = 'Fetch all store listings for a given product.'
    const rawProductId = req.params.productId;

    if (!rawProductId) {
        return res.status(400).json({ message: 'productId parameter is required' });
    }

    try {
        let targetProductId = rawProductId;

        // If rawProductId is a valid ObjectId, it might be a listing _id
        if (mongoose.Types.ObjectId.isValid(rawProductId)) {
            const sampleListing = await Listing.findById(rawProductId);
            if (sampleListing && sampleListing.product?.product_id) {
                targetProductId = sampleListing.product.product_id;
            }
        }

        const filter = {
            $or: [
                { "product.product_id": targetProductId },
                { "product.product_name": { $regex: new RegExp(decodeURIComponent(targetProductId).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } }
            ]
        };

        // Sort by price ascending so the first is the cheapest
        const listings = await Listing.find(filter).sort({ updated_price: 1 });
        return res.json(listings);
    } catch (error) {
        console.error('Error fetching product listings:', error);
        return res.status(500).json({ message: 'Failed to fetch product listings', error: error.message });
    }
});

router.get('/category/:categoryId', async (req, res) => {
    const categoryId = req.params.categoryId;
    const { page, limit, skip } = getPaginationParams(req);

    try {
        // Build the filter by category_id
        const filter = { category_id: categoryId };

        // Get total count of products in this category
        const totalProducts = await Listing.countDocuments(filter);
        // Get the paginated products in this category
        const products = await Listing.find(filter)
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalProducts / limit);

        res.json({
            message: `Products for category ${categoryId} fetched successfully`,
            products,
            totalProducts,
            totalPages,
            currentPage: page
        });

    } catch (error) {
        console.error(`Error fetching products for category ${categoryId}:`, error);
        res.status(500).json({ message: 'Failed to fetch products by category.', error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    // #swagger.tags = ['v1 | PriceLog']
    // #swagger.description = 'Fetch historical price logs for a specific listing'

    const listingId = req.params.id;

    // Validate if the ID is a valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
        return res.status(400).json({ message: 'Invalid listing ID format' });
    }

    try {
        // Use .find() instead of .findById() because we want an array of logs
        // that share this listing_id. We also sort by date_recorded ascending (1).
        const history = await PriceLog.find({ listing_id: listingId })
            .sort({ date_recorded: 1 });

        // We return it wrapped in an object with a 'data' property to match
        // what your frontend axios.get call is expecting (response.data.data)
        res.status(200).json({ data: history });

    } catch (error) {
        console.error('Error fetching price history:', error);
        res.status(500).json({ message: 'Failed to fetch price history', error: error.message });
    }
});

router.post('/', user_verify, requireRole("moderator"), async (req, res) => {
    // #swagger.tags = ['v1 | Listing']
    // #swagger.description = 'Create a new product listing.'

    const listingPayload = req.body;
    const productId = listingPayload?.product?.product_id;
    const locationId = listingPayload?.location?.id;

    if (typeof productId !== 'string' || typeof locationId !== 'string') {
        return res.status(400).json({
            message: 'Invalid payload: product.product_id and location.id must be strings.'
        });
    }

    const existingListing = await Listing.findOne({
        "product.product_id": { $eq: productId },
        "location.id": { $eq: locationId }
    }).sort({ "product.product_id": -1, "location.id": -1 });

    if (existingListing) {
        return res.status(409).json({
            message: `This product is already listed at ${listingPayload.location.name}. Please edit the existing listing instead.`
        });
    }

    await ResultAsync.fromPromise(
        new Listing(listingPayload).save(),
        (error) => new Error(`Failed to save listing: ${error.message}`)
    )
        .match(
            (savedListing) => {
                return res.status(201).json({
                    message: 'Listing created successfully!',
                    listing: savedListing,
                });
            },
            (error) => {
                console.error('Error creating listing:', error);
                return res.status(500).json({
                    message: 'Failed to create listing.',
                    error: error.message
                });
            }
        );
});

router.post('/bulk', user_verify, requireRole("moderator"), async (req, res) => {
    // #swagger.tags = ['v1 | Listing']
    // #swagger.description = 'Bulk create new product listings.'

    const listingsArray = req.body;

    // 1. Validate that we actually received an array
    if (!Array.isArray(listingsArray) || listingsArray.length === 0) {
        return res.status(400).json({ message: 'Payload must be a non-empty array of listings.' });
    }

    // 2. Validate payload shape and literal types to prevent query-object injection
    const hasInvalidItem = listingsArray.some(
        (item) =>
            !item ||
            typeof item?.product?.product_id !== 'string' ||
            typeof item?.location?.id !== 'string'
    );

    if (hasInvalidItem) {
        return res.status(400).json({
            message: 'Invalid payload: each listing must include string product.product_id and location.id.'
        });
    }

    const incomingProductIds = listingsArray.map(item => item.product.product_id);
    const targetLocationId = listingsArray[0].location.id;

    const allSameLocation = listingsArray.every(item => item.location.id === targetLocationId);
    if (!allSameLocation) {
        return res.status(400).json({
            message: 'Invalid payload: all listings in a bulk request must target the same location.id.'
        });
    }

    // 3. Find if any of these products ALREADY exist at this location
    const existingListings = await Listing.find({
        "location.id": { $eq: targetLocationId },
        "product.product_id": { $in: incomingProductIds }
    }).sort({ "product.product_id": -1, "location.id": -1 });

    if (existingListings.length > 0) {
        const duplicateNames = existingListings.map(l => l.product.product_name).join(', ');
        return res.status(409).json({
            message: `Cannot process bulk upload. The following products are already listed at this location: ${duplicateNames}`
        });
    }

    // 4. Use Mongoose's insertMany for bulk operations
    await ResultAsync.fromPromise(
        Listing.insertMany(listingsArray),
        (error) => new Error(`Failed to save bulk listings: ${error.message}`)
    )
        .match(
            (savedListings) => {
                return res.status(201).json({
                    message: `Successfully created ${savedListings.length} listings!`,
                    count: savedListings.length
                });
            },
            (error) => {
                console.error('Error creating bulk listings:', error);
                return res.status(500).json({
                    message: 'Failed to create bulk listings.',
                    error: error.message
                });
            }
        );
});

router.put('/:id', user_verify, requireRole("moderator"), async (req, res) => {
    // #swagger.tags = ['v1 | Listing']
    // #swagger.description = 'Update a listing by MongoDB _id and log price changes'

    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid listing ID format' });
    }

    const updatePayload = req.body;

    try {
        // 1. Fetch the EXISTING listing BEFORE updating
        const existingListing = await Listing.findById(id);

        if (!existingListing) {
            return res.status(404).json({ message: "Listing not found." });
        }

        // 2. Compare prices. We only want to log it if the price ACTUALLY changed.
        // (This prevents logging if the admin just fixed a typo in the category)
        if (updatePayload.updated_price && existingListing.updated_price !== updatePayload.updated_price) {

            // 3. Save the OLD price and OLD date to the PriceLog
            await PriceLog.create({
                listing_id: existingListing._id,
                old_price: existingListing.updated_price,
                // Fallback to current date if the old listing somehow lacked a date
                date_recorded: existingListing.date_updated || new Date()
            });
        }

        // 4. Now perform your original update logic using ResultAsync
        await ResultAsync.fromPromise(
            Listing.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true }),
            (error) => new Error(`Database update error: ${error.message}`)
        )
            .match(
                (savedListing) => {
                    return res.status(200).json({
                        message: 'Listing updated successfully!',
                        listing: savedListing,
                    });
                },
                (error) => {
                    console.error('Error updating listing:', error);
                    return res.status(500).json({
                        message: 'Failed to update listing.',
                        error: error.message
                    });
                }
            );

    } catch (error) {
        console.error('Server error during update process:', error);
        return res.status(500).json({
            message: 'An unexpected error occurred.',
            error: error.message
        });
    }
});

router.delete('/:id', user_verify, requireRole("admin"), async (req, res) => {
    // #swagger.tags = ['v1 | Listing']
    // #swagger.description = 'Delete a listing by MongoDB _id'

    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid listing ID format' });
    }

    await ResultAsync.fromPromise(
        Listing.findByIdAndDelete(id),
        (error) => new Error(`Database delete error: ${error.message}`)
    )
        .andThen((deletedListing) => {
            // Explicitly handle the case where the ID is valid but the document doesn't exist
            if (!deletedListing) return errAsync(new Error("Listing not found."));
            return okAsync(deletedListing);
        })
        .match(
            (deletedListing) => {
                // SUCCESS ARM
                return res.status(200).json({
                    message: 'Listing deleted successfully!',
                    listing: deletedListing
                });
            },
            (error) => {
                // ERROR ARM
                console.error('Error deleting listing:', error);

                if (error.message === "Listing not found.") {
                    return res.status(404).json({ message: error.message });
                }

                return res.status(500).json({
                    message: 'Failed to delete listing.',
                    error: error.message
                });
            }
        );
});

export default router;
