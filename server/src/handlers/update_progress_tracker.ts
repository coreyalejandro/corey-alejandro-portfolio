
import { db } from '../db';
import { progressTrackersTable } from '../db/schema';
import { type UpdateProgressTrackerInput, type ProgressTracker } from '../schema';
import { eq } from 'drizzle-orm';

export const updateProgressTracker = async (input: UpdateProgressTrackerInput): Promise<ProgressTracker | null> => {
  try {
    // Check if the progress tracker exists
    const existingTracker = await db.select()
      .from(progressTrackersTable)
      .where(eq(progressTrackersTable.id, input.id))
      .execute();

    if (existingTracker.length === 0) {
      return null;
    }

    // Build update object with only provided fields
    const updateData: any = {};
    
    if (input.project_name !== undefined) {
      updateData.project_name = input.project_name;
    }
    
    if (input.current_phase !== undefined) {
      updateData.current_phase = input.current_phase;
    }
    
    if (input.completion_percentage !== undefined) {
      updateData.completion_percentage = input.completion_percentage;
    }
    
    if (input.milestones !== undefined) {
      updateData.milestones = input.milestones;
    }

    // Always update the updated_at timestamp
    updateData.updated_at = new Date();

    // Update the progress tracker
    const result = await db.update(progressTrackersTable)
      .set(updateData)
      .where(eq(progressTrackersTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      return null;
    }

    // Return the updated progress tracker with proper type conversion
    const updatedTracker = result[0];
    return {
      id: updatedTracker.id,
      project_name: updatedTracker.project_name,
      current_phase: updatedTracker.current_phase,
      completion_percentage: updatedTracker.completion_percentage,
      milestones: updatedTracker.milestones as { name: string; completed: boolean; due_date: Date | null; }[],
      created_at: updatedTracker.created_at,
      updated_at: updatedTracker.updated_at
    };
  } catch (error) {
    console.error('Progress tracker update failed:', error);
    throw error;
  }
};
