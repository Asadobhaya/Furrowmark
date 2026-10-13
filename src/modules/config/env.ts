import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PUBLIC_BASE_URL: z
    .string()
    .url()
    .default(
      process.env.URL ||
        process.env.DEPLOY_PRIME_URL ||
        "https://furrowmark.netlify.app",
    ),
  DATABASE_URL: z.string().min(1),
  DATABASE_MIGRATOR_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  FIELD_ENCRYPTION_KEY: z.string().min(32),
  STORE_NAME: z.string().min(1).default("Furrowmark"),
  STORE_LOCALE: z.string().min(2).default("en"),
  STORE_TIME_ZONE: z.string().min(1).default("Asia/Karachi"),
  STORE_CURRENCY: z.string().min(3).default("PKR"),
  TURNSTILE_SITE_KEY: z.string().optional().default(""),
  TURNSTILE_SECRET_KEY: z.string().optional().default(""),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env | null = null;

export function getEnv(): Env {
  if (parsedEnv) {
    return parsedEnv;
  }

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(", ");
    throw new Error(`Environment validation failed: ${issues}`);
  }

  parsedEnv = result.data;
  return parsedEnv;
}
