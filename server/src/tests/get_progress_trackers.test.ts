
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { progressTrackersTable } from '../db/schema';
import { getProgressTrackers } from '../handlers/get_progress_trackers';
import { type CreateProgressTrackerInput } from '../schema';

const testTracker1: CreateProgressTrackerInput = {
  project_name: 'AI Portfolio Website',
  current_phase: 'Development',
  completion_percentage: 75,
  milestones: [
    { name: 'Design System', completed: true, due_date: null },
    { name: '3D Gallery', completed: false, due_date: new Date('2024-12-31') }
  ]
};

const testTracker2: CreateProgressTrackerInput = {
  project_name: 'Machine Learning Pipeline',
  current_phase: 'Testing',
  completion_percentage: 90,
  milestones: [
    { name: 'Data Collection', completed: true, due_date: null },
    { name: 'Model Training', completed: true, due_date: null },
    { name: 'Deployment', completed: false, due_date: new Date('2024-11-30') }
  ]
};

describe('getProgressTrackers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no trackers exist', async () => {
    const result = await getProgressTrackers();
    expect(result).toEqual([]);
  });

  it('should return all progress trackers', async () => {
    // Insert test trackers
    await db.insert(progressTrackersTable).values([
      {
        project_name: testTracker1.project_name,
        current_phase: testTracker1.current_phase,
        completion_percentage: testTracker1.completion_percentage,
        milestones: testTracker1.milestones
      },
      {
        project_name: testTracker2.project_name,
        current_phase: testTracker2.current_phase,
        completion_percentage: testTracker2.completion_percentage,
        milestones: testTracker2.milestones
      }
    ]).execute();

    const result = await getProgressTrackers();

    expect(result).toHaveLength(2);
    
    // Check first tracker
    const tracker1 = result.find(t => t.project_name === 'AI Portfolio Website');
    expect(tracker1).toBeDefined();
    expect(tracker1!.current_phase).toEqual('Development');
    expect(tracker1!.completion_percentage).toEqual(75);
    expect(tracker1!.milestones).toHaveLength(2);
    expect(tracker1!.milestones[0].name).toEqual('Design System');
    expect(tracker1!.milestones[0].completed).toBe(true);
    expect(tracker1!.milestones[0].due_date).toBeNull();
    expect(tracker1!.milestones[1].name).toEqual('3D Gallery');
    expect(tracker1!.milestones[1].completed).toBe(false);
    expect(tracker1!.milestones[1].due_date).toBeInstanceOf(Date);
    expect(tracker1!.id).toBeDefined();
    expect(tracker1!.created_at).toBeInstanceOf(Date);
    expect(tracker1!.updated_at).toBeInstanceOf(Date);

    // Check second tracker
    const tracker2 = result.find(t => t.project_name === 'Machine Learning Pipeline');
    expect(tracker2).toBeDefined();
    expect(tracker2!.current_phase).toEqual('Testing');
    expect(tracker2!.completion_percentage).toEqual(90);
    expect(tracker2!.milestones).toHaveLength(3);
    expect(tracker2!.milestones[2].name).toEqual('Deployment');
    expect(tracker2!.milestones[2].completed).toBe(false);
    expect(tracker2!.milestones[2].due_date).toBeInstanceOf(Date);
  });

  it('should handle milestone date objects correctly', async () => {
    const trackerWithDates: CreateProgressTrackerInput = {
      project_name: 'Test Project',
      current_phase: 'Planning',
      completion_percentage: 25,
      milestones: [
        { name: 'Research', completed: true, due_date: new Date('2024-01-15') },
        { name: 'Development', completed: false, due_date: new Date('2024-02-28') }
      ]
    };

    await db.insert(progressTrackersTable).values({
      project_name: trackerWithDates.project_name,
      current_phase: trackerWithDates.current_phase,
      completion_percentage: trackerWithDates.completion_percentage,
      milestones: trackerWithDates.milestones
    }).execute();

    const result = await getProgressTrackers();
    
    expect(result).toHaveLength(1);
    const tracker = result[0];
    expect(tracker.milestones[0].due_date).toBeInstanceOf(Date);
    expect(tracker.milestones[1].due_date).toBeInstanceOf(Date);
    expect(tracker.milestones[0].due_date!.getFullYear()).toEqual(2024);
    expect(tracker.milestones[1].due_date!.getMonth()).toEqual(1); // February is month 1
  });
});
