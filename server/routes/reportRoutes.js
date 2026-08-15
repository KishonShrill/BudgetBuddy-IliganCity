// server/routes/reports.js (or similar)
import express from 'express';
import axios from 'axios';
import { ok, err, ResultAsync } from 'neverthrow';
import { user_verify } from '../helpers/auth.js';

const router = express.Router();

// Determine if we should skip CAPTCHA globally based on the env variable
const skipCaptcha = !process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY;

router.post('/missing-location', user_verify, async (req, res) => {
    const { locationName, mapsUrl, notes, captchaToken } = req.body;

    const validateInput = () => {
        // Skip token check if reCAPTCHA is disabled in env
        if (!skipCaptcha && !captchaToken) {
            return err({ status: 400, message: "Please complete the reCAPTCHA challenge." });
        }
        if (!locationName) {
            return err({ status: 400, message: "location name is required." });
        }
        if (!mapsUrl) {
            return err({ status: 400, message: "Google map url is required." });
        }
        return ok(captchaToken);
    };

    const verifyCaptcha = (token) => {
        // Immediately bypass verification if disabled
        if (skipCaptcha) return ok(true);

        const secret = process.env.RECAPTCHA_SECRETKEY;
        const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';

        return ResultAsync.fromPromise(
            axios.post(verifyUrl, null, {
                params: {
                    secret: secret,
                    response: token
                }
            }),
            (error) => {
                console.error("reCAPTCHA Network Error:", error.message);
                return { status: 500, message: "Failed to communicate with reCAPTCHA service." };
            }
        ).andThen((response) => {
            if (!response.data.success) {
                console.log("Google Rejection Data:", response.data); // Helpful for debugging
                return err({ status: 400, message: "Bot detected or invalid CAPTCHA." });
            }
            return ok(true);
        });
    };

    const sendDiscordWebhook = () => {
        const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

        const embedMessage = {
            username: "Budget Buddy Reporter",
            avatar_url: "https://res.cloudinary.com/dlmabgte3/image/upload/v1774840391/budgetbuddy-logo-accented.png",
            embeds: [
                {
                    title: "🚨 New Missing Location Report",
                    description: "A user has submitted a request to add a new grocery location.",
                    color: 16345634, // Orange color code in decimal (Hex #F97316 to match Tailwind orange-500)
                    fields: [
                        {
                            name: "📍 Location Name",
                            value: locationName || "Not provided",
                            inline: true
                        },
                        {
                            name: "🗺️ Google Maps URL",
                            value: `[View on Google Maps](${mapsUrl})`,
                            inline: false
                        },
                        {
                            name: "📝 Additional Notes",
                            value: notes || "No additional notes provided.",
                            inline: false
                        }
                    ],
                    footer: {
                        text: `Budget Buddy System • ${new Date().toLocaleString()}`
                    }
                }
            ]
        };

        return ResultAsync.fromPromise(
            axios.post(DISCORD_WEBHOOK_URL, embedMessage),
            (error) => {
                console.error("Discord Webhook Error:", error.message);
                return { status: 500, message: "Failed to send report to Discord." };
            }
        );
    };

    validateInput()
        .andThen(verifyCaptcha) // Runs only if validateInput is ok()
        .andThen(sendDiscordWebhook) // Runs only if verifyCaptcha is ok()
        .map(() => ({ message: "Report sent successfully to Discord!" })) // Transforms the final ok() payload
        .match(
            (successData) => res.status(200).json(successData),
            (errorData) => res.status(errorData.status).json({ message: errorData.message })
        );
});

router.post('/missing-product', user_verify, async (req, res) => {
    const { productName, referenceUrl, notes, captchaToken } = req.body;

    const validateInput = () => {
        // Skip token check if reCAPTCHA is disabled in env
        if (!skipCaptcha && !captchaToken) {
            return err({ status: 400, message: "Please complete the reCAPTCHA challenge." });
        }
        if (!productName) {
            return err({ status: 400, message: "Product name is required." });
        }
        if (!referenceUrl) {
            return err({ status: 400, message: "Reference url is required." });
        }
        return ok(captchaToken);
    };

    const verifyCaptcha = (token) => {
        // Immediately bypass verification if disabled
        if (skipCaptcha) return ok(true);

        const secret = process.env.RECAPTCHA_SECRETKEY;
        const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';

        return ResultAsync.fromPromise(
            axios.post(verifyUrl, null, {
                params: {
                    secret: secret,
                    response: token
                }
            }),
            (error) => {
                console.error("reCAPTCHA Network Error:", error.message);
                return { status: 500, message: "Failed to communicate with reCAPTCHA service." };
            }
        ).andThen((response) => {
            if (!response.data.success) {
                console.log("Google Rejection Data:", response.data); // Helpful for debugging
                return err({ status: 400, message: "Bot detected or invalid CAPTCHA." });
            }
            return ok(true);
        });
    };

    const sendDiscordWebhook = () => {
        const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

        const embedMessage = {
            username: "Budget Buddy Reporter",
            avatar_url: "https://res.cloudinary.com/dlmabgte3/image/upload/v1774840391/budgetbuddy-logo-accented.png",
            embeds: [
                {
                    title: "🛒 New Missing Product Report",
                    description: "A user has submitted a request to add a new product.",
                    color: 16345634,
                    fields: [
                        {
                            name: "📦 Product Name",
                            value: productName,
                            inline: true
                        },
                        {
                            name: "🔗 Reference URL",
                            value: referenceUrl ? `[View Reference](${referenceUrl})` : "Not provided",
                            inline: false
                        },
                        {
                            name: "📝 Additional Notes",
                            value: notes || "No additional notes provided.",
                            inline: false
                        }
                    ],
                    footer: {
                        text: `Budget Buddy System • ${new Date().toLocaleString()}`
                    }
                }
            ]
        };

        return ResultAsync.fromPromise(
            axios.post(DISCORD_WEBHOOK_URL, embedMessage),
            (error) => {
                console.error("Discord Webhook Error:", error.message);
                return { status: 500, message: "Failed to send report to Discord." };
            }
        );
    };

    validateInput()
        .andThen(verifyCaptcha) // Runs only if validateInput is ok()
        .andThen(sendDiscordWebhook) // Runs only if verifyCaptcha is ok()
        .map(() => ({ message: "Report sent successfully to Discord!" })) // Transforms the final ok() payload
        .match(
            (successData) => res.status(200).json(successData),
            (errorData) => res.status(errorData.status).json({ message: errorData.message })
        );
});


export default router;
