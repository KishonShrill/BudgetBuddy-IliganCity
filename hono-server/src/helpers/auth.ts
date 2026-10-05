import { MiddlewareHandler } from 'hono';
import { verify } from 'hono/jwt';
import { AppEnv, AuthUser } from '../types';

export const ROLE_HIERARCHY: Record<string, number> = {
  regular: 1,
  budget_starter: 2,
  wise_spender: 3,
  budget_guru: 4,
  moderator: 5,
  admin: 10,
};

// 1. Base Authenticator (Who are you?)
export const userVerify: MiddlewareHandler<AppEnv> = async (c, next) => {
  try {
    const authHeader = c.req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ message: 'Access denied. No token provided.' }, 401);
    }

    const token = authHeader.split(' ')[1];
    if (!c.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing in environment variables');
      return c.json({ message: 'Internal server configuration error.' }, 500);
    }

    const decoded = (await verify(
      token,
      c.env.JWT_SECRET,
      'HS256'
    )) as unknown as AuthUser;
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ message: 'Invalid or expired token!' }, 401);
  }
};

// 2. Hierarchical Authorizer (Are you allowed?)
export const requireRole = (minimumRequiredRole: string): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const user = c.get('user');
    if (!user || !user.user_role) {
      return c.json({ message: 'Forbidden: Role not found in token.' }, 403);
    }

    const userLevel = ROLE_HIERARCHY[user.user_role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRequiredRole] || 0;

    if (userLevel >= requiredLevel) {
      await next();
    } else {
      return c.json(
        {
          message: `Forbidden: You need at least '${minimumRequiredRole}' privileges to do this.`,
        },
        403
      );
    }
  };
};

// 3. 7-day Probation Gating
export const isOneWeekOld: MiddlewareHandler<AppEnv> = async (c, next) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ message: 'Access denied. No token provided.' }, 401);
  }

  if (user.user_role && (ROLE_HIERARCHY[user.user_role] || 0) > 1) {
    return await next();
  }

  if (!user.account_created) {
    return c.json(
      {
        message: 'Account creation date not found. Please re-authenticate.',
      },
      403
    );
  }

  const createdDate = new Date(user.account_created);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  if (diffMs < ONE_WEEK_MS) {
    const daysLeft = Math.ceil((ONE_WEEK_MS - diffMs) / (1000 * 60 * 60 * 24));
    return c.json(
      {
        message: `You have ${daysLeft} days left until you can access this page. Please try again next time...`,
      },
      403
    );
  }

  await next();
};
