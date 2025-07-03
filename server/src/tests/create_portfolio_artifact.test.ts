
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { portfolioArtifactsTable } from '../db/schema';
import { type CreatePortfolioArtifactInput } from '../schema';
import { createPortfolioArtifact } from '../handlers/create_portfolio_artifact';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreatePortfolioArtifactInput = {
  title: 'AI-Powered Data Visualization',
  description: 'A 3D visualization tool for complex datasets using machine learning',
  category: 'ai_project',
  tags: ['ai', 'data-viz', 'machine-learning', 'three.js'],
  thumbnail_url: 'https://example.com/thumbnail.jpg',
  model_url: 'https://example.com/model.glb',
  demo_url: 'https://example.com/demo',
  github_url: 'https://github.com/corey/ai-viz',
  position_x: 2.5,
  position_y: 1.0,
  position_z: -3.2,
  rotation_x: 0.0,
  rotation_y: 45.0,
  rotation_z: 0.0,
  scale: 1.2,
  is_featured: true
};

describe('createPortfolioArtifact', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a portfolio artifact', async () => {
    const result = await createPortfolioArtifact(testInput);

    // Basic field validation
    expect(result.title).toEqual('AI-Powered Data Visualization');
    expect(result.description).toEqual(testInput.description);
    expect(result.category).toEqual('ai_project');
    expect(result.tags).toEqual(['ai', 'data-viz', 'machine-learning', 'three.js']);
    expect(result.thumbnail_url).toEqual('https://example.com/thumbnail.jpg');
    expect(result.model_url).toEqual('https://example.com/model.glb');
    expect(result.demo_url).toEqual('https://example.com/demo');
    expect(result.github_url).toEqual('https://github.com/corey/ai-viz');
    expect(result.is_featured).toBe(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should convert numeric fields correctly', async () => {
    const result = await createPortfolioArtifact(testInput);

    // Verify numeric conversions
    expect(typeof result.position_x).toBe('number');
    expect(typeof result.position_y).toBe('number');
    expect(typeof result.position_z).toBe('number');
    expect(typeof result.rotation_x).toBe('number');
    expect(typeof result.rotation_y).toBe('number');
    expect(typeof result.rotation_z).toBe('number');
    expect(typeof result.scale).toBe('number');

    // Verify numeric values
    expect(result.position_x).toEqual(2.5);
    expect(result.position_y).toEqual(1.0);
    expect(result.position_z).toEqual(-3.2);
    expect(result.rotation_x).toEqual(0.0);
    expect(result.rotation_y).toEqual(45.0);
    expect(result.rotation_z).toEqual(0.0);
    expect(result.scale).toEqual(1.2);
  });

  it('should save portfolio artifact to database', async () => {
    const result = await createPortfolioArtifact(testInput);

    // Query using proper drizzle syntax
    const artifacts = await db.select()
      .from(portfolioArtifactsTable)
      .where(eq(portfolioArtifactsTable.id, result.id))
      .execute();

    expect(artifacts).toHaveLength(1);
    const artifact = artifacts[0];
    expect(artifact.title).toEqual('AI-Powered Data Visualization');
    expect(artifact.description).toEqual(testInput.description);
    expect(artifact.category).toEqual('ai_project');
    expect(artifact.tags).toEqual(['ai', 'data-viz', 'machine-learning', 'three.js']);
    expect(artifact.is_featured).toBe(true);
    expect(artifact.created_at).toBeInstanceOf(Date);
    expect(artifact.updated_at).toBeInstanceOf(Date);

    // Verify numeric fields are stored correctly
    expect(parseFloat(artifact.position_x)).toEqual(2.5);
    expect(parseFloat(artifact.position_y)).toEqual(1.0);
    expect(parseFloat(artifact.position_z)).toEqual(-3.2);
    expect(parseFloat(artifact.rotation_x)).toEqual(0.0);
    expect(parseFloat(artifact.rotation_y)).toEqual(45.0);
    expect(parseFloat(artifact.rotation_z)).toEqual(0.0);
    expect(parseFloat(artifact.scale)).toEqual(1.2);
  });

  it('should handle nullable fields correctly', async () => {
    const inputWithNulls: CreatePortfolioArtifactInput = {
      ...testInput,
      thumbnail_url: null,
      model_url: null,
      demo_url: null,
      github_url: null
    };

    const result = await createPortfolioArtifact(inputWithNulls);

    expect(result.thumbnail_url).toBeNull();
    expect(result.model_url).toBeNull();
    expect(result.demo_url).toBeNull();
    expect(result.github_url).toBeNull();
  });

  it('should handle different categories', async () => {
    const categories = ['ai_project', 'data_engineering', 'visualization', 'research', 'collaboration'] as const;
    
    for (const category of categories) {
      const categoryInput: CreatePortfolioArtifactInput = {
        ...testInput,
        title: `Test ${category}`,
        category
      };

      const result = await createPortfolioArtifact(categoryInput);
      expect(result.category).toEqual(category);
    }
  });
});
