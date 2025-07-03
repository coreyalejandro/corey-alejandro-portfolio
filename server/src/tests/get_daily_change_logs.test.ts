
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dailyChangeLogsTable } from '../db/schema';
import { getDailyChangeLogs } from '../handlers/get_daily_change_logs';

describe('getDailyChangeLogs', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no change logs exist', async () => {
    const result = await getDailyChangeLogs();
    expect(result).toEqual([]);
  });

  it('should return all change logs ordered by date descending', async () => {
    // Create test data
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    await db.insert(dailyChangeLogsTable).values([
      {
        date: twoDaysAgo,
        changes: [
          { type: 'feature', description: 'Added new feature', impact: 'high' },
          { type: 'bugfix', description: 'Fixed critical bug', impact: 'medium' }
        ]
      },
      {
        date: today,
        changes: [
          { type: 'improvement', description: 'Improved performance', impact: 'low' }
        ]
      },
      {
        date: yesterday,
        changes: [
          { type: 'content', description: 'Updated documentation', impact: 'medium' }
        ]
      }
    ]).execute();

    const result = await getDailyChangeLogs();

    expect(result).toHaveLength(3);
    
    // Verify ordering - most recent first
    expect(result[0].date.toDateString()).toEqual(today.toDateString());
    expect(result[1].date.toDateString()).toEqual(yesterday.toDateString());
    expect(result[2].date.toDateString()).toEqual(twoDaysAgo.toDateString());

    // Verify change data structure
    expect(result[0].changes).toHaveLength(1);
    expect(result[0].changes[0].type).toEqual('improvement');
    expect(result[0].changes[0].description).toEqual('Improved performance');
    expect(result[0].changes[0].impact).toEqual('low');

    expect(result[2].changes).toHaveLength(2);
    expect(result[2].changes[0].type).toEqual('feature');
    expect(result[2].changes[1].type).toEqual('bugfix');
  });

  it('should respect limit parameter', async () => {
    // Create test data
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }

    await db.insert(dailyChangeLogsTable).values(
      dates.map(date => ({
        date,
        changes: [
          { type: 'feature', description: `Feature on ${date.toDateString()}`, impact: 'low' }
        ]
      }))
    ).execute();

    const result = await getDailyChangeLogs(3);

    expect(result).toHaveLength(3);
    
    // Verify we got the 3 most recent entries
    expect(result[0].date.toDateString()).toEqual(dates[0].toDateString());
    expect(result[1].date.toDateString()).toEqual(dates[1].toDateString());
    expect(result[2].date.toDateString()).toEqual(dates[2].toDateString());
  });

  it('should handle change logs with different change types', async () => {
    const today = new Date();
    
    await db.insert(dailyChangeLogsTable).values({
      date: today,
      changes: [
        { type: 'feature', description: 'Added new feature', impact: 'high' },
        { type: 'bugfix', description: 'Fixed bug', impact: 'medium' },
        { type: 'improvement', description: 'Performance improvement', impact: 'low' },
        { type: 'content', description: 'Updated content', impact: 'medium' }
      ]
    }).execute();

    const result = await getDailyChangeLogs();

    expect(result).toHaveLength(1);
    expect(result[0].changes).toHaveLength(4);
    
    const changeTypes = result[0].changes.map(change => change.type);
    expect(changeTypes).toContain('feature');
    expect(changeTypes).toContain('bugfix');
    expect(changeTypes).toContain('improvement');
    expect(changeTypes).toContain('content');
  });

  it('should handle undefined limit parameter', async () => {
    const today = new Date();
    
    await db.insert(dailyChangeLogsTable).values({
      date: today,
      changes: [
        { type: 'feature', description: 'Test feature', impact: 'low' }
      ]
    }).execute();

    const result = await getDailyChangeLogs(undefined);

    expect(result).toHaveLength(1);
    expect(result[0].changes[0].description).toEqual('Test feature');
  });
});
