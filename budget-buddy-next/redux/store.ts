import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";

const store = configureStore({
    reducer: {
        // This matches the "state.cart" we used in the useSelector hook
        cart: cartReducer,
    },
    // DevTools is enabled by default in development mode
    devTools: process.env.NODE_ENV !== "production",
});

// These two lines are CRITICAL for TypeScript
// They allow us to get autocomplete for our State and our Actions
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
