import { Product } from '../models';

// Helper function to generate product_id (Year-Sequential Number, e.g., 2026-0001)
export async function generateProductId(): Promise<string> {
  const currentYear = new Date().getFullYear().toString();
  // Find the latest product from the current year
  const lastProduct = await Product.findOne({
    product_id: new RegExp(`^${currentYear}-\\d{4}$`),
  }).sort({ product_id: -1 });

  let nextItemNumber = 1;
  if (lastProduct && lastProduct.product_id) {
    const lastProductId = lastProduct.product_id;
    const lastItemNumber = parseInt(lastProductId.split('-')[1], 10);
    if (!isNaN(lastItemNumber)) {
      nextItemNumber = lastItemNumber + 1;
    }
  }

  // Format the item number with leading zeros (e.g., 0001, 0010, 0100)
  const formattedItemNumber = nextItemNumber.toString().padStart(4, '0');
  return `${currentYear}-${formattedItemNumber}`;
}

export default generateProductId;
