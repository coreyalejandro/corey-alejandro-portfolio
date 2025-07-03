
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { portfolioArtifactsTable } from '../db/schema';
import { type CreatePortfolioArtifactInput, type UpdatePortfolioArtifactInput } from '../schema';
import { updatePortfolioArtifact } from '../handlers/update_portfolio_artifact';
import { eq } from 'drizzle-orm';

// Helper function to create a portfolio artifact for testing
const createTestArtifact = async (): Promise<number> => {
  const testData: CreatePortfolioArtifactInput = {
    title: 'Test Artifact',
    description: 'A test portfolio artifact',
    category: 'ai_project',
    tags: ['test', 'portfolio'],
    thumbnail_url: 'https://example.com/thumb.jpg',
    model_url: 'https://example.com/model.glb',
    demo_url: 'https://example.com/demo',
    github_url: 'https://github.com/test/repo',
    position_x: 1.0,
    position_y: 2.0,
    position_z: 3.0,
    rotation_x: 0.0,
    rotation_y: 90.0,
    rotation_z: 0.0,
    scale: 1.5,
    is_featured: false
  };

  const result = await db.insert(portfolioArtifactsTable)
    .values({
      ...testData,
      position_x: testData.position_x.toString(),
      position_y: testData.position_y.toString(),
      position_z: testData.position_z.toString(),
      rotation_x: testData.rotation_x.toString(),
      rotation_y: testData.rotation_y.toString(),
      rotation_z: testData.rotation_z.toString(),
      scale: testData.scale.toString(),
      tags: testData.tags
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('updatePortfolioArtifact', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update basic text fields', async () => {
    const artifactId = await createTestArtifact();
    
    const updateInput: UpdatePortfolioArtifactInput = {
      id: artifactId,
      title: 'Updated Title',
      description: 'Updated description',
      category: 'visualization'
    };

    const result = await updatePortfolioArtifact(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(artifactId);
    expect(result!.title).toBe('Updated Title');
    expect(result!.description).toBe('Updated description');
    expect(result!.category).toBe('visualization');
  });

  it('should update 3D position and rotation fields', async () => {
    const artifactId = await createTestArtifact();
    
    const updateInput: UpdatePortfolioArtifactInput = {
      id: artifactId,
      position_x: 10.5,
      position_y: 20.7,
      position_z: 30.9,
      rotation_x: 45.0,
      rotation_y: 180.0,
      rotation_z: 270.0,
      scale: 2.0
    };

    const result = await updatePortfolioArtifact(updateInput);

    expect(result).not.toBeNull();
    expect(result!.position_x).toBe(10.5);
    expect(result!.position_y).toBe(20.7);
    expect(result!.position_z).toBe(30.9);
    expect(result!.rotation_x).toBe(45.0);
    expect(result!.rotation_y).toBe(180.0);
    expect(result!.rotation_z).toBe(270.0);
    expect(result!.scale).toBe(2.0);
    
    // Verify numeric types
    expect(typeof result!.position_x).toBe('number');
    expect(typeof result!.position_y).toBe('number');
    expect(typeof result!.position_z).toBe('number');
    expect(typeof result!.rotation_x).toBe('number');
    expect(typeof result!.rotation_y).toBe('number');
    expect(typeof result!.rotation_z).toBe('number');
    expect(typeof result!.scale).toBe('number');
  });

  it('should update tags and URLs', async () => {
    const artifactId = await createTestArtifact();
    
    const updateInput: UpdatePortfolioArtifactInput = {
      id: artifactId,
      tags: ['updated', 'tags', 'array'],
      thumbnail_url: 'https://updated.com/thumb.jpg',
      model_url: 'https://updated.com/model.glb',
      demo_url: 'https://updated.com/demo',
      github_url: 'https://github.com/updated/repo'
    };

    const result = await updatePortfolioArtifact(updateInput);

    expect(result).not.toBeNull();
    expect(result!.tags).toEqual(['updated', 'tags', 'array']);
    expect(result!.thumbnail_url).toBe('https://updated.com/thumb.jpg');
    expect(result!.model_url).toBe('https://updated.com/model.glb');
    expect(result!.demo_url).toBe('https://updated.com/demo');
    expect(result!.github_url).toBe('https://github.com/updated/repo');
  });

  it('should update featured status', async () => {
    const artifactId = await createTestArtifact();
    
    const updateInput: UpdatePortfolioArtifactInput = {
      id: artifactId,
      is_featured: true
    };

    const result = await updatePortfolioArtifact(updateInput);

    expect(result).not.toBeNull();
    expect(result!.is_featured).toBe(true);
  });

  it('should update nullable fields to null', async () => {
    const artifactId = await createTestArtifact();
    
    const updateInput: UpdatePortfolioArtifactInput = {
      id: artifactId,
      thumbnail_url: null,
      model_url: null,
      demo_url: null,
      github_url: null
    };

    const result = await updatePortfolioArtifact(updateInput);

    expect(result).not.toBeNull();
    expect(result!.thumbnail_url).toBeNull();
    expect(result!.model_url).toBeNull();
    expect(result!.demo_url).toBeNull();
    expect(result!.github_url).toBeNull();
  });

  it('should persist changes to database', async () => {
    const artifactId = await createTestArtifact();
    
    const updateInput: UpdatePortfolioArtifactInput = {
      id: artifactId,
      title: 'Persisted Title',
      position_x: 99.9,
      is_featured: true
    };

    await updatePortfolioArtifact(updateInput);

    // Verify changes were saved to database
    const artifacts = await db.select()
      .from(portfolioArtifactsTable)
      .where(eq(portfolioArtifactsTable.id, artifactId))
      .execute();

    expect(artifacts).toHaveLength(1);
    expect(artifacts[0].title).toBe('Persisted Title');
    expect(parseFloat(artifacts[0].position_x)).toBe(99.9);
    expect(artifacts[0].is_featured).toBe(true);
  });

  it('should return null when artifact does not exist', async () => {
    const updateInput: UpdatePortfolioArtifactInput = {
      id: 999999, // Non-existent ID
      title: 'Updated Title'
    };

    const result = await updatePortfolioArtifact(updateInput);

    expect(result).toBeNull();
  });

  it('should return null when no fields are provided to update', async () => {
    const artifactId = await createTestArtifact();
    
    const updateInput: UpdatePortfolioArtifactInput = {
      id: artifactId
      // No fields to update
    };

    const result = await updatePortfolioArtifact(updateInput);

    expect(result).toBeNull();
  });

  it('should update updated_at timestamp', async () => {
    const artifactId = await createTestArtifact();
    
    // Get original timestamp
    const originalArtifact = await db.select()
      .from(portfolioArtifactsTable)
      .where(eq(portfolioArtifactsTable.id, artifactId))
      .execute();
    
    const originalTimestamp = originalArtifact[0].updated_at;
    
    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const updateInput: UpdatePortfolioArtifactInput = {
      id: artifactId,
      title: 'Updated Title'
    };

    const result = await updatePortfolioArtifact(updateInput);

    expect(result).not.toBeNull();
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalTimestamp.getTime());
  });
});
