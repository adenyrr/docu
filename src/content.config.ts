import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { ACCEPTED_TAGS } from './lib/tags';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    last_modified: z.union([z.string(), z.date()]).transform((value) => new Date(value)),
    tags: z.array(z.string().refine((tag) => ACCEPTED_TAGS.has(tag.trim().toLowerCase()), {
      message: 'Tag hors vocabulaire contrôlé',
    })).min(1),
    draft: z.boolean().default(false),
    search: z.object({ exclude: z.boolean().default(false) }).optional(),
  }),
});

export const collections = { docs };
