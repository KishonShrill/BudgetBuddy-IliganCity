import { Hono } from 'hono';
import { okAsync, errAsync, ResultAsync } from 'neverthrow';
import { AppEnv } from '../types';
import { userVerify } from '../helpers/auth';

const reports = new Hono<AppEnv>();

// POST /api/reports/missing-location
reports.post('/missing-location', userVerify, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { locationName, mapsUrl, notes, captchaToken } = body;

  const skipCaptcha = !c.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY;

  const validateInput = (): ResultAsync<
    string | undefined,
    { status: number; message: string }
  > => {
    if (!skipCaptcha && !captchaToken) {
      return errAsync({
        status: 400,
        message: 'Please complete the reCAPTCHA challenge.',
      });
    }
    if (!locationName) {
      return errAsync({ status: 400, message: 'location name is required.' });
    }
    if (!mapsUrl) {
      return errAsync({ status: 400, message: 'Google map url is required.' });
    }
    return okAsync(captchaToken);
  };

  const verifyCaptcha = (
    token: string | undefined
  ): ResultAsync<boolean, { status: number; message: string }> => {
    if (skipCaptcha || !token) return okAsync(true);

    const secret = c.env.RECAPTCHA_SECRETKEY;
    if (!secret) {
      console.warn('RECAPTCHA_SECRETKEY not configured, bypassing verification');
      return okAsync(true);
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(
      secret
    )}&response=${encodeURIComponent(token)}`;

    return ResultAsync.fromPromise(
      fetch(verifyUrl, { method: 'POST' }).then((res) => res.json()),
      (error: any) => {
        console.error('reCAPTCHA Network Error:', error.message);
        return {
          status: 500,
          message: 'Failed to communicate with reCAPTCHA service.',
        };
      }
    ).andThen((data: any) => {
      if (!data?.success) {
        console.log('Google Rejection Data:', data);
        return errAsync({
          status: 400,
          message: 'Bot detected or invalid CAPTCHA.',
        });
      }
      return okAsync(true);
    });
  };

  const sendDiscordWebhook = (): ResultAsync<
    any,
    { status: number; message: string }
  > => {
    const webhookUrl = c.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('DISCORD_WEBHOOK_URL is not set.');
      return okAsync(true);
    }

    const embedMessage = {
      username: 'Budget Buddy Reporter',
      avatar_url:
        'https://res.cloudinary.com/dlmabgte3/image/upload/v1774840391/budgetbuddy-logo-accented.png',
      embeds: [
        {
          title: '🚨 New Missing Location Report',
          description:
            'A user has submitted a request to add a new grocery location.',
          color: 16345634,
          fields: [
            {
              name: '📍 Location Name',
              value: locationName || 'Not provided',
              inline: true,
            },
            {
              name: '🗺️ Google Maps URL',
              value: `[View on Google Maps](${mapsUrl})`,
              inline: false,
            },
            {
              name: '📝 Additional Notes',
              value: notes || 'No additional notes provided.',
              inline: false,
            },
          ],
          footer: {
            text: `Budget Buddy System • ${new Date().toLocaleString()}`,
          },
        },
      ],
    };

    return ResultAsync.fromPromise(
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(embedMessage),
      }),
      (error: any) => {
        console.error('Discord Webhook Error:', error.message);
        return { status: 500, message: 'Failed to send report to Discord.' };
      }
    );
  };

  return await validateInput()
    .andThen(verifyCaptcha)
    .andThen(sendDiscordWebhook)
    .map(() => ({ message: 'Report sent successfully to Discord!' }))
    .match(
      (successData) => c.json(successData, 200),
      (errorData: any) =>
        c.json({ message: errorData.message }, errorData.status as any)
    );
});

// POST /api/reports/missing-product
reports.post('/missing-product', userVerify, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { productName, referenceUrl, notes, captchaToken } = body;

  const skipCaptcha = !c.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY;

  const validateInput = (): ResultAsync<
    string | undefined,
    { status: number; message: string }
  > => {
    if (!skipCaptcha && !captchaToken) {
      return errAsync({
        status: 400,
        message: 'Please complete the reCAPTCHA challenge.',
      });
    }
    if (!productName) {
      return errAsync({ status: 400, message: 'Product name is required.' });
    }
    if (!referenceUrl) {
      return errAsync({ status: 400, message: 'Reference url is required.' });
    }
    return okAsync(captchaToken);
  };

  const verifyCaptcha = (
    token: string | undefined
  ): ResultAsync<boolean, { status: number; message: string }> => {
    if (skipCaptcha || !token) return okAsync(true);

    const secret = c.env.RECAPTCHA_SECRETKEY;
    if (!secret) {
      console.warn('RECAPTCHA_SECRETKEY not configured, bypassing verification');
      return okAsync(true);
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(
      secret
    )}&response=${encodeURIComponent(token)}`;

    return ResultAsync.fromPromise(
      fetch(verifyUrl, { method: 'POST' }).then((res) => res.json()),
      (error: any) => {
        console.error('reCAPTCHA Network Error:', error.message);
        return {
          status: 500,
          message: 'Failed to communicate with reCAPTCHA service.',
        };
      }
    ).andThen((data: any) => {
      if (!data?.success) {
        console.log('Google Rejection Data:', data);
        return errAsync({
          status: 400,
          message: 'Bot detected or invalid CAPTCHA.',
        });
      }
      return okAsync(true);
    });
  };

  const sendDiscordWebhook = (): ResultAsync<
    any,
    { status: number; message: string }
  > => {
    const webhookUrl = c.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('DISCORD_WEBHOOK_URL is not set.');
      return okAsync(true);
    }

    const embedMessage = {
      username: 'Budget Buddy Reporter',
      avatar_url:
        'https://res.cloudinary.com/dlmabgte3/image/upload/v1774840391/budgetbuddy-logo-accented.png',
      embeds: [
        {
          title: '🛒 New Missing Product Report',
          description:
            'A user has submitted a request to add a new product.',
          color: 16345634,
          fields: [
            {
              name: '📦 Product Name',
              value: productName,
              inline: true,
            },
            {
              name: '🔗 Reference URL',
              value: referenceUrl
                ? `[View Reference](${referenceUrl})`
                : 'Not provided',
              inline: false,
            },
            {
              name: '📝 Additional Notes',
              value: notes || 'No additional notes provided.',
              inline: false,
            },
          ],
          footer: {
            text: `Budget Buddy System • ${new Date().toLocaleString()}`,
          },
        },
      ],
    };

    return ResultAsync.fromPromise(
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(embedMessage),
      }),
      (error: any) => {
        console.error('Discord Webhook Error:', error.message);
        return { status: 500, message: 'Failed to send report to Discord.' };
      }
    );
  };

  return await validateInput()
    .andThen(verifyCaptcha)
    .andThen(sendDiscordWebhook)
    .map(() => ({ message: 'Report sent successfully to Discord!' }))
    .match(
      (successData) => c.json(successData, 200),
      (errorData: any) =>
        c.json({ message: errorData.message }, errorData.status as any)
    );
});

export default reports;
