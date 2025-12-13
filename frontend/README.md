# Coffee Shop Management - Frontend

Modern, performant Next.js frontend for the Coffee Shop Management System.

## 🚀 Features

- **Type-Safe**: Full TypeScript support with strict type checking (no `any` types)
- **Performance Optimized**: 
  - Code splitting with dynamic imports
  - React.memo for component memoization
  - useMemo and useCallback for expensive computations
  - SWR for efficient data fetching and caching
- **Modern Architecture**:
  - Component-based structure
  - Custom hooks for reusable logic
  - Context API for global state
  - Repository pattern for API calls
- **Real-time Updates**: Auto-refresh for orders and menu items
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main app entry point
│   ├── providers.tsx      # SWR and Context providers
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── layout/            # Layout components (Sidebar, NavButton)
│   ├── menu/              # Menu-related components (ProductCard)
│   ├── cart/              # Cart components (CartItem)
│   ├── orders/            # Order components (OrderCard)
│   └── views/             # Page views (POSView, BaristaView)
├── contexts/              # React Context providers
│   └── CartContext.tsx    # Shopping cart state management
├── lib/                   # Library code
│   ├── api/               # API client and endpoints
│   │   ├── client.ts      # Axios instance configuration
│   │   ├── menuItems.ts   # Menu items API
│   │   └── orders.ts      # Orders API
│   └── hooks/             # Custom React hooks
│       ├── useMenuItems.ts # Menu items data fetching
│       └── useOrders.ts   # Orders data fetching and mutations
├── types/                 # TypeScript type definitions
│   └── index.ts           # Shared types
├── utils/                 # Utility functions
│   └── index.ts           # Helper functions
└── constants/            # Application constants
    └── index.ts           # Type-safe constants
```

## 🛠️ Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

3. **Run development server**:
```bash
npm run dev
```

4. **Build for production**:
```bash
npm run build
npm start
```

## 🎯 Key Patterns Used

### 1. **Code Splitting**
```typescript
const POSView = dynamic(() => import('@/components/views/POSView'), {
  loading: () => <div>Loading...</div>,
});
```

### 2. **Component Memoization**
```typescript
const ProductCard = memo(({ item, onAdd }) => {
  // Component implementation
});
```

### 3. **Custom Hooks for Data Fetching**
```typescript
const { menuItems, isLoading } = useMenuItems(true);
const { orders } = useOrdersByStatus('pending');
```

### 4. **Optimistic Updates**
```typescript
mutate('orders', (current) => [...current, newOrder], false);
mutate('orders'); // Revalidate
```

### 5. **Type-Safe Constants**
```typescript
export const ORDER_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
} as const;

type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];
```

## 📡 API Integration

The frontend connects to the FastAPI backend at `http://localhost:8000/api/v1`.

### Endpoints Used:
- `GET /menu-items` - Fetch all menu items
- `GET /menu-items/category/{category}` - Filter by category
- `POST /orders` - Create new order
- `GET /orders/status/{status}` - Get orders by status
- `PATCH /orders/{id}/status` - Update order status

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **Lucide React** for icons

## ⚡ Performance Optimizations

1. **Lazy Loading**: Views are loaded on-demand
2. **Memoization**: Components and callbacks are memoized
3. **SWR Caching**: Automatic request deduplication and caching
4. **Optimistic Updates**: UI updates immediately, syncs in background
5. **Image Optimization**: Lazy loading for product images

## 🔒 Type Safety

- Strict TypeScript configuration
- No `any` types allowed
- Proper type inference throughout
- Type-safe API calls and responses

## 📝 Development Guidelines

1. **Always use TypeScript types** - No `any` types
2. **Memoize expensive computations** - Use `useMemo` and `useCallback`
3. **Split large components** - Keep components focused and small
4. **Use custom hooks** - Extract reusable logic
5. **Handle errors gracefully** - Provide user feedback
6. **Optimize re-renders** - Use `React.memo` where appropriate

## 🐛 Troubleshooting

### API Connection Issues
- Ensure backend is running on `http://localhost:8000`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`

### Type Errors
- Run `npm run build` to check for type errors
- Ensure all imports use proper types

### Performance Issues
- Check React DevTools Profiler
- Verify memoization is working correctly
- Check SWR cache configuration
