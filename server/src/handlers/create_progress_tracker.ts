
import { db } from '../db';
import { progressTrackersTable } from '../db/schema';
import { type CreateProgressTrackerInput, type ProgressTracker } from '../schema';

export const createProgressTracker = async (input: CreateProgressTrackerInput): Promise<ProgressTracker> => {
  try {
    // Insert progress tracker record
    const result = await db.insert(progressTrackersTable)
      .values({
        project_name: input.project_name,
        current_phase: input.current_phase,
        completion_percentage: input.completion_percentage,
        milestones: input.milestones // jsonb column - no conversion needed
      })
      .returning()
      .execute();

    const progressTracker = result[0];
    
    // Convert milestone due_date strings back to Date objects
    const milestones = (progressTracker.milestones as any[]).map(milestone => ({
      ...milestone,
      due_date: milestone.due_date ? new Date(milestone.due_date) : null
    }));

    return {
      ...progressTracker,
      milestones
    };
  } catch (error) {
    console.error('Progress tracker creation failed:', error);
    throw error;
  }
};
