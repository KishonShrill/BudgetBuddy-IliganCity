export interface Bindings {
  HIDDEN_URI: string;
  JWT_SECRET: string;
  VITE_DEVELOPMENT?: string;
  VITE_LOCALHOST?: string;
  VITE_CLIENT_ID?: string;
  NEXT_PUBLIC_RECAPTCHA_SITEKEY?: string;
  RECAPTCHA_SECRETKEY?: string;
  DISCORD_WEBHOOK_URL?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
}

export interface AuthUser {
  user_id: string;
  user_email: string;
  user_role: string;
  username: string;
  account_created?: string | Date;
  profile_picture?: string;
  user_picture?: string;
}

export interface Variables {
  user?: AuthUser;
}

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
