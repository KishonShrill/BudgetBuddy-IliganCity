"use client";

import { ThemeProvider } from "./ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GoogleOAuthProvider } from "@react-oauth/google";
import StoreProvider from "./StoreProvider";

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
    // We use useState to ensure the QueryClient is only created once per user session,
    // preventing data loss if React decides to suspend or re-render the component.

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_CLIENT_ID as string}>
                <QueryClientProvider client={queryClient}>
                    <StoreProvider>
                        {children}
                    </StoreProvider>
                    <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
            </GoogleOAuthProvider>
        </ThemeProvider>
    );
}
