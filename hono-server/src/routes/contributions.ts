import { Hono } from 'hono';
import { Types } from 'mongoose';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';
import { AppEnv } from '../types';
import { PendingListing, User } from '../models';
import { userVerify, isOneWeekOld } from '../helpers/auth';
import { calculateUserLevel } from '../helpers/gamification';

const contributions = new Hono<AppEnv>();

// GET /api/v1/contributions/pending - Fetch pending contributions and quota status
contributions.get('/pending', userVerify, isOneWeekOld, async (c) => {
  const user = c.get('user');
  const currentUserId = user?.user_id?.toString();

  if (!currentUserId || !Types.ObjectId.isValid(currentUserId)) {
    return c.json({ message: 'Invalid user ID in token.' }, 400);
  }

  return await ResultAsync.fromPromise(
    User.findById(currentUserId)
      .select(
        'account_created daily_votes daily_submissions last_vote_date last_submission_date max_daily_votes max_daily_submissions'
      )
      .lean()
      .exec(),
    (error: any) => new Error(`User Fetch Error: ${error.message}`)
  )
    .andThen((userDoc) => {
      if (!userDoc) return errAsync(new Error('USER_NOT_FOUND'));

      return ResultAsync.fromPromise(
        PendingListing.find({ status: 'pending' })
          .sort({ createdAt: -1 })
          .lean()
          .exec(),
        (error: any) => new Error(`LISTINGS_FETCH_ERROR: ${error.message}`)
      ).map((pendingItems) => ({ userDoc, pendingItems }));
    })
    .map(({ userDoc, pendingItems }) => {
      let realVotesToday = 0;
      let realSubmissionsToday = 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (userDoc.last_vote_date && new Date(userDoc.last_vote_date) >= today) {
        realVotesToday = userDoc.daily_votes;
      }
      if (
        userDoc.last_submission_date &&
        new Date(userDoc.last_submission_date) >= today
      ) {
        realSubmissionsToday = userDoc.daily_submissions;
      }

      const sanitizedItems = pendingItems.map((item) => {
        const userVoteObj = item.voters?.find(
          (v) => v.userId?.toString() === currentUserId
        );

        return {
          id: item._id,
          name: item.productName,
          price: item.price,
          location: item.location,
          category: item.category,
          upvotes: item.upvoteCount,
          downvotes: item.downvoteCount,
          status: item.status,
          myVote: userVoteObj ? true : null,
        };
      });

      return {
        pending: sanitizedItems,
        votesToday: realVotesToday,
        submissionsToday: realSubmissionsToday,
        maxVotes: userDoc.max_daily_votes,
        maxSubmissions: userDoc.max_daily_submissions,
      };
    })
    .match(
      (payload) => c.json(payload, 200),
      (error: any) => {
        console.error(error);
        if (error.message === 'USER_NOT_FOUND') {
          return c.json({ message: 'User profile not found.' }, 404);
        }
        return c.json({ message: 'Error fetching contributions' }, 500);
      }
    );
});

// POST /api/v1/contributions - Submit a new contribution
contributions.post('/', userVerify, isOneWeekOld, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { productName, price, location, category, listType } = body;
  const user = c.get('user');
  const currentUserId = user?.user_id;

  if (!currentUserId || !Types.ObjectId.isValid(currentUserId)) {
    return c.json({ message: 'Invalid user ID' }, 400);
  }

  const userDoc = await User.findById(currentUserId);
  if (!userDoc) {
    return c.json({ message: 'User not found.' }, 404);
  }

  // Daily reset check
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (
    !userDoc.last_submission_date ||
    new Date(userDoc.last_submission_date) < today
  ) {
    userDoc.daily_submissions = 0;
  }

  if (userDoc.daily_submissions >= userDoc.max_daily_submissions) {
    return c.json(
      {
        message:
          'You have reached your limit of submissions for today. Come back tomorrow!',
      },
      429
    );
  }

  if (!productName || price === undefined || !location || !category) {
    return c.json({ message: 'Missing required fields.' }, 400);
  }

  try {
    const newContribution = new PendingListing({
      productName,
      price: Number(price),
      location,
      category,
      listType: listType || 'Groceries',
      submittedBy: [
        {
          user_id: new Types.ObjectId(currentUserId),
          user_name: userDoc.username || user?.username || 'Anonymous',
        },
      ],
      voters: [],
      upvoteCount: 0,
      downvoteCount: 0,
      status: 'pending',
    });

    userDoc.daily_submissions += 1;
    userDoc.last_submission_date = new Date();

    await Promise.all([newContribution.save(), userDoc.save()]);

    return c.json(
      {
        message: 'Contribution submitted successfully!',
        data: {
          id: newContribution._id,
          productName: newContribution.productName,
          status: newContribution.status,
        },
      },
      201
    );
  } catch (error: any) {
    console.error('Submission Error:', error);
    return c.json(
      { message: 'Internal server error.', error: error.message },
      500
    );
  }
});

