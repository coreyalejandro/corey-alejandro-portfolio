
import { db } from '../db';
import { aiCuratorInteractionsTable } from '../db/schema';
import { type AiCuratorInteraction } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getAiCuratorInteractions = async (sessionId: string): Promise<AiCuratorInteraction[]> => {
  try {
    // Fetch all interactions for the given session, ordered by creation date (newest first)
    const results = await db.select()
      .from(aiCuratorInteractionsTable)
      .where(eq(aiCuratorInteractionsTable.session_id, sessionId))
      .orderBy(desc(aiCuratorInteractionsTable.created_at))
      .execute();

    // Return the results as-is since all fields are already the correct types
    return results;
  } catch (error) {
    console.error('Failed to fetch AI curator interactions:', error);
    throw error;
  }
};
