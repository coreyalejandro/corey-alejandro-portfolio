
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { progressTrackersTable } from '../db/schema';
import { type CreateProgressTrackerInput, type UpdateProgressTrackerInput } from '../schema';
import { updateProgressTracker } from '../handlers/update_progress_tracker';
import { eq } from 'drizzle-orm';

// Test data
const testCreateInput: CreateProgressTrackerInput = {
  project_name: 'Test Project',
  current_phase: 'Development',
  completion_percentage: 50,
  milestones: [
    {
      name: 'Design Phase',
      completed: true,
      due_date: new Date('2024-01-15')
    },
    {
      name: 'Implementation',
      completed: false,
      due_date: new Date('2024-02-15')
    }
  ]
};

const testUpdateInput: UpdateProgressTrackerInput = {
  id: 1,
  project_name: 'Updated Project Name',
  current_phase: 'Testing',
  completion_percentage: 75,
  milestones: [
    {
      name: 'Design Phase',
      completed: true,
      due_date: new Date('2024-01-15')
    },
    {
      name: 'Implementation',
      completed: true,
      due_date: new Date('2024-02-15')
    },
    {
      name: 'Testing',
      completed: false,
      due_date: new Date('2024-03-01')
    }
  ]
};

describe('updateProgressTracker', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update an existing progress tracker', async () => {
    // First create a progress tracker
    const createResult = await db.insert(progressTrackersTable)
      .values({
        project_name: testCreateInput.project_name,
        current_phase: testCreateInput.current_phase,
        completion_percentage: testCreateInput.completion_percentage,
        milestones: testCreateInput.milestones
      })
      .returning()
      .execute();

    const createdTracker = createResult[0];
    
    // Update the progress tracker
    const updateInput = {
      ...testUpdateInput,
      id: createdTracker.id
    };

    const result = await updateProgressTracker(updateInput);

    // Verify the update
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdTracker.id);
    expect(result!.project_name).toEqual('Updated Project Name');
    expect(result!.current_phase).toEqual('Testing');
    expect(result!.completion_percentage).toEqual(75);
    expect(result!.milestones).toHaveLength(3);
    expect(result!.milestones[1].completed).toBe(true);
    expect(result!.milestones[2].name).toEqual('Testing');
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    // Create a progress tracker
    const createResult = await db.insert(progressTrackersTable)
      .values({
        project_name: testCreateInput.project_name,
        current_phase: testCreateInput.current_phase,
        completion_percentage: testCreateInput.completion_percentage,
        milestones: testCreateInput.milestones
      })
      .returning()
      .execute();

    const createdTracker = createResult[0];
    
    // Update only the completion percentage
    const partialUpdateInput: UpdateProgressTrackerInput = {
      id: createdTracker.id,
      completion_percentage: 85
    };

    const result = await updateProgressTracker(partialUpdateInput);

    // Verify partial update
    expect(result).not.toBeNull();
    expect(result!.completion_percentage).toEqual(85);
    expect(result!.project_name).toEqual(testCreateInput.project_name); // Should remain unchanged
    expect(result!.current_phase).toEqual(testCreateInput.current_phase); // Should remain unchanged
    expect(result!.milestones).toHaveLength(2); // Should remain unchanged
  });

  it('should return null for non-existent progress tracker', async () => {
    const result = await updateProgressTracker({
      id: 999,
      completion_percentage: 100
    });

    expect(result).toBeNull();
  });

  it('should save updated progress tracker to database', async () => {
    // Create a progress tracker
    const createResult = await db.insert(progressTrackersTable)
      .values({
        project_name: testCreateInput.project_name,
        current_phase: testCreateInput.current_phase,
        completion_percentage: testCreateInput.completion_percentage,
        milestones: testCreateInput.milestones
      })
      .returning()
      .execute();

    const createdTracker = createResult[0];
    
    // Update the progress tracker
    const updateInput = {
      ...testUpdateInput,
      id: createdTracker.id
    };

    await updateProgressTracker(updateInput);

    // Verify database persistence
    const savedTrackers = await db.select()
      .from(progressTrackersTable)
      .where(eq(progressTrackersTable.id, createdTracker.id))
      .execute();

    expect(savedTrackers).toHaveLength(1);
    expect(savedTrackers[0].project_name).toEqual('Updated Project Name');
    expect(savedTrackers[0].current_phase).toEqual('Testing');
    expect(savedTrackers[0].completion_percentage).toEqual(75);
    expect(savedTrackers[0].milestones).toHaveLength(3);
    expect(savedTrackers[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle milestone updates correctly', async () => {
    // Create a progress tracker
    const createResult = await db.insert(progressTrackersTable)
      .values({
        project_name: testCreateInput.project_name,
        current_phase: testCreateInput.current_phase,
        completion_percentage: testCreateInput.completion_percentage,
        milestones: testCreateInput.milestones
      })
      .returning()
      .execute();

    const createdTracker = createResult[0];
    
    // Update with new milestones
    const newMilestones = [
      {
        name: 'Planning',
        completed: true,
        due_date: new Date('2024-01-01')
      },
      {
        name: 'Execution',
        completed: false,
        due_date: null
      }
    ];

    const result = await updateProgressTracker({
      id: createdTracker.id,
      milestones: newMilestones
    });

    expect(result).not.toBeNull();
    expect(result!.milestones).toHaveLength(2);
    expect(result!.milestones[0].name).toEqual('Planning');
    expect(result!.milestones[0].completed).toBe(true);
    expect(result!.milestones[1].name).toEqual('Execution');
    expect(result!.milestones[1].completed).toBe(false);
    expect(result!.milestones[1].due_date).toBeNull();
  });
});
