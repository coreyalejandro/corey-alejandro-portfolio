
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { progressTrackersTable } from '../db/schema';
import { getProgressTrackers } from '../handlers/get_progress_trackers';

describe('getProgressTrackers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no trackers exist', async () => {
    const result = await getProgressTrackers();
    expect(result).toEqual([]);
  });

  it('should return all progress trackers', async () => {
    // Create test data
    const testMilestones = [
      { name: 'Design Phase', completed: true, due_date: new Date('2024-01-15') },
      { name: 'Development', completed: false, due_date: new Date('2024-02-15') }
    ];

    await db.insert(progressTrackersTable)
      .values([
        {
          project_name: 'AI Portfolio',
          current_phase: 'Development',
          completion_percentage: 75,
          milestones: testMilestones
        },
        {
          project_name: 'Data Visualization',
          current_phase: 'Testing',
          completion_percentage: 90,
          milestones: [
            { name: 'Research', completed: true, due_date: null },
            { name: 'Implementation', completed: true, due_date: new Date('2024-01-30') }
          ]
        }
      ])
      .execute();

    const result = await getProgressTrackers();

    expect(result).toHaveLength(2);
    
    // Check first tracker
    const firstTracker = result.find(t => t.project_name === 'AI Portfolio');
    expect(firstTracker).toBeDefined();
    expect(firstTracker!.current_phase).toEqual('Development');
    expect(firstTracker!.completion_percentage).toEqual(75);
    expect(firstTracker!.milestones).toHaveLength(2);
    expect(firstTracker!.milestones[0].name).toEqual('Design Phase');
    expect(firstTracker!.milestones[0].completed).toEqual(true);
    expect(firstTracker!.milestones[0].due_date).toBeInstanceOf(Date);
    expect(firstTracker!.milestones[1].completed).toEqual(false);
    expect(firstTracker!.milestones[1].due_date).toBeInstanceOf(Date);
    expect(firstTracker!.created_at).toBeInstanceOf(Date);
    expect(firstTracker!.updated_at).toBeInstanceOf(Date);

    // Check second tracker
    const secondTracker = result.find(t => t.project_name === 'Data Visualization');
    expect(secondTracker).toBeDefined();
    expect(secondTracker!.current_phase).toEqual('Testing');
    expect(secondTracker!.completion_percentage).toEqual(90);
    expect(secondTracker!.milestones).toHaveLength(2);
    expect(secondTracker!.milestones[0].due_date).toBeNull();
    expect(secondTracker!.milestones[1].due_date).toBeInstanceOf(Date);
  });

  it('should handle trackers with complex milestone structures', async () => {
    const complexMilestones = [
      { name: 'Phase 1', completed: true, due_date: new Date('2024-01-01') },
      { name: 'Phase 2', completed: false, due_date: null },
      { name: 'Phase 3', completed: false, due_date: new Date('2024-03-15') }
    ];

    await db.insert(progressTrackersTable)
      .values({
        project_name: 'Complex Project',
        current_phase: 'Phase 2',
        completion_percentage: 33,
        milestones: complexMilestones
      })
      .execute();

    const result = await getProgressTrackers();

    expect(result).toHaveLength(1);
    const tracker = result[0];
    expect(tracker.milestones).toHaveLength(3);
    expect(tracker.milestones[0].completed).toEqual(true);
    expect(tracker.milestones[0].due_date).toBeInstanceOf(Date);
    expect(tracker.milestones[1].completed).toEqual(false);
    expect(tracker.milestones[1].due_date).toBeNull();
    expect(tracker.milestones[2].due_date).toBeInstanceOf(Date);
  });
});
