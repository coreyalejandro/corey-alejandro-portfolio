
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { aiCuratorInteractionsTable, portfolioArtifactsTable } from '../db/schema';
import { type CreateAiCuratorInteractionInput } from '../schema';
import { createAiCuratorInteraction } from '../handlers/create_ai_curator_interaction';
import { eq } from 'drizzle-orm';

// Test input for basic interaction
const testInput: CreateAiCuratorInteractionInput = {
  session_id: 'test-session-123',
  user_input: 'Tell me about this project',
  interaction_type: 'text',
  context_artifact_id: null
};

describe('createAiCuratorInteraction', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an AI curator interaction', async () => {
    const result = await createAiCuratorInteraction(testInput);

    // Basic field validation
    expect(result.session_id).toEqual('test-session-123');
    expect(result.user_input).toEqual('Tell me about this project');
    expect(result.interaction_type).toEqual('text');
    expect(result.context_artifact_id).toBeNull();
    expect(result.curator_response).toBeDefined();
    expect(result.curator_response.length).toBeGreaterThan(0);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save interaction to database', async () => {
    const result = await createAiCuratorInteraction(testInput);

    // Query using proper drizzle syntax
    const interactions = await db.select()
      .from(aiCuratorInteractionsTable)
      .where(eq(aiCuratorInteractionsTable.id, result.id))
      .execute();

    expect(interactions).toHaveLength(1);
    expect(interactions[0].session_id).toEqual('test-session-123');
    expect(interactions[0].user_input).toEqual('Tell me about this project');
    expect(interactions[0].interaction_type).toEqual('text');
    expect(interactions[0].context_artifact_id).toBeNull();
    expect(interactions[0].curator_response).toBeDefined();
    expect(interactions[0].created_at).toBeInstanceOf(Date);
  });

  it('should generate contextual response for voice interaction', async () => {
    const voiceInput: CreateAiCuratorInteractionInput = {
      session_id: 'voice-session-456',
      user_input: 'What is this project about?',
      interaction_type: 'voice',
      context_artifact_id: null
    };

    const result = await createAiCuratorInteraction(voiceInput);

    expect(result.interaction_type).toEqual('voice');
    expect(result.curator_response).toContain('Welcome to Corey\'s portfolio');
    expect(result.curator_response).toContain('help you explore');
  });

  it('should generate contextual response for gesture interaction', async () => {
    const gestureInput: CreateAiCuratorInteractionInput = {
      session_id: 'gesture-session-789',
      user_input: 'pointing at project',
      interaction_type: 'gesture',
      context_artifact_id: null
    };

    const result = await createAiCuratorInteraction(gestureInput);

    expect(result.interaction_type).toEqual('gesture');
    expect(result.curator_response).toContain('browsing the gallery');
    expect(result.curator_response).toContain('interact with any project');
  });

  it('should handle interaction with context artifact', async () => {
    // First create a portfolio artifact to reference
    const artifactResult = await db.insert(portfolioArtifactsTable)
      .values({
        title: 'Test AI Project',
        description: 'A test AI project for context',
        category: 'ai_project',
        tags: ['ai', 'test'],
        position_x: '0',
        position_y: '0',
        position_z: '0',
        rotation_x: '0',
        rotation_y: '0',
        rotation_z: '0',
        scale: '1',
        is_featured: false
      })
      .returning()
      .execute();

    const contextInput: CreateAiCuratorInteractionInput = {
      session_id: 'context-session-101',
      user_input: 'How does this AI work?',
      interaction_type: 'text',
      context_artifact_id: artifactResult[0].id
    };

    const result = await createAiCuratorInteraction(contextInput);

    expect(result.context_artifact_id).toEqual(artifactResult[0].id);
    expect(result.curator_response).toContain('Great question about this project');
    expect(result.curator_response).toContain('development process');
  });

  it('should handle voice interaction with context artifact', async () => {
    // First create a portfolio artifact to reference
    const artifactResult = await db.insert(portfolioArtifactsTable)
      .values({
        title: 'Test Data Project',
        description: 'A test data engineering project',
        category: 'data_engineering',
        tags: ['data', 'engineering'],
        position_x: '1',
        position_y: '1',
        position_z: '1',
        rotation_x: '0',
        rotation_y: '0',
        rotation_z: '0',
        scale: '1.5',
        is_featured: true
      })
      .returning()
      .execute();

    const voiceContextInput: CreateAiCuratorInteractionInput = {
      session_id: 'voice-context-202',
      user_input: 'Tell me more about this data pipeline',
      interaction_type: 'voice',
      context_artifact_id: artifactResult[0].id
    };

    const result = await createAiCuratorInteraction(voiceContextInput);

    expect(result.context_artifact_id).toEqual(artifactResult[0].id);
    expect(result.interaction_type).toEqual('voice');
    expect(result.curator_response).toContain('interested in this project');
    expect(result.curator_response).toContain('share some details');
  });

  it('should handle gesture interaction with context artifact', async () => {
    // First create a portfolio artifact to reference
    const artifactResult = await db.insert(portfolioArtifactsTable)
      .values({
        title: 'Test Visualization',
        description: 'A test visualization project',
        category: 'visualization',
        tags: ['visualization', 'charts'],
        position_x: '2',
        position_y: '2',
        position_z: '2',
        rotation_x: '45',
        rotation_y: '45',
        rotation_z: '45',
        scale: '0.8',
        is_featured: false
      })
      .returning()
      .execute();

    const gestureContextInput: CreateAiCuratorInteractionInput = {
      session_id: 'gesture-context-303',
      user_input: 'examining visualization closely',
      interaction_type: 'gesture',
      context_artifact_id: artifactResult[0].id
    };

    const result = await createAiCuratorInteraction(gestureContextInput);

    expect(result.context_artifact_id).toEqual(artifactResult[0].id);
    expect(result.interaction_type).toEqual('gesture');
    expect(result.curator_response).toContain('exploring this artifact');
    expect(result.curator_response).toContain('technology behind it');
  });
});