// POST /api/v1/contributions/:id/vote - Cast vote on pending listing
contributions.post('/:id/vote', userVerify, isOneWeekOld, async (c) => {
  const targetId = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const { voteType } = body;

  if (voteType !== 'up' && voteType !== 'down') {
    return c.json({ message: "Invalid voteType. Must be 'up' or 'down'." }, 400);
  }

  if (!Types.ObjectId.isValid(targetId)) {
    return c.json({ message: 'Invalid contribution ID format' }, 400);
  }

  const user = c.get('user');
  const currentUserId = user?.user_id;

  if (!currentUserId || !Types.ObjectId.isValid(currentUserId)) {
    return c.json({ message: 'Invalid user session ID.' }, 400);
  }

  const userDoc = await User.findById(currentUserId);
  if (!userDoc) {
    return c.json({ message: 'User not found.' }, 404);
  }

  // Daily reset check
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!userDoc.last_vote_date || new Date(userDoc.last_vote_date) < today) {
    userDoc.daily_votes = 0;
  }

  if (userDoc.daily_votes >= userDoc.max_daily_votes) {
    return c.json(
      {
        message: `You have reached your limit of ${userDoc.max_daily_votes} votes for today. Come back tomorrow!`,
      },
      429
    );
  }

  const voteField = voteType === 'up' ? 'upvoteCount' : 'downvoteCount';
  const targetObjectId = new Types.ObjectId(targetId);
  const userObjectId = new Types.ObjectId(currentUserId);

  const processVote = async () => {
    const updatedItem = await PendingListing.findOneAndUpdate(
      {
        _id: targetObjectId,
        status: 'pending',
        'submittedBy.user_id': { $ne: userObjectId },
        'voters.userId': { $ne: userObjectId },
      },
      {
        $push: {
          voters: { userId: userObjectId, voteType },
        },
        $inc: { [voteField]: 1 },
      },
      { returnDocument: 'after' }
    ).exec();

    if (!updatedItem) {
      const checkItem = await PendingListing.findById(targetObjectId);
      if (!checkItem || checkItem.status !== 'pending') {
        throw new Error('NOT_FOUND');
      }
      if (
        checkItem.submittedBy?.[0]?.user_id?.toString() ===
        userObjectId.toString()
      ) {
        throw new Error('SELF_VOTE');
      }
      throw new Error('DUPLICATE_VOTE');
    }

    userDoc.daily_votes += 1;
    userDoc.last_vote_date = new Date();
    userDoc.stats.points = (userDoc.stats.points || 0) + 1;

    if (userDoc.daily_votes === userDoc.max_daily_votes) {
      userDoc.stats.points += 10;
    }
    userDoc.role = calculateUserLevel(userDoc.stats.points, userDoc.role);

    const totalVotes = updatedItem.upvoteCount + updatedItem.downvoteCount;

    if (totalVotes >= 3) {
      const approvalRating = updatedItem.upvoteCount / totalVotes;
      const isApproved = approvalRating >= 0.5;

      updatedItem.status = isApproved ? 'approved' : 'rejected';

      let submitterXpReward = 5;
      if (isApproved) {
        submitterXpReward = approvalRating >= 0.8 ? 35 : 25;
      }

      if (updatedItem.submittedBy?.[0]?.user_id) {
        const submitter = await User.findById(
          updatedItem.submittedBy[0].user_id
        );
        if (submitter) {
          submitter.stats.points =
            (submitter.stats.points || 0) + submitterXpReward;
          submitter.role = calculateUserLevel(
            submitter.stats.points,
            submitter.role
          );
          await submitter.save();
        }
      }

      const correctVoterIds = updatedItem.voters
        .filter(
          (v) =>
            (isApproved && v.voteType === 'up') ||
            (!isApproved && v.voteType === 'down')
        )
        .map((v) => v.userId);

      if (correctVoterIds.length > 0) {
        await User.updateMany(
          { _id: { $in: correctVoterIds } },
          { $inc: { 'stats.points': 2 } }
        );
      }

      await Promise.all([updatedItem.save(), userDoc.save()]);
      return isApproved ? 'APPROVED_AND_MIGRATED' : 'REJECTED_DUE_TO_RATING';
    }

    await userDoc.save();
    return 'VOTE_RECORDED';
  };

  return await ResultAsync.fromPromise(
    processVote(),
    (error: any) => error as Error
  ).match(
    (actionStatus) =>
      c.json(
        { message: 'Vote successfully cast', status: actionStatus },
        200
      ),
    (error: Error) => {
      if (error.message === 'NOT_FOUND') {
        return c.json(
          { message: 'Item not found or already processed.' },
          404
        );
      }
      if (error.message === 'SELF_VOTE') {
        return c.json(
          { message: 'You cannot vote on your own submissions.' },
          403
        );
      }
      if (error.message === 'DUPLICATE_VOTE') {
        return c.json(
          { message: 'You have already voted on this item.' },
          409
        );
      }

      console.error('Vote Error:', error);
      return c.json(
        { message: 'Internal server error while casting vote.' },
        500
      );
    }
  );
});

export default contributions;
