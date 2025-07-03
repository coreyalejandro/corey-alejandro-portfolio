
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

    // Apply limit if provided - use separate query building
    if (limit !== undefined) {
      const results = await query.limit(limit).execute();
      return results.map(result => ({
        ...result,
        date: new Date(result.date),
        created_at: new Date(result.created_at),
        changes: result.changes as any // JSONB field - keep as is
      }));
    }

    // Execute without limit
    const results = await query.execute();

    // Return results with proper type conversion
    return results.map(result => ({
      ...result,
      date: new Date(result.date),
      created_at: new Date(result.created_at),
      changes: result.changes as any // JSONB field - keep as is
    }));
  } catch (error) {
    console.error('Failed to fetch daily change logs:', error);
    throw error;
  }
}
