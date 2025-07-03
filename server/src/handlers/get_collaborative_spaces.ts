
import { db } from '../db';
import { collaborativeSpacesTable } from '../db/schema';
import { type CollaborativeSpace } from '../schema';

export const getCollaborativeSpaces = async (): Promise<CollaborativeSpace[]> => {
  try {
    const results = await db.select()
      .from(collaborativeSpacesTable)
      .execute();

    return results.map(space => ({
      ...space,
      // No numeric conversions needed - all fields are already correct types
    }));
  } catch (error) {
    console.error('Failed to fetch collaborative spaces:', error);
    throw error;
  }
};
