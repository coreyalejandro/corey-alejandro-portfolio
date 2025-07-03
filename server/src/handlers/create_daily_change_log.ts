
import { db } from '../db';
import { dailyChangeLogsTable } from '../db/schema';
import { type CreateDailyChangeLogInput, type DailyChangeLog } from '../schema';

export const createDailyChangeLog = async (input: CreateDailyChangeLogInput): Promise<DailyChangeLog> => {
  try {
    // Insert daily change log record
    const result = await db.insert(dailyChangeLogsTable)
      .values({
        date: input.date,
        changes: input.changes
      })
      .returning()
      .execute();

    // Convert the result to match the expected schema type
    const changeLog = result[0];
    return {
      ...changeLog,
      changes: changeLog.changes as DailyChangeLog['changes']
    };
  } catch (error) {
    console.error('Daily change log creation failed:', error);
    throw error;
  }
};
