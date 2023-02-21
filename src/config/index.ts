import dotenv from 'dotenv';
import { z } from 'zod';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const configOutput = dotenv.config();
if (configOutput.error) {
  throw configOutput.error;
}

const envSchema = z.object({
  PORT: z.string(),
  LAST_FM_API_URL: z.string(),
  LAST_FM_API_KEY: z.string(),
});

envSchema.parse(process.env);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
