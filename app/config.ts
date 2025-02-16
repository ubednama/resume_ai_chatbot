import { z } from 'zod';

const configSchema = z.object({
  GOOGLE_API_KEY: z.string().min(1),
});

const config = configSchema.parse({
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
});

export default config;