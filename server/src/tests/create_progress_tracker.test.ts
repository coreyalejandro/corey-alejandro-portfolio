
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { progressTrackersTable } from '../db/schema';
import { type CreateProgressTrackerInput } from '../schema';
import { createProgressTracker } from '../handlers/create_progress_tracker';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateProgressTrackerInput = {
  project_name: 'AI Portfolio Platform',
  current_phase: 'Development',
  completion_percentage: 75,
  milestones: [
    {
      name: 'Database Schema Complete',
      completed: true,
      due_date: null
    },
    {
      name: 'API Implementation',
      completed: false,
      due_date: new Date('2024-01-15')
    },
    {
      name: '3D Gallery Setup',
      completed: false,
      due_date: new Date('2024-01-30')
    }
  ]
};

describe('createProgressTracker', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a progress tracker', async () => {
    const result = await createProgressTracker(testInput);

    // Basic field validation
    expect(result.project_name).toEqual('AI Portfolio Platform');
    expect(result.current_phase).toEqual('Development');
    expect(result.completion_percentage).toEqual(75);
    expect(result.milestones).toHaveLength(3);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Validate milestone structure
    expect(result.milestones[0].name).toEqual('Database Schema Complete');
    expect(result.milestones[0].completed).toBe(true);
    expect(result.milestones[0].due_date).toBeNull();
    expect(result.milestones[1].name).toEqual('API Implementation');
    expect(result.milestones[1].completed).toBe(false);
    expect(result.milestones[1].due_date).toBeInstanceOf(Date);
  });

  it('should save progress tracker to database', async () => {
    const result = await createProgressTracker(testInput);

    // Query database to verify insertion
    const progressTrackers = await db.select()
      .from(progressTrackersTable)
      .where(eq(progressTrackersTable.id, result.id))
      .execute();

    expect(progressTrackers).toHaveLength(1);
    expect(progressTrackers[0].project_name).toEqual('AI Portfolio Platform');
    expect(progressTrackers[0].current_phase).toEqual('Development');
    expect(progressTrackers[0].completion_percentage).toEqual(75);
    expect(progressTrackers[0].created_at).toBeInstanceOf(Date);
    expect(progressTrackers[0].updated_at).toBeInstanceOf(Date);

    // Validate stored milestones JSON structure
    const storedMilestones = progressTrackers[0].milestones as any[];
    expect(storedMilestones).toHaveLength(3);
    expect(storedMilestones[0].name).toEqual('Database Schema Complete');
    expect(storedMilestones[0].completed).toBe(true);
    expect(storedMilestones[1].name).toEqual('API Implementation');
    expect(storedMilestones[1].completed).toBe(false);
  });

  it('should handle empty milestones array', async () => {
    const inputWithEmptyMilestones: CreateProgressTrackerInput = {
      project_name: 'Simple Project',
      current_phase: 'Planning',
      completion_percentage: 0,
      milestones: []
    };

    const result = await createProgressTracker(inputWithEmptyMilestones);

    expect(result.milestones).toHaveLength(0);
    expect(result.project_name).toEqual('Simple Project');
    expect(result.completion_percentage).toEqual(0);
  });

  it('should handle milestones with null due dates', async () => {
    const inputWithNullDates: CreateProgressTrackerInput = {
      project_name: 'Research Project',
      current_phase: 'Analysis',
      completion_percentage: 25,
      milestones: [
        {
          name: 'Literature Review',
          completed: true,
          due_date: null
        },
        {
          name: 'Data Collection',
          completed: false,
          due_date: null
        }
      ]
    };

    const result = await createProgressTracker(inputWithNullDates);

    expect(result.milestones).toHaveLength(2);
    expect(result.milestones[0].due_date).toBeNull();
    expect(result.milestones[1].due_date).toBeNull();
  });
});
