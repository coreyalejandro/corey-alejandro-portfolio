
import { db } from '../db';
import { aiCuratorInteractionsTable } from '../db/schema';
import { type AiCuratorInteraction } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getAiCuratorInteractions = async (sessionId: string): Promise<AiCuratorInteraction[]> => {
  try {
    const results = await db.select()
      .from(aiCuratorInteractionsTable)
      .where(eq(aiCuratorInteractionsTable.session_id, sessionId))
      .orderBy(desc(aiCuratorInteractionsTable.created_at))
      .execute();

    return results.map(interaction => ({
      ...interaction,
      created_at: interaction.created_at
    }));
  } catch (error) {
    console.error('Failed to fetch AI curator interactions:', error);
    throw error;
  }
};
