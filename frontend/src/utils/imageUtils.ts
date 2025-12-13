import { MenuItem } from '@/types';

// Generate unique placeholder image based on item properties
export const getPlaceholderImage = (item: MenuItem): string => {
  // Use different images based on category
  const categoryImages: Record<string, string> = {
    'Coffee': `https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&q=80&fit=crop`,
    'Non-Coffee': `https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=80&fit=crop`,
    'Bakery': `https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80&fit=crop`,
  };

  // Use category-specific image or generate based on item_id
  if (categoryImages[item.category]) {
    return categoryImages[item.category];
  }

  // Fallback: Use item_id to generate consistent but unique placeholder
  const seed = item.item_id % 10;
  const images = [
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&q=80&fit=crop', // Coffee
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=80&fit=crop', // Tea
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80&fit=crop', // Bakery
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80&fit=crop', // Food
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80&fit=crop', // Drink
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80&fit=crop', // Dessert
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80&fit=crop', // Coffee beans
    'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&q=80&fit=crop', // Latte art
    'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&q=80&fit=crop', // Cappuccino
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80&fit=crop', // Smoothie
  ];
  
  return images[seed] || images[0];
};

// Get image URL for menu item (with fallback)
export const getMenuItemImageUrl = (item: MenuItem): string => {
  return item.image_url || getPlaceholderImage(item);
};

