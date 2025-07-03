
import { db } from '../db';
import { progressTrackersTable } from '../db/schema';
import { type UpdateProgressTrackerInput, type ProgressTracker } from '../schema';
import { eq } from 'drizzle-orm';

export const updateProgressTracker = async (input: UpdateProgressTrackerInput): Promise<ProgressTracker | null> => {
  try {
    // First check if the progress tracker exists
    const existingTracker = await db.select()
      .from(progressTrackersTable)
      .where(eq(progressTrackersTable.id, input.id))
      .execute();

    if (existingTracker.length === 0) {
      return null;
    }

    // Prepare update data, excluding the id field
    const { id, ...updateData } = input;
    
    // Only include fields that are actually provided in the update
    const fieldsToUpdate: any = {};
    
    if (updateData.project_name !== undefined) {
      fieldsToUpdate.project_name = updateData.project_name;
    }
    
    if (updateData.current_phase !== undefined) {
      fieldsToUpdate.current_phase = updateData.current_phase;
    }
    
    if (updateData.completion_percentage !== undefined) {
      fieldsToUpdate.completion_percentage = updateData.completion_percentage;
    }
    
    if (updateData.milestones !== undefined) {
      fieldsToUpdate.milestones = updateData.milestones;
    }

    // Always update the updated_at timestamp
    fieldsToUpdate.updated_at = new Date();

    // Perform the update
    const result = await db.update(progressTrackersTable)
      .set(fieldsToUpdate)
      .where(eq(progressTrackersTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      return null;
    }

    const updatedTracker = result[0];
    return {
      ...updatedTracker,
      milestones: updatedTracker.milestones as any // Cast jsonb to proper type
    };
  } catch (error) {
    console.error('Progress tracker update failed:', error);
    throw error;
  }
};
