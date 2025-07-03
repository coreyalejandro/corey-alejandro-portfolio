
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
    // Create test artifacts
    await db.insert(portfolioArtifactsTable).values([
      {
        title: 'AI Project 1',
        description: 'Machine learning model for data analysis',
        category: 'ai_project',
        tags: JSON.stringify(['machine-learning', 'python', 'tensorflow']),
        thumbnail_url: 'https://example.com/thumb1.jpg',
        model_url: 'https://example.com/model1.glb',
        demo_url: 'https://example.com/demo1',
        github_url: 'https://github.com/user/project1',
        position_x: '1.5',
        position_y: '2.0',
        position_z: '3.5',
        rotation_x: '0.0',
        rotation_y: '90.0',
        rotation_z: '0.0',
        scale: '1.0',
        is_featured: true
      },
      {
        title: 'Data Visualization',
        description: 'Interactive dashboard for business metrics',
        category: 'visualization',
        tags: JSON.stringify(['d3js', 'visualization', 'dashboard']),
        thumbnail_url: null,
        model_url: null,
        demo_url: 'https://example.com/demo2',
        github_url: null,
        position_x: '-2.0',
        position_y: '1.0',
        position_z: '0.0',
        rotation_x: '45.0',
        rotation_y: '0.0',
        rotation_z: '180.0',
        scale: '1.2',
        is_featured: false
      }
    ]).execute();

    const result = await getPortfolioArtifacts();

    expect(result).toHaveLength(2);
    
    // Check first artifact
    const aiProject = result.find(a => a.title === 'AI Project 1');
    expect(aiProject).toBeDefined();
    expect(aiProject!.description).toBe('Machine learning model for data analysis');
    expect(aiProject!.category).toBe('ai_project');
    expect(aiProject!.tags).toEqual(['machine-learning', 'python', 'tensorflow']);
    expect(aiProject!.thumbnail_url).toBe('https://example.com/thumb1.jpg');
    expect(aiProject!.model_url).toBe('https://example.com/model1.glb');
    expect(aiProject!.demo_url).toBe('https://example.com/demo1');
    expect(aiProject!.github_url).toBe('https://github.com/user/project1');
    expect(aiProject!.position_x).toBe(1.5);
    expect(aiProject!.position_y).toBe(2.0);
    expect(aiProject!.position_z).toBe(3.5);
    expect(aiProject!.rotation_x).toBe(0.0);
    expect(aiProject!.rotation_y).toBe(90.0);
    expect(aiProject!.rotation_z).toBe(0.0);
    expect(aiProject!.scale).toBe(1.0);
    expect(aiProject!.is_featured).toBe(true);
    expect(aiProject!.created_at).toBeInstanceOf(Date);
    expect(aiProject!.updated_at).toBeInstanceOf(Date);

    // Check second artifact
    const visualization = result.find(a => a.title === 'Data Visualization');
    expect(visualization).toBeDefined();
    expect(visualization!.description).toBe('Interactive dashboard for business metrics');
    expect(visualization!.category).toBe('visualization');
    expect(visualization!.tags).toEqual(['d3js', 'visualization', 'dashboard']);
    expect(visualization!.thumbnail_url).toBe(null);
    expect(visualization!.model_url).toBe(null);
    expect(visualization!.demo_url).toBe('https://example.com/demo2');
    expect(visualization!.github_url).toBe(null);
    expect(visualization!.position_x).toBe(-2.0);
    expect(visualization!.position_y).toBe(1.0);
    expect(visualization!.position_z).toBe(0.0);
    expect(visualization!.rotation_x).toBe(45.0);
    expect(visualization!.rotation_y).toBe(0.0);
    expect(visualization!.rotation_z).toBe(180.0);
    expect(visualization!.scale).toBe(1.2);
    expect(visualization!.is_featured).toBe(false);
  });

  it('should handle numeric field conversions correctly', async () => {
    // Create artifact with precise numeric values
    await db.insert(portfolioArtifactsTable).values({
      title: 'Precision Test',
      description: 'Testing numeric precision',
      category: 'research',
      tags: JSON.stringify(['test']),
      thumbnail_url: null,
      model_url: null,
      demo_url: null,
      github_url: null,
      position_x: '1.234',
      position_y: '5.678',
      position_z: '9.012',
      rotation_x: '15.5',
      rotation_y: '30.75',
      rotation_z: '45.25',
      scale: '2.5',
      is_featured: false
    }).execute();

    const result = await getPortfolioArtifacts();

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
    
    // Verify precise values
    expect(artifact.position_x).toBe(1.234);
    expect(artifact.position_y).toBe(5.678);
    expect(artifact.position_z).toBe(9.012);
    expect(artifact.rotation_x).toBe(15.5);
    expect(artifact.rotation_y).toBe(30.75);
    expect(artifact.rotation_z).toBe(45.25);
    expect(artifact.scale).toBe(2.5);
  });
});
