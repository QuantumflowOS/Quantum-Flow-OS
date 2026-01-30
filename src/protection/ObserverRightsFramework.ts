import { z } from 'zod';

export const ObserverRightsSchema = z.object({
  rightNotToBeOptimizedAway: z.boolean().default(true),
});

export type ObserverRights = z.infer<typeof ObserverRightsSchema>;

export class ObserverRightsFramework {
  assertRights(rights: unknown): ObserverRights {
    return ObserverRightsSchema.parse(rights);
  }
}
