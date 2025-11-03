import { z } from 'zod';

// Basic reusable schemas. More can be added as API contracts grow.
export const menuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
});

export type MenuItem = z.infer<typeof menuItemSchema>;
