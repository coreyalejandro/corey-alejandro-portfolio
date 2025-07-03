
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { progressTrackersTable } from '../db/schema';
import { type CreateProgressTrackerInput } from '../schema';
import { createProgressTracker } from '../handlers/create_progress_tracker';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateProgressTrackerInput = {
  project_name: 'VR Portfolio Project',
  current_phase: 'Development',
  completion_percentage: 75,
  milestones: [
    {
      name: 'Project Setup',
      completed: true,
      due_date: new Date('2024-01-15')
    },
    {
      name: '3D Gallery Implementation',
      completed: true,
      due_date: new Date('2024-02-01')
    },
    {
      name: 'AI Curator Integration',
      completed: false,
      due_date: new Date('2024-02-15')
    }
  ]
};

describe('createProgressTracker', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a progress tracker', async () => {
    const result = await createProgressTracker(testInput);

    // Basic field validation
    expect(result.project_name).toEqual('VR Portfolio Project');
    expect(result.current_phase).toEqual('Development');
    expect(result.completion_percentage).toEqual(75);
    expect(result.milestones).toHaveLength(3);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Validate milestone structure
    const firstMilestone = result.milestones[0];
    expect(firstMilestone.name).toEqual('Project Setup');
    expect(firstMilestone.completed).toBe(true);
    expect(firstMilestone.due_date).toBeInstanceOf(Date);
  });

  it('should save progress tracker to database', async () => {
    const result = await createProgressTracker(testInput);

    // Query using proper drizzle syntax
    const progressTrackers = await db.select()
      .from(progressTrackersTable)
      .where(eq(progressTrackersTable.id, result.id))
      .execute();

    expect(progressTrackers).toHaveLength(1);
    const saved = progressTrackers[0];
    expect(saved.project_name).toEqual('VR Portfolio Project');
    expect(saved.current_phase).toEqual('Development');
    expect(saved.completion_percentage).toEqual(75);
    expect(saved.created_at).toBeInstanceOf(Date);
    expect(saved.updated_at).toBeInstanceOf(Date);

    // Validate jsonb milestones data
    const milestones = saved.milestones as any[];
    expect(milestones).toHaveLength(3);
    expect(milestones[0].name).toEqual('Project Setup');
    expect(milestones[0].completed).toBe(true);
    expect(milestones[1].name).toEqual('3D Gallery Implementation');
    expect(milestones[2].completed).toBe(false);
  });

  it('should handle milestones with null due dates', async () => {
    const inputWithNullDates: CreateProgressTrackerInput = {
      project_name: 'Test Project',
      current_phase: 'Planning',
      completion_percentage: 25,
      milestones: [
        {
          name: 'Research Phase',
          completed: true,
          due_date: null
        },
        {
          name: 'Design Phase',
          completed: false,
          due_date: new Date('2024-03-01')
        }
      ]
    };

    const result = await createProgressTracker(inputWithNullDates);

    expect(result.milestones).toHaveLength(2);
    expect(result.milestones[0].due_date).toBeNull();
    expect(result.milestones[1].due_date).toBeInstanceOf(Date);
  });

  it('should handle edge case completion percentages', async () => {
    const minInput: CreateProgressTrackerInput = {
      project_name: 'New Project',
      current_phase: 'Initiation',
      completion_percentage: 0,
      milestones: []
    };

    const maxInput: CreateProgressTrackerInput = {
      project_name: 'Completed Project',
      current_phase: 'Delivered',
      completion_percentage: 100,
      milestones: [
        {
          name: 'Final Delivery',
          completed: true,
          due_date: new Date('2024-01-01')
        }
      ]
    };

    const minResult = await createProgressTracker(minInput);
    const maxResult = await createProgressTracker(maxInput);

    expect(minResult.completion_percentage).toEqual(0);
    expect(minResult.milestones).toHaveLength(0);
    expect(maxResult.completion_percentage).toEqual(100);
    expect(maxResult.milestones).toHaveLength(1);
  });
});
