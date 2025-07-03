
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { progressTrackersTable } from '../db/schema';
import { type CreateProgressTrackerInput, type UpdateProgressTrackerInput } from '../schema';
import { updateProgressTracker } from '../handlers/update_progress_tracker';
import { eq } from 'drizzle-orm';

// Test data setup
const createTestTracker = async (): Promise<number> => {
  const testInput: CreateProgressTrackerInput = {
    project_name: 'Test Project',
    current_phase: 'Development',
    completion_percentage: 25,
    milestones: [
      {
        name: 'Initial Setup',
        completed: true,
        due_date: new Date('2024-01-15')
      },
      {
        name: 'Feature Implementation',
        completed: false,
        due_date: new Date('2024-02-01')
      }
    ]
  };

  const result = await db.insert(progressTrackersTable)
    .values({
      ...testInput,
      milestones: JSON.stringify(testInput.milestones)
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('updateProgressTracker', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a progress tracker with all fields', async () => {
    const trackerId = await createTestTracker();

    const updateInput: UpdateProgressTrackerInput = {
      id: trackerId,
      project_name: 'Updated Project Name',
      current_phase: 'Testing',
      completion_percentage: 75,
      milestones: [
        {
          name: 'Initial Setup',
          completed: true,
          due_date: new Date('2024-01-15')
        },
        {
          name: 'Feature Implementation',
          completed: true,
          due_date: new Date('2024-02-01')
        },
        {
          name: 'Testing Phase',
          completed: false,
          due_date: new Date('2024-02-15')
        }
      ]
    };

    const result = await updateProgressTracker(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(trackerId);
    expect(result!.project_name).toEqual('Updated Project Name');
    expect(result!.current_phase).toEqual('Testing');
    expect(result!.completion_percentage).toEqual(75);
    expect(result!.milestones).toHaveLength(3);
    expect(result!.milestones[2].name).toEqual('Testing Phase');
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    const trackerId = await createTestTracker();

    const updateInput: UpdateProgressTrackerInput = {
      id: trackerId,
      completion_percentage: 50,
      current_phase: 'Implementation'
    };

    const result = await updateProgressTracker(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(trackerId);
    expect(result!.project_name).toEqual('Test Project'); // Should remain unchanged
    expect(result!.current_phase).toEqual('Implementation'); // Should be updated
    expect(result!.completion_percentage).toEqual(50); // Should be updated
    expect(result!.milestones).toHaveLength(2); // Should remain unchanged
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should persist changes to database', async () => {
    const trackerId = await createTestTracker();

    const updateInput: UpdateProgressTrackerInput = {
      id: trackerId,
      project_name: 'Database Test Project',
      completion_percentage: 90
    };

    await updateProgressTracker(updateInput);

    // Verify changes were saved to database
    const trackers = await db.select()
      .from(progressTrackersTable)
      .where(eq(progressTrackersTable.id, trackerId))
      .execute();

    expect(trackers).toHaveLength(1);
    expect(trackers[0].project_name).toEqual('Database Test Project');
    expect(trackers[0].completion_percentage).toEqual(90);
    expect(trackers[0].current_phase).toEqual('Development'); // Should remain unchanged
    expect(trackers[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent progress tracker', async () => {
    const updateInput: UpdateProgressTrackerInput = {
      id: 999999,
      project_name: 'Non-existent Project'
    };

    const result = await updateProgressTracker(updateInput);

    expect(result).toBeNull();
  });

  it('should handle milestone updates correctly', async () => {
    const trackerId = await createTestTracker();

    const updateInput: UpdateProgressTrackerInput = {
      id: trackerId,
      milestones: [
        {
          name: 'Planning',
          completed: true,
          due_date: new Date('2024-01-01')
        },
        {
          name: 'Development',
          completed: true,
          due_date: new Date('2024-02-01')
        },
        {
          name: 'Testing',
          completed: false,
          due_date: new Date('2024-03-01')
        },
        {
          name: 'Deployment',
          completed: false,
          due_date: null
        }
      ]
    };

    const result = await updateProgressTracker(updateInput);

    expect(result).not.toBeNull();
    expect(result!.milestones).toHaveLength(4);
    expect(result!.milestones[0].name).toEqual('Planning');
    expect(result!.milestones[0].completed).toBe(true);
    expect(result!.milestones[3].name).toEqual('Deployment');
    expect(result!.milestones[3].due_date).toBeNull();
  });

  it('should update completion percentage within valid range', async () => {
    const trackerId = await createTestTracker();

    const updateInput: UpdateProgressTrackerInput = {
      id: trackerId,
      completion_percentage: 100
    };

    const result = await updateProgressTracker(updateInput);

    expect(result).not.toBeNull();
    expect(result!.completion_percentage).toEqual(100);
  });
});
