import { Hono } from 'hono';
import { ResultAsync, errAsync } from 'neverthrow';
import { AppEnv } from '../types';
import { User } from '../models';
import { userVerify, requireRole, ROLE_HIERARCHY } from '../helpers/auth';

const users = new Hono<AppEnv>();

// GET /api/v1/users/me - Fetch my account stats
users.get('/me', userVerify, async (c) => {
  const user = c.get('user');
  if (!user?.user_email) {
    return c.json({ message: 'User context not found' }, 401);
  }

  return await ResultAsync.fromPromise(
    User.find({ email: user.user_email }, { stats: 1, _id: 0 }).exec(),
    (error: any) => new Error(`Database fetch failed: ${error.message}`)
  ).match(
    (userData) => c.json({ user: userData }, 200),
    (error: any) => {
      console.error('Error fetching user stats:', error);
      return c.json(
        { message: 'Failed to retrieve user stats.', error: error.message },
        500
      );
    }
  );
});

// GET /api/v1/users - Fetch all users (Moderator+)
users.get('/', userVerify, requireRole('moderator'), async (c) => {
  const user = c.get('user');
  const currentUserRole = user?.user_role || 'regular';

  if ((ROLE_HIERARCHY[currentUserRole] || 0) < ROLE_HIERARCHY.moderator) {
    return c.json(
      { message: 'Access denied. Insufficient clearance.' },
      403
    );
  }

  return await ResultAsync.fromPromise(
    User.find({}).select('-password -__v').sort({ createdAt: -1 }).exec(),
    (error: any) => new Error(`Database fetch failed: ${error.message}`)
  ).match(
    (allUsers) => c.json({ users: allUsers }, 200),
    (error: any) => {
      console.error('Error fetching users:', error);
      return c.json(
        { message: 'Failed to retrieve users.', error: error.message },
        500
      );
    }
  );
});

// PUT /api/v1/users/:id/role - Update user role based on RBAC hierarchy
users.put('/:id/role', userVerify, requireRole('moderator'), async (c) => {
  const targetUserId = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const newRole = body.role;

  const user = c.get('user');
  const currentUserId = user?.user_id;
  const currentUserRole = user?.user_role || 'regular';

  if (!newRole || !ROLE_HIERARCHY[newRole]) {
    return c.json({ message: 'Invalid role specified.' }, 400);
  }

  if (targetUserId === currentUserId?.toString()) {
    return c.json({ message: 'You cannot modify your own role.' }, 403);
  }

  if (
    (ROLE_HIERARCHY[newRole] || 0) >= (ROLE_HIERARCHY[currentUserRole] || 0)
  ) {
    return c.json(
      { message: 'You cannot assign a role equal to or higher than your own.' },
      403
    );
  }

  return await ResultAsync.fromPromise(
    User.findById(targetUserId).exec(),
    (error: any) => new Error(`Database error: ${error.message}`)
  )
    .andThen((targetUser) => {
      if (!targetUser) {
        return errAsync(new Error('NOT_FOUND'));
      }

      if (
        (ROLE_HIERARCHY[targetUser.role] || 0) >=
        (ROLE_HIERARCHY[currentUserRole] || 0)
      ) {
        return errAsync(new Error('FORBIDDEN'));
      }

      targetUser.role = newRole as any;

      return ResultAsync.fromPromise(
        targetUser.save(),
        (error: any) => new Error(`Failed to save updated role: ${error.message}`)
      );
    })
    .match(
      (savedUser) =>
        c.json(
          {
            message: 'User role updated successfully.',
            user: {
              _id: savedUser._id,
              username: savedUser.username,
              role: savedUser.role,
            },
          },
          200
        ),
      (error: any) => {
        if (error.message === 'NOT_FOUND') {
          return c.json({ message: 'Target user not found.' }, 404);
        }
        if (error.message === 'FORBIDDEN') {
          return c.json(
            {
              message: 'You do not have permission to manage this user.',
            },
            403
          );
        }

        console.error('Error updating role:', error);
        return c.json(
          { message: 'Internal server error.', error: error.message },
          500
        );
      }
    );
});

// DELETE /api/v1/users/:id - Delete a user (Admin Only)
users.delete('/:id', userVerify, requireRole('admin'), async (c) => {
  const targetUserId = c.req.param('id');
  const user = c.get('user');
  const currentUserId = user?.user_id;

  if (targetUserId === currentUserId?.toString()) {
    return c.json(
      {
        message: 'You cannot delete your own admin account from the console.',
      },
      403
    );
  }

  return await ResultAsync.fromPromise(
    User.findByIdAndDelete(targetUserId).exec(),
    (error: any) => new Error(`Database error: ${error.message}`)
  ).match(
    (deletedUser) => {
      if (!deletedUser) {
        return c.json(
          { message: 'Target user not found or already deleted.' },
          404
        );
      }
      return c.json(
        {
          message: `User ${deletedUser.username} has been permanently deleted.`,
        },
        200
      );
    },
    (error: any) => {
      console.error('Error deleting user:', error);
      return c.json(
        { message: 'Internal server error.', error: error.message },
        500
      );
    }
  );
});

export default users;
