import { z } from "zod";

export const NapkinHackathonSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  tagline: z.string(),
  runwayVideoUrl: z.string().optional(),
  accentColor: z.string(),
  backgroundColor: z.string(),
});

export type NapkinHackathonProps = z.infer<typeof NapkinHackathonSchema>;
