
import { db } from '../db';
import { dailyChangeLogsTable } from '../db/schema';
import { type DailyChangeLog } from '../schema';
import { desc } from 'drizzle-orm';

export async function getDailyChangeLogs(limit?: number): Promise<DailyChangeLog[]> {
  try {
    // Build base query with ordering
    let query = db.select()
      .from(dailyChangeLogsTable)
      .orderBy(desc(dailyChangeLogsTable.date));

    // Apply limit if provided - need to create a new query with limit
    const results = limit !== undefined 
      ? await query.limit(limit).execute()
      : await query.execute();

    // Type cast the JSONB changes field to match the expected schema
    return results.map(result => ({
      ...result,
      changes: result.changes as Array<{
        type: 'feature' | 'bugfix' | 'improvement' | 'content';
        description: string;
        impact: 'low' | 'medium' | 'high';
      }>
    }));
  } catch (error) {
    console.error('Failed to get daily change logs:', error);
    throw error;
  }
}
