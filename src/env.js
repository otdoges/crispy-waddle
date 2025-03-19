import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    ENCRYPTION_KEY_VERSION: z.string().default("v1"),
    SECURE_SESSION_SECRET: z.string().min(10),
    AUTH_TOKEN_EXPIRY: z.string().transform((s) => parseInt(s, 10)).default("86400"),
    PASSWORD_MIN_LENGTH: z.string().transform((s) => parseInt(s, 10)).default("8"),
    AUTH_MAX_LOGIN_ATTEMPTS: z.string().transform((s) => parseInt(s, 10)).default("5"),
    APP_URL: z.string().url().default("http://localhost:3000"),
    APP_NAME: z.string().default("SecureChat"),
    APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
    NEXT_PUBLIC_APP_NAME: z.string().default("SecureChat"),
    NEXT_PUBLIC_PASSWORD_MIN_LENGTH: z.string().transform((s) => parseInt(s, 10)).default("8"),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.APP_NAME,
    NEXT_PUBLIC_PASSWORD_MIN_LENGTH: process.env.PASSWORD_MIN_LENGTH,
    ENCRYPTION_KEY_VERSION: process.env.ENCRYPTION_KEY_VERSION,
    SECURE_SESSION_SECRET: process.env.SECURE_SESSION_SECRET,
    AUTH_TOKEN_EXPIRY: process.env.AUTH_TOKEN_EXPIRY,
    PASSWORD_MIN_LENGTH: process.env.PASSWORD_MIN_LENGTH,
    AUTH_MAX_LOGIN_ATTEMPTS: process.env.AUTH_MAX_LOGIN_ATTEMPTS,
    APP_URL: process.env.APP_URL,
    APP_NAME: process.env.APP_NAME,
    APP_ENV: process.env.APP_ENV,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
