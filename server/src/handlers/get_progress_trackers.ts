
import { db } from '../db';
import { progressTrackersTable } from '../db/schema';
import { type ProgressTracker } from '../schema';

export const getProgressTrackers = async (): Promise<ProgressTracker[]> => {
  try {
    const results = await db.select()
      .from(progressTrackersTable)
      .execute();

    return results.map(tracker => ({
      ...tracker,
      milestones: (tracker.milestones as any[]).map(milestone => ({
        ...milestone,
        due_date: milestone.due_date ? new Date(milestone.due_date) : null
      }))
    }));
  } catch (error) {
    console.error('Failed to fetch progress trackers:', error);
    throw error;
  }
};
