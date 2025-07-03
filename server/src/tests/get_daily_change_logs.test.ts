
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
    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

    await db.insert(dailyChangeLogsTable).values([
      {
        date: dayBeforeYesterday,
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
          { type: 'content', description: 'Updated portfolio content', impact: 'medium' }
        ]
      }
    ]).execute();

    const result = await getDailyChangeLogs();

    expect(result).toHaveLength(3);
    // Should be ordered by date descending (most recent first)
    expect(result[0].date.getTime()).toBeGreaterThan(result[1].date.getTime());
    expect(result[1].date.getTime()).toBeGreaterThan(result[2].date.getTime());
    
    // Verify data structure
    expect(result[0].changes).toHaveLength(1);
    expect(result[0].changes[0].type).toBe('improvement');
    expect(result[0].changes[0].description).toBe('Improved performance');
    expect(result[0].changes[0].impact).toBe('low');
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
      dates.map((date, index) => ({
        date,
        changes: [
          { type: 'feature', description: `Feature ${index}`, impact: 'medium' }
        ]
      }))
    ).execute();

    const result = await getDailyChangeLogs(3);

    expect(result).toHaveLength(3);
    // Should still be ordered by date descending
    expect(result[0].date.getTime()).toBeGreaterThan(result[1].date.getTime());
    expect(result[1].date.getTime()).toBeGreaterThan(result[2].date.getTime());
  });

  it('should handle complex change log structures', async () => {
    const today = new Date();
    
    await db.insert(dailyChangeLogsTable).values({
      date: today,
      changes: [
        { type: 'feature', description: 'Added 3D gallery navigation', impact: 'high' },
        { type: 'bugfix', description: 'Fixed artifact positioning', impact: 'medium' },
        { type: 'improvement', description: 'Optimized rendering performance', impact: 'low' },
        { type: 'content', description: 'Updated project descriptions', impact: 'medium' }
      ]
    }).execute();

    const result = await getDailyChangeLogs();

    expect(result).toHaveLength(1);
    expect(result[0].changes).toHaveLength(4);
    
    // Verify all change types are present
    const changeTypes = result[0].changes.map(change => change.type);
    expect(changeTypes).toContain('feature');
    expect(changeTypes).toContain('bugfix');
    expect(changeTypes).toContain('improvement');
    expect(changeTypes).toContain('content');
    
    // Verify impact levels
    const impactLevels = result[0].changes.map(change => change.impact);
    expect(impactLevels).toContain('high');
    expect(impactLevels).toContain('medium');
    expect(impactLevels).toContain('low');
  });

  it('should handle date and timestamp fields correctly', async () => {
    const specificDate = new Date('2024-01-15T10:30:00Z');
    
    await db.insert(dailyChangeLogsTable).values({
      date: specificDate,
      changes: [
        { type: 'feature', description: 'Test feature', impact: 'medium' }
      ]
    }).execute();

    const result = await getDailyChangeLogs();

    expect(result).toHaveLength(1);
    expect(result[0].date).toBeInstanceOf(Date);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].id).toBeDefined();
    expect(typeof result[0].id).toBe('number');
  });
});
