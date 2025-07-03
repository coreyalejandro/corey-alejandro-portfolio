
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { portfolioArtifactsTable } from '../db/schema';
import { getFeaturedArtifacts } from '../handlers/get_featured_artifacts';

describe('getFeaturedArtifacts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no featured artifacts exist', async () => {
    const result = await getFeaturedArtifacts();
    expect(result).toEqual([]);
  });

  it('should return only featured artifacts', async () => {
    // Create featured artifact
    await db.insert(portfolioArtifactsTable).values({
      title: 'Featured AI Project',
      description: 'A featured AI project for the portfolio',
      category: 'ai_project',
      tags: JSON.stringify(['ai', 'machine-learning']),
      position_x: '1.5',
      position_y: '2.0',
      position_z: '0.5',
      rotation_x: '0.0',
      rotation_y: '45.0',
      rotation_z: '0.0',
      scale: '1.2',
      is_featured: true
    });

    // Create non-featured artifact
    await db.insert(portfolioArtifactsTable).values({
      title: 'Regular Project',
      description: 'A regular project',
      category: 'data_engineering',
      tags: JSON.stringify(['data', 'pipeline']),
      position_x: '0.0',
      position_y: '0.0',
      position_z: '0.0',
      rotation_x: '0.0',
      rotation_y: '0.0',
      rotation_z: '0.0',
      scale: '1.0',
      is_featured: false
    });

    const result = await getFeaturedArtifacts();

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Featured AI Project');
    expect(result[0].is_featured).toBe(true);
    expect(result[0].category).toEqual('ai_project');
  });

  it('should properly convert numeric fields to numbers', async () => {
    await db.insert(portfolioArtifactsTable).values({
      title: 'Test Artifact',
      description: 'Testing numeric conversion',
      category: 'visualization',
      tags: JSON.stringify(['3d', 'visualization']),
      position_x: '1.234',
      position_y: '2.567',
      position_z: '3.890',
      rotation_x: '45.123',
      rotation_y: '90.456',
      rotation_z: '180.789',
      scale: '1.5',
      is_featured: true
    });

    const result = await getFeaturedArtifacts();

    expect(result).toHaveLength(1);
    const artifact = result[0];
    
    // Verify all numeric fields are properly converted
    expect(typeof artifact.position_x).toBe('number');
    expect(typeof artifact.position_y).toBe('number');
    expect(typeof artifact.position_z).toBe('number');
    expect(typeof artifact.rotation_x).toBe('number');
    expect(typeof artifact.rotation_y).toBe('number');
    expect(typeof artifact.rotation_z).toBe('number');
    expect(typeof artifact.scale).toBe('number');
    
    // Verify correct values
    expect(artifact.position_x).toEqual(1.234);
    expect(artifact.position_y).toEqual(2.567);
    expect(artifact.position_z).toEqual(3.890);
    expect(artifact.rotation_x).toEqual(45.123);
    expect(artifact.rotation_y).toEqual(90.456);
    expect(artifact.rotation_z).toEqual(180.789);
    expect(artifact.scale).toEqual(1.5);
  });

  it('should handle tags as string array', async () => {
    await db.insert(portfolioArtifactsTable).values({
      title: 'Tagged Project',
      description: 'Project with multiple tags',
      category: 'research',
      tags: JSON.stringify(['ai', 'research', 'innovation', 'portfolio']),
      position_x: '0.0',
      position_y: '0.0',
      position_z: '0.0',
      rotation_x: '0.0',
      rotation_y: '0.0',
      rotation_z: '0.0',
      scale: '1.0',
      is_featured: true
    });

    const result = await getFeaturedArtifacts();

    expect(result).toHaveLength(1);
    expect(Array.isArray(result[0].tags)).toBe(true);
    expect(result[0].tags).toEqual(['ai', 'research', 'innovation', 'portfolio']);
  });

  it('should return multiple featured artifacts', async () => {
    // Create multiple featured artifacts
    await db.insert(portfolioArtifactsTable).values([
      {
        title: 'Featured Project 1',
        description: 'First featured project',
        category: 'ai_project',
        tags: JSON.stringify(['ai']),
        position_x: '1.0',
        position_y: '1.0',
        position_z: '1.0',
        rotation_x: '0.0',
        rotation_y: '0.0',
        rotation_z: '0.0',
        scale: '1.0',
        is_featured: true
      },
      {
        title: 'Featured Project 2',
        description: 'Second featured project',
        category: 'data_engineering',
        tags: JSON.stringify(['data']),
        position_x: '2.0',
        position_y: '2.0',
        position_z: '2.0',
        rotation_x: '0.0',
        rotation_y: '0.0',
        rotation_z: '0.0',
        scale: '1.0',
        is_featured: true
      }
    ]);

    const result = await getFeaturedArtifacts();

    expect(result).toHaveLength(2);
    expect(result.every(artifact => artifact.is_featured)).toBe(true);
    
    const titles = result.map(artifact => artifact.title);
    expect(titles).toContain('Featured Project 1');
    expect(titles).toContain('Featured Project 2');
  });
});
