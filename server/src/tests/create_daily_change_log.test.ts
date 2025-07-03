
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dailyChangeLogsTable } from '../db/schema';
import { type CreateDailyChangeLogInput } from '../schema';
import { createDailyChangeLog } from '../handlers/create_daily_change_log';
import { eq } from 'drizzle-orm';

// Test input with multiple change types
const testInput: CreateDailyChangeLogInput = {
  date: new Date('2024-01-15'),
  changes: [
    {
      type: 'feature',
      description: 'Added 3D portfolio gallery navigation',
      impact: 'high'
    },
    {
      type: 'bugfix',
      description: 'Fixed AI curator response timing',
      impact: 'medium'
    },
    {
      type: 'improvement',
      description: 'Optimized model loading performance',
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
    expect(result.changes).toEqual(testInput.changes);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify changes array structure
    expect(result.changes).toHaveLength(3);
    expect(result.changes[0].type).toEqual('feature');
    expect(result.changes[0].description).toEqual('Added 3D portfolio gallery navigation');
    expect(result.changes[0].impact).toEqual('high');
    expect(result.changes[1].type).toEqual('bugfix');
    expect(result.changes[2].type).toEqual('improvement');
  });

  it('should save daily change log to database', async () => {
    const result = await createDailyChangeLog(testInput);

    // Query database to verify storage
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

  it('should handle different change types and impact levels', async () => {
    const diverseChangesInput: CreateDailyChangeLogInput = {
      date: new Date('2024-01-17'),
      changes: [
        {
          type: 'feature',
          description: 'Implemented voice interaction with AI curator',
          impact: 'high'
        },
        {
          type: 'improvement',
          description: 'Enhanced collaborative space UX',
          impact: 'medium'
        },
        {
          type: 'bugfix',
          description: 'Fixed progress tracker percentage calculation',
          impact: 'low'
        }
      ]
    };

    const result = await createDailyChangeLog(diverseChangesInput);

    // Verify all enum values are handled correctly
    const changeTypes = result.changes.map(c => c.type);
    const impactLevels = result.changes.map(c => c.impact);

    expect(changeTypes).toContain('feature');
    expect(changeTypes).toContain('improvement');
    expect(changeTypes).toContain('bugfix');
    expect(impactLevels).toContain('high');
    expect(impactLevels).toContain('medium');
    expect(impactLevels).toContain('low');
  });
});
