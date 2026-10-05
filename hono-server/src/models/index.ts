import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ---------------- User Model ----------------
export type UserRole =
  | 'admin'
  | 'moderator'
  | 'regular'
  | 'budget_starter'
  | 'wise_spender'
  | 'budget_guru';

export interface IUserStats {
  points: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface IUser extends Document {
  username?: string;
  email: string;
  password?: string;
  role: UserRole;
  profile_picture?: string;
  account_created: Date;
  daily_votes: number;
  daily_submissions: number;
  last_vote_date?: Date | null;
  last_submission_date?: Date | null;
  max_daily_votes: number;
  max_daily_submissions: number;
  stats: IUserStats;
}

const authenticationSchema = new Schema<IUser>({
  username: {
    type: String,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an Email!'],
    unique: true,
  },
  password: { type: String },
  role: {
    type: String,
    enum: [
      'admin',
      'moderator',
      'regular',
      'budget_starter',
      'wise_spender',
      'budget_guru',
    ],
    default: 'regular',
  },
  profile_picture: { type: String },
  account_created: { type: Date, default: Date.now },
  daily_votes: { type: Number, default: 0 },
  daily_submissions: { type: Number, default: 0 },
  last_vote_date: { type: Date, default: null },
  last_submission_date: { type: Date, default: null },
  max_daily_votes: { type: Number, default: 5 },
  max_daily_submissions: { type: Number, default: 1 },
  stats: {
    points: { type: Number, default: 0 },
    approved: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
  },
});

// ---------------- Product Model ----------------
export interface IProductCategory {
  list: string;
  name?: string;
  catalog?: string;
}

export interface IProduct extends Document {
  product_id: string;
  product_name: string;
  imageUrl?: string;
  category: IProductCategory;
}

const productSchema = new Schema<IProduct>({
  product_id: { type: String, unique: true, required: true },
  product_name: { type: String, required: true },
  imageUrl: { type: String },
  category: {
    list: { type: String, required: true },
    name: { type: String },
    catalog: { type: String },
  },
});

// ---------------- Location Model ----------------
export interface ILocationAddress {
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  region?: string;
}

export interface ILocationCoordinates {
  lat?: number;
  lng?: number;
}

export interface ILocationStoreHours {
  open?: string;
  close?: string;
}

export interface ILocation extends Document {
  location_name: string;
  address?: ILocationAddress;
  coordinates?: ILocationCoordinates;
  store_hours?: ILocationStoreHours;
  is_open_24hrs: 'active' | 'inactive';
  type?: string;
}

const locationSchema = new Schema<ILocation>({
  location_name: { type: String, required: true },
  address: {
    street: String,
    barangay: String,
    city: String,
    province: String,
    region: String,
  },
  coordinates: {
    lat: Number,
    lng: Number,
  },
  store_hours: {
    open: String,
    close: String,
  },
  is_open_24hrs: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  },
  type: String,
});

// ---------------- Listing Model ----------------
export interface IListingProduct {
  product_name?: string;
  product_id?: string;
  imageUrl?: string;
}

export interface IListingLocation {
  id?: Types.ObjectId;
  name?: string;
}

export interface IListingCategory {
  list?: string;
  name?: string;
  catalog?: string;
}

export interface IListing extends Document {
  product: IListingProduct;
  location: IListingLocation;
  category: IListingCategory;
  updated_price: number;
  date_updated: Date;
  shelf: string;
}

const listingSchema = new Schema<IListing>({
  product: {
    product_name: String,
    product_id: String,
    imageUrl: String,
  },
  location: {
    id: Schema.Types.ObjectId,
    name: String,
  },
  category: {
    list: String,
    name: String,
    catalog: String,
  },
  updated_price: { type: Number, required: true },
  date_updated: { type: Date, required: true },
  shelf: { type: String, required: true },
});

// ---------------- PendingListing Model ----------------
export interface IPendingListingVoter {
  userId: Types.ObjectId;
  voteType: 'up' | 'down';
}

export interface IPendingListingSubmitter {
  user_id: Types.ObjectId;
  user_name: string;
}

export interface IPendingListingCategory {
  _id: Types.ObjectId;
  list?: string;
  name?: string;
  catalog?: string;
}

export interface IPendingListingLocation {
  _id: Types.ObjectId;
  name?: string;
}

export interface IPendingListing extends Document {
  productName: string;
  price: number;
  location: IPendingListingLocation;
  category: IPendingListingCategory;
  listType?: string;
  submittedBy: IPendingListingSubmitter[];
  voters: IPendingListingVoter[];
  upvoteCount: number;
  downvoteCount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const pendingListingSchema = new Schema<IPendingListing>(
  {
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    location: {
      _id: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
      name: String,
    },
    category: {
      _id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
      list: String,
      name: String,
      catalog: String,
    },
    listType: { type: String, default: 'Groceries' },
    submittedBy: [
      {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: 'Authentication',
          required: true,
        },
        user_name: { type: String, required: true },
      },
    ],
    voters: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'Authentication' },
        voteType: { type: String, enum: ['up', 'down'] },
      },
    ],
    upvoteCount: { type: Number, default: 0 },
    downvoteCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// ---------------- Category Model ----------------
export interface ICategory extends Document {
  category_list: string;
  category_name: string;
  category_catalog: string;
}

const categorySchema = new Schema<ICategory>({
  category_list: { type: String, required: true },
  category_name: { type: String, required: true },
  category_catalog: { type: String, required: true },
});

// ---------------- PriceLog Model ----------------
export interface IPriceLog extends Document {
  listing_id: Types.ObjectId;
  old_price: number;
  date_recorded: Date;
}

const priceLogSchema = new Schema<IPriceLog>({
  listing_id: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
    index: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date_recorded: {
    type: Date,
    required: true,
  },
});

// Singleton caching pattern for Cloudflare Workers / Serverless
export const User: Model<IUser> =
  mongoose.models?.Authentication ||
  mongoose.model<IUser>('Authentication', authenticationSchema, 'users');

export const Product: Model<IProduct> =
  mongoose.models?.Product ||
  mongoose.model<IProduct>('Product', productSchema, 'products');

export const Location: Model<ILocation> =
  mongoose.models?.Location ||
  mongoose.model<ILocation>('Location', locationSchema, 'locations');

export const Listing: Model<IListing> =
  mongoose.models?.Listing ||
  mongoose.model<IListing>('Listing', listingSchema, 'listings');

export const PendingListing: Model<IPendingListing> =
  mongoose.models?.PendingListing ||
  mongoose.model<IPendingListing>(
    'PendingListing',
    pendingListingSchema,
    'pendingListings'
  );

export const Category: Model<ICategory> =
  mongoose.models?.Category ||
  mongoose.model<ICategory>('Category', categorySchema, 'category');

export const PriceLog: Model<IPriceLog> =
  mongoose.models?.PriceLog ||
  mongoose.model<IPriceLog>('PriceLog', priceLogSchema, 'priceLogs');
