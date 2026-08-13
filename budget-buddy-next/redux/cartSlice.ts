import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
    name: string;
    price: number;
    quantity: number;
    location: string;
    image?: string;
}

interface CartState {
    items: Record<string, CartItem>;
}

const initialState: CartState = {
    items: {},
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<{ id: string; name: string; price: number; location: string; image: string }>) => {
            const { id, name, price, location, image } = action.payload;
            if (state.items[id]) {
                state.items[id].quantity += 1;
            } else {
                state.items[id] = { name, price, quantity: 1, location, image };
            }
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            if (state.items[id]) {
                if (state.items[id].quantity > 1) {
                    state.items[id].quantity -= 1;
                } else {
                    delete state.items[id];
                }
            }
        },
        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const { id, quantity } = action.payload;
            if (quantity <= 0) {
                delete state.items[id];
            } else if (state.items[id]) {
                state.items[id].quantity = quantity;
            }
        },
        clearLocation: (state, action: PayloadAction<string>) => {
            const locationName = action.payload;
            Object.keys(state.items).forEach((id) => {
                if (state.items[id].location === locationName) {
                    delete state.items[id];
                }
            });
        },
        clearAll: (state) => {
            state.items = {};
        },
        // New: Helper to load data from localStorage after mount
        hydrateCart: (state, action: PayloadAction<Record<string, CartItem>>) => {
            state.items = action.payload;
        }
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearLocation, clearAll, hydrateCart } = cartSlice.actions;
export default cartSlice.reducer;
