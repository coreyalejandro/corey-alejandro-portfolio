
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { portfolioArtifactsTable } from '../db/schema';
import { type CreatePortfolioArtifactInput, type UpdatePortfolioArtifactInput } from '../schema';
import { updatePortfolioArtifact } from '../handlers/update_portfolio_artifact';
import { eq } from 'drizzle-orm';

// Helper function to create a test artifact
const createTestArtifact = async () => {
  const testInput: CreatePortfolioArtifactInput = {
    title: 'Test Artifact',
    description: 'A test artifact',
    category: 'ai_project',
    tags: ['test', 'artifact'],
    thumbnail_url: 'https://example.com/thumb.jpg',
    model_url: 'https://example.com/model.gltf',
    demo_url: 'https://example.com/demo',
    github_url: 'https://github.com/test/repo',
    position_x: 0,
    position_y: 0,
    position_z: 0,
    rotation_x: 0,
    rotation_y: 0,
    rotation_z: 0,
    scale: 1,
    is_featured: false
  };

  const result = await db.insert(portfolioArtifactsTable)
    .values({
      ...testInput,
      position_x: testInput.position_x.toString(),
      position_y: testInput.position_y.toString(),
      position_z: testInput.position_z.toString(),
      rotation_x: testInput.rotation_x.toString(),
      rotation_y: testInput.rotation_y.toString(),
      rotation_z: testInput.rotation_z.toString(),
      scale: testInput.scale.toString()
    })
    .returning()
    .execute();

  return result[0];
};

describe('updatePortfolioArtifact', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a portfolio artifact', async () => {
    const artifact = await createTestArtifact();
    
    const updateInput: UpdatePortfolioArtifactInput = {
      id: artifact.id,
      title: 'Updated Test Artifact',
      description: 'Updated description',
      category: 'data_engineering',
      tags: ['updated', 'test'],
      position_x: 10,
      position_y: 20,
      position_z: 30,
      rotation_x: 45,
      rotation_y: 90,
      rotation_z: 135,
      scale: 2.5,
      is_featured: true
    };

    const result = await updatePortfolioArtifact(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(artifact.id);
    expect(result!.title).toEqual('Updated Test Artifact');
    expect(result!.description).toEqual('Updated description');
    expect(result!.category).toEqual('data_engineering');
    expect(result!.tags).toEqual(['updated', 'test']);
    expect(result!.position_x).toEqual(10);
    expect(result!.position_y).toEqual(20);
    expect(result!.position_z).toEqual(30);
    expect(result!.rotation_x).toEqual(45);
    expect(result!.rotation_y).toEqual(90);
    expect(result!.rotation_z).toEqual(135);
    expect(result!.scale).toEqual(2.5);
    expect(result!.is_featured).toEqual(true);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    const artifact = await createTestArtifact();
    
    const updateInput: UpdatePortfolioArtifactInput = {
      id: artifact.id,
      title: 'Partially Updated Artifact',
      position_x: 100,
      is_featured: true
    };

    const result = await updatePortfolioArtifact(updateInput);

    expect(result).toBeDefined();
    expect(result!.title).toEqual('Partially Updated Artifact');
    expect(result!.position_x).toEqual(100);
    expect(result!.is_featured).toEqual(true);
    // Other fields should remain unchanged
    expect(result!.description).toEqual('A test artifact');
    expect(result!.category).toEqual('ai_project');
    expect(result!.position_y).toEqual(0);
    expect(result!.position_z).toEqual(0);
    expect(result!.scale).toEqual(1);
  });

  it('should handle null values for optional fields', async () => {
    const artifact = await createTestArtifact();
    
    const updateInput: UpdatePortfolioArtifactInput = {
      id: artifact.id,
      thumbnail_url: null,
      model_url: null,
      demo_url: null,
      github_url: null
    };

    const result = await updatePortfolioArtifact(updateInput);

    expect(result).toBeDefined();
    expect(result!.thumbnail_url).toBeNull();
    expect(result!.model_url).toBeNull();
    expect(result!.demo_url).toBeNull();
    expect(result!.github_url).toBeNull();
  });

  it('should save changes to database', async () => {
    const artifact = await createTestArtifact();
    
    const updateInput: UpdatePortfolioArtifactInput = {
      id: artifact.id,
      title: 'Database Updated Artifact',
      position_x: 50,
      scale: 3
    };

    await updatePortfolioArtifact(updateInput);

    const savedArtifact = await db.select()
      .from(portfolioArtifactsTable)
      .where(eq(portfolioArtifactsTable.id, artifact.id))
      .execute();

    expect(savedArtifact).toHaveLength(1);
    expect(savedArtifact[0].title).toEqual('Database Updated Artifact');
    expect(parseFloat(savedArtifact[0].position_x)).toEqual(50);
    expect(parseFloat(savedArtifact[0].scale)).toEqual(3);
  });

  it('should return null for non-existent artifact', async () => {
    const updateInput: UpdatePortfolioArtifactInput = {
      id: 999,
      title: 'Non-existent Artifact'
    };

    const result = await updatePortfolioArtifact(updateInput);

    expect(result).toBeNull();
  });

  it('should handle 3D positioning updates correctly', async () => {
    const artifact = await createTestArtifact();
    
    const updateInput: UpdatePortfolioArtifactInput = {
      id: artifact.id,
      position_x: -5.5,
      position_y: 12.75,
      position_z: -8.25,
      rotation_x: 180,
      rotation_y: -90,
      rotation_z: 270,
      scale: 0.75
    };

    const result = await updatePortfolioArtifact(updateInput);

    expect(result).toBeDefined();
    expect(typeof result!.position_x).toBe('number');
    expect(typeof result!.position_y).toBe('number');
    expect(typeof result!.position_z).toBe('number');
    expect(typeof result!.rotation_x).toBe('number');
    expect(typeof result!.rotation_y).toBe('number');
    expect(typeof result!.rotation_z).toBe('number');
    expect(typeof result!.scale).toBe('number');
    expect(result!.position_x).toEqual(-5.5);
    expect(result!.position_y).toEqual(12.75);
    expect(result!.position_z).toEqual(-8.25);
    expect(result!.rotation_x).toEqual(180);
    expect(result!.rotation_y).toEqual(-90);
    expect(result!.rotation_z).toEqual(270);
    expect(result!.scale).toEqual(0.75);
  });
});
