
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dailyChangeLogsTable } from '../db/schema';
import { type CreateDailyChangeLogInput } from '../schema';
import { createDailyChangeLog } from '../handlers/create_daily_change_log';
import { eq } from 'drizzle-orm';

// Test input with comprehensive change log data
const testInput: CreateDailyChangeLogInput = {
  date: new Date('2024-01-15'),
  changes: [
    {
      type: 'feature',
      description: 'Added 3D portfolio gallery with interactive artifacts',
      impact: 'high'
    },
    {
      type: 'improvement',
      description: 'Enhanced AI curator response accuracy',
      impact: 'medium'
    },
    {
      type: 'bugfix',
      description: 'Fixed collision detection in collaborative spaces',
      impact: 'low'
    }
  ]
};

describe('createDailyChangeLog', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a daily change log', async () => {
    const result = await createDailyChangeLog(testInput);

    // Basic field validation
    expect(result.date).toEqual(testInput.date);
    expect(result.changes).toHaveLength(3);
    expect(result.changes[0].type).toEqual('feature');
    expect(result.changes[0].description).toEqual('Added 3D portfolio gallery with interactive artifacts');
    expect(result.changes[0].impact).toEqual('high');
    expect(result.changes[1].type).toEqual('improvement');
    expect(result.changes[2].type).toEqual('bugfix');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save change log to database', async () => {
    const result = await createDailyChangeLog(testInput);

    // Query using proper drizzle syntax
    const changeLogs = await db.select()
      .from(dailyChangeLogsTable)
      .where(eq(dailyChangeLogsTable.id, result.id))
      .execute();

    expect(changeLogs).toHaveLength(1);
    expect(changeLogs[0].date).toEqual(testInput.date);
    expect(changeLogs[0].changes).toEqual(testInput.changes);
    expect(changeLogs[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle single change entry', async () => {
    const singleChangeInput: CreateDailyChangeLogInput = {
      date: new Date('2024-01-16'),
      changes: [
        {
          type: 'content',
          description: 'Updated portfolio project descriptions',
          impact: 'medium'
        }
      ]
    };

    const result = await createDailyChangeLog(singleChangeInput);

    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].type).toEqual('content');
    expect(result.changes[0].description).toEqual('Updated portfolio project descriptions');
    expect(result.changes[0].impact).toEqual('medium');
  });

  it('should handle multiple change types correctly', async () => {
    const multiTypeInput: CreateDailyChangeLogInput = {
      date: new Date('2024-01-17'),
      changes: [
        {
          type: 'feature',
          description: 'New collaborative meeting room',
          impact: 'high'
        },
        {
          type: 'bugfix',
          description: 'Fixed animation timing issues',
          impact: 'low'
        },
        {
          type: 'improvement',
          description: 'Optimized 3D model loading',
          impact: 'medium'
        },
        {
          type: 'content',
          description: 'Added new project case studies',
          impact: 'medium'
        }
      ]
    };

    const result = await createDailyChangeLog(multiTypeInput);

    expect(result.changes).toHaveLength(4);
    
    // Verify all change types are preserved
    const changeTypes = result.changes.map(change => change.type);
    expect(changeTypes).toContain('feature');
    expect(changeTypes).toContain('bugfix');
    expect(changeTypes).toContain('improvement');
    expect(changeTypes).toContain('content');

    // Verify impact levels are preserved
    const impactLevels = result.changes.map(change => change.impact);
    expect(impactLevels).toContain('high');
    expect(impactLevels).toContain('medium');
    expect(impactLevels).toContain('low');
  });
});
