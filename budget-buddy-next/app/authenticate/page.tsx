"use client";

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { ResultAsync } from 'neverthrow';
import axios from 'axios';
import Cookies from "js-cookie";
import { useToast } from "@/components/ToastProvider";
import { cn } from "@/helpers/utils";

const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const DEBUG_MODE = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";

export default function AuthPage() {
    const router = useRouter();
    const { addToast } = useToast();
    const token = Cookies.get("budgetbuddy_token");

    const [isLogin, setIsLogin] = useState(true);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    // Dynamic SEO update for Client Components
    useEffect(() => {
        document.title = isLogin ? "Login | Budget Buddy" : "Register | Budget Buddy";
    }, [isLogin]);

    useEffect(() => {
        if (token) {
            router.push("/budget-hub");
        }
    }, [token, router]);

    const actionPath = isLogin ? "login" : "register";
    const url = DEBUG_MODE
        ? `http://${LOCALHOST}:5000/auth/${actionPath}`
        : `https://iliganproductprice-mauve.vercel.app/auth/${actionPath}`;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const processAuth = async (payload: any) => {
        setStatus("loading");
        setErrorMessage("");

        const result = await ResultAsync.fromPromise(axios.post(url, payload), (error: any) => {
            return error.response?.data?.message || "Unable to connect to server. Please try again later.";
        });

        result.match(
            (response) => {
                const data = response.data;
                const user: any = jwtDecode(data.token);
                Cookies.set("budgetbuddy_token", data.token, { expires: 7 }); // 7 days

                addToast("Success", isLogin ? `Welcome back ${user.username}!` : "Account created successfully!", "success");
                setStatus("success");

                startTransition(() => {
                    router.push("/budget-hub");
                });
            },
            (errorMsg) => {
                setStatus("error");
                addToast("Authentication Failed", errorMsg, "destructive");
                if (errorMsg.toLowerCase().includes("not found")) {
                    setIsLogin(false);
                }
                setErrorMessage(errorMsg);
            }
        );
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse: any) => {
            await processAuth({ token: tokenResponse.access_token, iss: tokenResponse.iss || "" });
        },
        onError: (error) => {
            setStatus("error");
            setErrorMessage("Google Authentication failed.");
            console.error(error);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLogin && formData.password !== formData.confirmPassword) {
            setStatus("error");
            setErrorMessage("Passwords do not match.");
            return;
        }

        const payload = isLogin
            ? { email: formData.email, password: formData.password }
            : { username: formData.username, email: formData.email, password: formData.password };

        await processAuth(payload);
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setStatus("idle");
        setErrorMessage("");
        setFormData({ username: "", email: "", password: "", confirmPassword: "" });
    };

    if (token) return null;

    return (
        < main className="px-8 flex justify-center items-center min-h-[calc(100vh-7.75rem)] py-8 transition-colors duration-300 bg-gray-50 dark:bg-gray-900" >
            <div className="w-full max-w-md">
                <form
                    onSubmit={handleSubmit}
                    className="mx-auto p-8 border-2 border-black dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-[0.5rem_0.5rem_0_#ee4d2d] dark:shadow-[0.5rem_0.5rem_0_#ff6b47] transition-all duration-300"
                >
                    <h2 className="text-center font-bold text-xl mb-2 uppercase text-gray-900 dark:text-white">
                        {isLogin ? "Customer Login" : "Create Account"}
                    </h2>
                    <p className="text-center text-xs mb-6 text-gray-500 dark:text-gray-400">
                        {isLogin ? "Insert your credentials" : "Register as a new user"}
                    </p>

                    <div className="space-y-4">
                        {!isLogin && (
                            <div className="flex flex-col">
                                <label className="mb-1 text-xs font-semibold text-gray-900 dark:text-gray-200">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="budget_king_2026"
                                    required={!isLogin}
                                    className="px-3 py-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        )}

                        <div className="flex flex-col">
                            <label className="mb-1 text-xs font-semibold text-gray-900 dark:text-gray-200">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="example@gmail.com"
                                required
                                className="px-3 py-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1 text-xs font-semibold text-gray-900 dark:text-gray-200">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                required
                                className="px-3 py-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        {!isLogin && (
                            <div className="flex flex-col">
                                <label className="mb-1 text-xs font-semibold text-gray-900 dark:text-gray-200">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    required={!isLogin}
                                    className="px-3 py-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className={cn(
                            "w-full cursor-pointer mt-6 py-3 font-bold text-white uppercase border-2 transition-all",
                            "border-black dark:border-gray-600 shadow-[4px_4px_0_black] dark:shadow-[4px_4px_0_#9ca3af]",
                            "active:shadow-none dark:active:shadow-none active:translate-x-0.5 active:translate-y-0.5",
                            isLogin ? "bg-blue-500 dark:bg-blue-600" : "bg-green-600 dark:bg-green-700",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    >
                        {status === "loading" ? "Processing..." : (isLogin ? "Login" : "Sign Up")}
                    </button>

                    <div className="flex flex-col w-full mt-4">
                        <button
                            type="button"
                            onClick={() => googleLogin()}
                            className="w-full cursor-pointer py-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            {isLogin ? "Sign in with Google" : "Sign up with Google"}
                        </button>
                    </div>

                    {status === "error" && (
                        <p className="mt-4 text-center text-red-600 dark:text-red-400 text-xs font-bold">{errorMessage}</p>
                    )}

                    <div className="mt-6 text-center text-xs">
                        <p className="text-gray-600 dark:text-gray-400">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <span
                                onClick={toggleMode}
                                className="text-blue-600 dark:text-blue-400 font-bold cursor-pointer hover:underline"
                            >
                                {isLogin ? "Register here" : "Log in"}
                            </span>
                        </p>
                    </div>
                </form>
            </div>
        </main >
    );
}
