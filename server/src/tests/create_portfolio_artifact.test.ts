
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { portfolioArtifactsTable } from '../db/schema';
import { type CreatePortfolioArtifactInput } from '../schema';
import { createPortfolioArtifact } from '../handlers/create_portfolio_artifact';
import { eq } from 'drizzle-orm';

// Test input for a 3D gallery portfolio artifact
const testInput: CreatePortfolioArtifactInput = {
  title: 'AI-Powered Data Visualization',
  description: 'Interactive 3D visualization of complex datasets using machine learning algorithms',
  category: 'ai_project',
  tags: ['AI', 'Data Visualization', 'Machine Learning', '3D'],
  thumbnail_url: 'https://example.com/thumbnail.jpg',
  model_url: 'https://example.com/model.glb',
  demo_url: 'https://example.com/demo',
  github_url: 'https://github.com/corey/ai-viz',
  position_x: 10.5,
  position_y: 5.0,
  position_z: -2.75,
  rotation_x: 0.0,
  rotation_y: 45.0,
  rotation_z: 0.0,
  scale: 1.2,
  is_featured: true
};

describe('createPortfolioArtifact', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a portfolio artifact with all fields', async () => {
    const result = await createPortfolioArtifact(testInput);

    // Basic field validation
    expect(result.title).toEqual('AI-Powered Data Visualization');
    expect(result.description).toEqual(testInput.description);
    expect(result.category).toEqual('ai_project');
    expect(result.tags).toEqual(['AI', 'Data Visualization', 'Machine Learning', '3D']);
    expect(result.thumbnail_url).toEqual('https://example.com/thumbnail.jpg');
    expect(result.model_url).toEqual('https://example.com/model.glb');
    expect(result.demo_url).toEqual('https://example.com/demo');
    expect(result.github_url).toEqual('https://github.com/corey/ai-viz');
    expect(result.is_featured).toBe(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should correctly handle 3D positioning and rotation values', async () => {
    const result = await createPortfolioArtifact(testInput);

    // Verify numeric conversions for 3D positioning
    expect(typeof result.position_x).toBe('number');
    expect(typeof result.position_y).toBe('number');
    expect(typeof result.position_z).toBe('number');
    expect(typeof result.rotation_x).toBe('number');
    expect(typeof result.rotation_y).toBe('number');
    expect(typeof result.rotation_z).toBe('number');
    expect(typeof result.scale).toBe('number');

    // Verify exact values
    expect(result.position_x).toEqual(10.5);
    expect(result.position_y).toEqual(5.0);
    expect(result.position_z).toEqual(-2.75);
    expect(result.rotation_x).toEqual(0.0);
    expect(result.rotation_y).toEqual(45.0);
    expect(result.rotation_z).toEqual(0.0);
    expect(result.scale).toEqual(1.2);
  });

  it('should save portfolio artifact to database', async () => {
    const result = await createPortfolioArtifact(testInput);

    // Query database to verify storage
    const artifacts = await db.select()
      .from(portfolioArtifactsTable)
      .where(eq(portfolioArtifactsTable.id, result.id))
      .execute();

    expect(artifacts).toHaveLength(1);
    const artifact = artifacts[0];
    expect(artifact.title).toEqual('AI-Powered Data Visualization');
    expect(artifact.description).toEqual(testInput.description);
    expect(artifact.category).toEqual('ai_project');
    expect(artifact.tags).toEqual(['AI', 'Data Visualization', 'Machine Learning', '3D']);
    expect(artifact.is_featured).toBe(true);
    expect(artifact.created_at).toBeInstanceOf(Date);
    expect(artifact.updated_at).toBeInstanceOf(Date);

    // Verify numeric values are stored correctly
    expect(parseFloat(artifact.position_x)).toEqual(10.5);
    expect(parseFloat(artifact.position_y)).toEqual(5.0);
    expect(parseFloat(artifact.position_z)).toEqual(-2.75);
    expect(parseFloat(artifact.rotation_y)).toEqual(45.0);
    expect(parseFloat(artifact.scale)).toEqual(1.2);
  });

  it('should handle nullable fields correctly', async () => {
    const inputWithNulls: CreatePortfolioArtifactInput = {
      title: 'Minimal Project',
      description: 'A project with minimal metadata',
      category: 'research',
      tags: ['Research'],
      thumbnail_url: null,
      model_url: null,
      demo_url: null,
      github_url: null,
      position_x: 0.0,
      position_y: 0.0,
      position_z: 0.0,
      rotation_x: 0.0,
      rotation_y: 0.0,
      rotation_z: 0.0,
      scale: 1.0,
      is_featured: false
    };

    const result = await createPortfolioArtifact(inputWithNulls);

    expect(result.title).toEqual('Minimal Project');
    expect(result.thumbnail_url).toBeNull();
    expect(result.model_url).toBeNull();
    expect(result.demo_url).toBeNull();
    expect(result.github_url).toBeNull();
    expect(result.is_featured).toBe(false);
    expect(result.tags).toEqual(['Research']);
  });

  it('should handle different artifact categories', async () => {
    const categories = ['ai_project', 'data_engineering', 'visualization', 'research', 'collaboration'] as const;
    
    for (const category of categories) {
      const categoryInput: CreatePortfolioArtifactInput = {
        ...testInput,
        title: `${category} project`,
        category: category,
        position_x: Math.random() * 10, // Different positions for each
        position_y: Math.random() * 10,
        position_z: Math.random() * 10
      };

      const result = await createPortfolioArtifact(categoryInput);
      expect(result.category).toEqual(category);
      expect(result.title).toEqual(`${category} project`);
    }
  });
});
