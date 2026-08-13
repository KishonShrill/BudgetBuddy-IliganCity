// routes/authRoutes.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import { ResultAsync, ok, err, errAsync, okAsync } from 'neverthrow'
import { user_verify, requireRole } from '../helpers/auth.js';
import { User } from '../models/models.js';

const router = express.Router();
const client = new OAuth2Client(process.env.VITE_CLIENT_ID);

// free endpoint
router.get("/free-endpoint", (req, res) => {
    // #swagger.tags = ['Authentication']
    // #swagger.description = 'Sample of Free for All Endpoint'

    res.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
router.post("/me", user_verify, requireRole("regular"), (req, res) => {
    // #swagger.tags = ['Authentication']
    // #swagger.description = 'Return your information inside bearer token.'

    res.json(req.user);
});

// ==========================================
// REGISTER ENDPOINT
// ==========================================
router.post("/register", async (req, res) => {
    // #swagger.tags = ['Authentication']
    // #swagger.description = 'Endpoint to register a new user.'
    const { token, iss, username, email, password } = req.body;

    const googleResponse = token ? await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
    }) : null;

    const payload = googleResponse ? googleResponse.data : null;

    console.log(payload)

    const prepareUser = () => {
        if (iss === "https://accounts.google.com") {
            const {
                email: googleEmail,
                email_verified,
                name,
                picture,
            } = payload;

            if (!email_verified) return res.status(400).send({ message: "Please verify your google account" });

            return okAsync(new User({
                email: googleEmail,
                role: "regular",
                profile_picture: picture,
                username: name,
                account_created: new Date(),
                daily_votes: 0,
                daily_submissions: 0,
                last_vote_date: null,
                last_submission_date: null,
                max_daily_votes: 5,
                max_daily_submissions: 1,
                stats: {
                    points: 0,
                    approved: 0,
                    pending: 0,
                    rejected: 0
                }
            }));
        }

        if (typeof email !== "string") return res.status(400).send({ message: "Invalid email" });
        if (!email || !password) return res.status(400).send({ message: "Email and password are required" });

        return ResultAsync.fromPromise(
            bcrypt.hash(password, 10),
            (error) => ({ status: 500, message: "Failed to secure password", error })
        ).map((hashedPassword) => new User({
            email,
            password: hashedPassword,
            role: "regular",
            username: username,
            account_created: new Date(),
            daily_votes: 0,
            daily_submissions: 0,
            last_vote_date: null,
            last_submission_date: null,
            max_daily_votes: 5,
            max_daily_submissions: 1,
            stats: {
                points: 0,
                approved: 0,
                pending: 0,
                rejected: 0
            }
        }));
    };

    await prepareUser()
        .andThen((user) =>
            ResultAsync.fromPromise(
                user.save(),
                (error) => {
                    // Catch MongoDB duplicate email error cleanly
                    if (error.code === 11000 || error.cause?.code === 11000) return { status: 409, message: "Email is already used" };
                    return { status: 500, message: "Error creating user", error: error.message };
                }
            )
        ).map((user) => {
            const tokenInit = {
                user_id: user._id,
                user_email: user.email,
                user_role: user.role,
                username: user.username,
            };

            if (iss === "https://accounts.google.com") {
                tokenInit.user_picture = user.profile_picture;
            }

            // BUG FIX: Replaced `const token` with standard return
            const token = jwt.sign(tokenInit, process.env.JWT_SECRET, { expiresIn: "24h" });

            return {
                message: "Login Successful",
                token
            };
        })
        .match(
            (successData) => res.status(201).send(successData),
            (errorData) => res.status(errorData.status).send({ message: errorData.message, error: errorData.error })
        );
});


// ==========================================
// LOGIN ENDPOINT
// ==========================================
router.post("/login", async (req, res) => {
    // #swagger.tags = ['Authentication']
    // #swagger.description = 'Endpoint to login as a user.'
    const { token, iss, email, password } = req.body;

    // 1. Fetch Google payload if token exists (added a .catch to prevent crash if Google is down)
    const googleResponse = token ? await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
    }).catch(() => null) : null;

    const payload = googleResponse ? googleResponse.data : null;

    // 2. Determine target email cleanly
    const targetEmail = token ? payload?.email : email;

    if (!targetEmail || typeof targetEmail !== "string") {
        return res.status(400).send({ message: "Invalid email" });
    }

    // 3. Query the DB (ensuring .exec() is called regardless of login type)
    await ResultAsync
        .fromPromise(
            User.findOne({ email: targetEmail }).exec(),
            () => ({ status: 500, message: "Database connection failed" })
        )
        .andThen((user) =>
            user ? okAsync(user) : errAsync({ status: 404, message: "User not found" })
        )
        .andThen((user) => {
            // Google auth bypasses the password check
            if (iss === "https://accounts.google.com") {
                return okAsync(user);
            }

            // Manual auth checks password
            return ResultAsync.fromPromise(
                bcrypt.compare(password, user.password),
                () => ({ status: 500, message: "Encryption validation failed" })
            ).andThen((isMatch) =>
                isMatch ? okAsync(user) : errAsync({ status: 400, message: "Passwords do not match" })
            );
        }).map((user) => {
            // 4. Build Token with safe fallbacks
            const initToken = {
                user_id: user._id,
                user_email: user.email,
                user_role: user.role,
                username: user.username,
                account_created: user.account_created
            };

            // 5. Handle profile picture logic
            if (iss === "https://accounts.google.com") {
                // If DB has no picture, use the fresh one from Google's payload
                initToken.profile_picture = user.profile_picture || payload?.picture;
            } else if (user.profile_picture) {
                initToken.profile_picture = user.profile_picture;
            }

            const jwtToken = jwt.sign(initToken, process.env.JWT_SECRET, { expiresIn: "24h" });

            return {
                message: "Login Successful",
                token: jwtToken
            };
        })
        .match(
            (successData) => res.status(200).send(successData),
            (errorData) => res.status(errorData.status).send({ message: errorData.message })
        );
});

export default router;
