
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { portfolioArtifactsTable } from '../db/schema';
import { getPortfolioArtifacts } from '../handlers/get_portfolio_artifacts';

describe('getPortfolioArtifacts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no artifacts exist', async () => {
    const result = await getPortfolioArtifacts();
    expect(result).toEqual([]);
  });

  it('should return all portfolio artifacts', async () => {
    // Insert test artifacts
    await db.insert(portfolioArtifactsTable).values([
      {
        title: 'AI Project 1',
        description: 'First AI project',
        category: 'ai_project',
        tags: ['ai', 'machine-learning'],
        thumbnail_url: 'https://example.com/thumb1.jpg',
        model_url: 'https://example.com/model1.glb',
        demo_url: 'https://example.com/demo1',
        github_url: 'https://github.com/user/project1',
        position_x: '1.5',
        position_y: '2.0',
        position_z: '3.5',
        rotation_x: '0.0',
        rotation_y: '45.0',
        rotation_z: '0.0',
        scale: '1.0',
        is_featured: true
      },
      {
        title: 'Data Engineering Project',
        description: 'ETL pipeline project',
        category: 'data_engineering',
        tags: ['data', 'pipeline', 'etl'],
        thumbnail_url: null,
        model_url: null,
        demo_url: null,
        github_url: 'https://github.com/user/project2',
        position_x: '-2.0',
        position_y: '1.0',
        position_z: '0.0',
        rotation_x: '0.0',
        rotation_y: '0.0',
        rotation_z: '0.0',
        scale: '0.8',
        is_featured: false
      }
    ]).execute();

    const result = await getPortfolioArtifacts();

    expect(result).toHaveLength(2);
    
    // Check first artifact
    const firstArtifact = result.find(a => a.title === 'AI Project 1');
    expect(firstArtifact).toBeDefined();
    expect(firstArtifact!.description).toBe('First AI project');
    expect(firstArtifact!.category).toBe('ai_project');
    expect(firstArtifact!.tags).toEqual(['ai', 'machine-learning']);
    expect(firstArtifact!.thumbnail_url).toBe('https://example.com/thumb1.jpg');
    expect(firstArtifact!.model_url).toBe('https://example.com/model1.glb');
    expect(firstArtifact!.demo_url).toBe('https://example.com/demo1');
    expect(firstArtifact!.github_url).toBe('https://github.com/user/project1');
    expect(firstArtifact!.is_featured).toBe(true);
    expect(firstArtifact!.id).toBeDefined();
    expect(firstArtifact!.created_at).toBeInstanceOf(Date);
    expect(firstArtifact!.updated_at).toBeInstanceOf(Date);

    // Check second artifact
    const secondArtifact = result.find(a => a.title === 'Data Engineering Project');
    expect(secondArtifact).toBeDefined();
    expect(secondArtifact!.description).toBe('ETL pipeline project');
    expect(secondArtifact!.category).toBe('data_engineering');
    expect(secondArtifact!.tags).toEqual(['data', 'pipeline', 'etl']);
    expect(secondArtifact!.thumbnail_url).toBeNull();
    expect(secondArtifact!.model_url).toBeNull();
    expect(secondArtifact!.demo_url).toBeNull();
    expect(secondArtifact!.github_url).toBe('https://github.com/user/project2');
    expect(secondArtifact!.is_featured).toBe(false);
  });

  it('should correctly convert numeric fields to numbers', async () => {
    // Insert test artifact with specific numeric values
    await db.insert(portfolioArtifactsTable).values({
      title: 'Test Artifact',
      description: 'Test description',
      category: 'visualization',
      tags: ['test'],
      thumbnail_url: null,
      model_url: null,
      demo_url: null,
      github_url: null,
      position_x: '1.234',
      position_y: '-2.567',
      position_z: '3.890',
      rotation_x: '45.5',
      rotation_y: '90.0',
      rotation_z: '180.75',
      scale: '1.25',
      is_featured: false
    }).execute();

    const result = await getPortfolioArtifacts();

    expect(result).toHaveLength(1);
    const artifact = result[0];
    
    // Verify all numeric fields are converted to numbers
    expect(typeof artifact.position_x).toBe('number');
    expect(typeof artifact.position_y).toBe('number');
    expect(typeof artifact.position_z).toBe('number');
    expect(typeof artifact.rotation_x).toBe('number');
    expect(typeof artifact.rotation_y).toBe('number');
    expect(typeof artifact.rotation_z).toBe('number');
    expect(typeof artifact.scale).toBe('number');
    
    // Verify specific values
    expect(artifact.position_x).toBe(1.234);
    expect(artifact.position_y).toBe(-2.567);
    expect(artifact.position_z).toBe(3.890);
    expect(artifact.rotation_x).toBe(45.5);
    expect(artifact.rotation_y).toBe(90.0);
    expect(artifact.rotation_z).toBe(180.75);
    expect(artifact.scale).toBe(1.25);
  });

  it('should handle different categories correctly', async () => {
    // Insert artifacts with different categories
    await db.insert(portfolioArtifactsTable).values([
      {
        title: 'AI Project',
        description: 'AI description',
        category: 'ai_project',
        tags: ['ai'],
        thumbnail_url: null,
        model_url: null,
        demo_url: null,
        github_url: null,
        position_x: '0.0',
        position_y: '0.0',
        position_z: '0.0',
        rotation_x: '0.0',
        rotation_y: '0.0',
        rotation_z: '0.0',
        scale: '1.0',
        is_featured: false
      },
      {
        title: 'Research Project',
        description: 'Research description',
        category: 'research',
        tags: ['research'],
        thumbnail_url: null,
        model_url: null,
        demo_url: null,
        github_url: null,
        position_x: '0.0',
        position_y: '0.0',
        position_z: '0.0',
        rotation_x: '0.0',
        rotation_y: '0.0',
        rotation_z: '0.0',
        scale: '1.0',
        is_featured: false
      }
    ]).execute();

    const result = await getPortfolioArtifacts();

    expect(result).toHaveLength(2);
    
    const categories = result.map(a => a.category);
    expect(categories).toContain('ai_project');
    expect(categories).toContain('research');
  });
});
