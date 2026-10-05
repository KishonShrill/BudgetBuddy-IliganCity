import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { ResultAsync, okAsync, errAsync } from 'neverthrow';
import { AppEnv } from '../types';
import { userVerify, requireRole } from '../helpers/auth';
import { hashPassword, comparePassword } from '../helpers/bcrypt';
import { User, IUser } from '../models';

const auth = new Hono<AppEnv>();

// 1. Free endpoint
auth.get('/free-endpoint', (c) => {
  return c.json({ message: 'You are free to access me anytime' });
});

// 2. Auth me endpoint
auth.post('/me', userVerify, requireRole('regular'), (c) => {
  const user = c.get('user');
  return c.json(user);
});

// 3. Register endpoint
auth.post('/register', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { token, iss, username, email, password } = body;

  let payload: any = null;
  if (token) {
    try {
      const googleResponse = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (googleResponse.ok) {
        payload = await googleResponse.json();
      }
    } catch (e) {
      payload = null;
    }
  }

  const prepareUser = (): ResultAsync<
    IUser,
    { status: number; message: string; error?: any }
  > => {
    if (iss === 'https://accounts.google.com') {
      if (!payload) {
        return errAsync({ status: 400, message: 'Invalid Google token' });
      }

      const { email: googleEmail, email_verified, name, picture } = payload;

      if (!email_verified) {
        return errAsync({
          status: 400,
          message: 'Please verify your google account',
        });
      }

      const newUser = new User({
        email: googleEmail,
        role: 'regular',
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
          rejected: 0,
        },
      });

      return okAsync(newUser);
    }

    if (typeof email !== 'string') {
      return errAsync({ status: 400, message: 'Invalid email' });
    }
    if (!email || !password) {
      return errAsync({
        status: 400,
        message: 'Email and password are required',
      });
    }

    return ResultAsync.fromPromise(
      hashPassword(password),
      (error: any) => ({
        status: 500,
        message: 'Failed to secure password',
        error,
      })
    ).map(
      (hashedPassword) =>
        new User({
          email,
          password: hashedPassword,
          role: 'regular',
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
            rejected: 0,
          },
        })
    );
  };

  return await prepareUser()
    .andThen((user: IUser) =>
      ResultAsync.fromPromise(user.save(), (error: any) => {
        if (error.code === 11000 || error.cause?.code === 11000) {
          return { status: 409, message: 'Email is already used' };
        }
        return {
          status: 500,
          message: 'Error creating user',
          error: error.message,
        };
      })
    )
    .andThen((user: IUser) => {
      const tokenPayload: Record<string, any> = {
        user_id: user._id.toString(),
        user_email: user.email,
        user_role: user.role,
        username: user.username,
        account_created: user.account_created,
        exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      };

      if (iss === 'https://accounts.google.com') {
        tokenPayload.user_picture = user.profile_picture;
      }

      return ResultAsync.fromPromise(
        sign(tokenPayload, c.env.JWT_SECRET, 'HS256'),
        () => ({ status: 500, message: 'Token signing failed' })
      ).map((jwtToken) => ({
        message: 'Login Successful',
        token: jwtToken,
      }));
    })
    .match(
      (successData: { message: string; token: string }) =>
        c.json(successData, 201),
      (errorData: { status: number; message: string; error?: any }) =>
        c.json(
          { message: errorData.message, error: errorData.error },
          errorData.status as any
        )
    );
});

// 4. Login endpoint
auth.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { token, iss, email, password } = body;

  let payload: any = null;
  if (token) {
    try {
      const googleResponse = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (googleResponse.ok) {
        payload = await googleResponse.json();
      }
    } catch (e) {
      payload = null;
    }
  }

  const targetEmail = token ? payload?.email : email;
  if (!targetEmail || typeof targetEmail !== 'string') {
    return c.json({ message: 'Invalid email' }, 400);
  }

  return await ResultAsync.fromPromise(
    User.findOne({ email: targetEmail }).exec(),
    () => ({ status: 500, message: 'Database connection failed' })
  )
    .andThen((user) =>
      user ? okAsync(user) : errAsync({ status: 404, message: 'User not found' })
    )
    .andThen((user) => {
      if (iss === 'https://accounts.google.com') {
        return okAsync(user);
      }

      if (!user.password) {
        return errAsync({
          status: 400,
          message: 'Account was registered with Google. Please use Google Login.',
        });
      }

      return ResultAsync.fromPromise(
        comparePassword(password, user.password),
        () => ({ status: 500, message: 'Encryption validation failed' })
      ).andThen((isMatch) =>
        isMatch
          ? okAsync(user)
          : errAsync({ status: 400, message: 'Passwords do not match' })
      );
    })
    .andThen((user) => {
      const initToken: Record<string, any> = {
        user_id: user._id.toString(),
        user_email: user.email,
        user_role: user.role,
        username: user.username,
        account_created: user.account_created,
        exp: Math.floor(Date.now() / 1000) + 86400, // 24h
      };

      if (iss === 'https://accounts.google.com') {
        initToken.profile_picture = user.profile_picture || payload?.picture;
      } else if (user.profile_picture) {
        initToken.profile_picture = user.profile_picture;
      }

      return ResultAsync.fromPromise(
        sign(initToken, c.env.JWT_SECRET, 'HS256'),
        () => ({ status: 500, message: 'Token signing failed' })
      ).map((jwtToken) => ({
        message: 'Login Successful',
        token: jwtToken,
      }));
    })
    .match(
      (successData) => c.json(successData, 200),
      (errorData: any) =>
        c.json({ message: errorData.message }, errorData.status as any)
    );
});

export default auth;
