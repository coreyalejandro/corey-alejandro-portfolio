
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { portfolioArtifactsTable } from '../db/schema';
import { getFeaturedArtifacts } from '../handlers/get_featured_artifacts';

describe('getFeaturedArtifacts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return only featured artifacts', async () => {
    // Create test data - featured artifact
    await db.insert(portfolioArtifactsTable).values({
      title: 'Featured AI Project',
      description: 'An amazing AI project',
      category: 'ai_project',
      tags: ['ai', 'featured'],
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
      tags: ['data'],
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
    expect(result[0].title).toBe('Featured AI Project');
    expect(result[0].is_featured).toBe(true);
    expect(result[0].category).toBe('ai_project');
  });

  it('should return empty array when no featured artifacts exist', async () => {
    // Create only non-featured artifacts
    await db.insert(portfolioArtifactsTable).values({
      title: 'Regular Project',
      description: 'A regular project',
      category: 'visualization',
      tags: ['vis'],
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

    expect(result).toHaveLength(0);
  });

  it('should correctly convert numeric fields to numbers', async () => {
    // Create featured artifact with specific numeric values
    await db.insert(portfolioArtifactsTable).values({
      title: 'Numeric Test Project',
      description: 'Testing numeric conversions',
      category: 'research',
      tags: ['test'],
      position_x: '12.345',
      position_y: '67.890',
      position_z: '0.123',
      rotation_x: '45.678',
      rotation_y: '90.111',
      rotation_z: '180.999',
      scale: '2.500',
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

    // Verify specific values
    expect(artifact.position_x).toBe(12.345);
    expect(artifact.position_y).toBe(67.890);
    expect(artifact.position_z).toBe(0.123);
    expect(artifact.rotation_x).toBe(45.678);
    expect(artifact.rotation_y).toBe(90.111);
    expect(artifact.rotation_z).toBe(180.999);
    expect(artifact.scale).toBe(2.500);
  });

  it('should handle tags as string array', async () => {
    // Create featured artifact with complex tags
    await db.insert(portfolioArtifactsTable).values({
      title: 'Tagged Project',
      description: 'Testing tag handling',
      category: 'collaboration',
      tags: ['react', 'typescript', 'threejs', 'portfolio'],
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
    const artifact = result[0];

    expect(Array.isArray(artifact.tags)).toBe(true);
    expect(artifact.tags).toEqual(['react', 'typescript', 'threejs', 'portfolio']);
  });
});
