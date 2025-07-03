
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { aiCuratorInteractionsTable } from '../db/schema';
import { type CreateAiCuratorInteractionInput } from '../schema';
import { createAiCuratorInteraction } from '../handlers/create_ai_curator_interaction';
import { eq } from 'drizzle-orm';

const testInput: CreateAiCuratorInteractionInput = {
  session_id: 'test-session-123',
  user_input: 'Hello, can you show me AI projects?',
  interaction_type: 'voice',
  context_artifact_id: null
};

describe('createAiCuratorInteraction', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an AI curator interaction', async () => {
    const result = await createAiCuratorInteraction(testInput);

    expect(result.session_id).toEqual('test-session-123');
    expect(result.user_input).toEqual('Hello, can you show me AI projects?');
    expect(result.interaction_type).toEqual('voice');
    expect(result.context_artifact_id).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.curator_response).toBeDefined();
    expect(result.curator_response.length).toBeGreaterThan(0);
  });

  it('should save interaction to database', async () => {
    const result = await createAiCuratorInteraction(testInput);

    const interactions = await db.select()
      .from(aiCuratorInteractionsTable)
      .where(eq(aiCuratorInteractionsTable.id, result.id))
      .execute();

    expect(interactions).toHaveLength(1);
    expect(interactions[0].session_id).toEqual('test-session-123');
    expect(interactions[0].user_input).toEqual('Hello, can you show me AI projects?');
    expect(interactions[0].interaction_type).toEqual('voice');
    expect(interactions[0].context_artifact_id).toBeNull();
    expect(interactions[0].created_at).toBeInstanceOf(Date);
  });

  it('should generate contextual voice responses', async () => {
    const voiceInput: CreateAiCuratorInteractionInput = {
      session_id: 'voice-session',
      user_input: 'I want to explore AI projects',
      interaction_type: 'voice',
      context_artifact_id: null
    };

    const result = await createAiCuratorInteraction(voiceInput);

    expect(result.curator_response).toMatch(/AI projects/i);
    expect(result.curator_response).toMatch(/guide/i);
  });

  it('should generate contextual text responses', async () => {
    const textInput: CreateAiCuratorInteractionInput = {
      session_id: 'text-session',
      user_input: 'show me visualization projects',
      interaction_type: 'text',
      context_artifact_id: null
    };

    const result = await createAiCuratorInteraction(textInput);

    expect(result.curator_response).toMatch(/visualization/i);
    expect(result.curator_response).toMatch(/projects/i);
  });

  it('should handle gesture interactions', async () => {
    const gestureInput: CreateAiCuratorInteractionInput = {
      session_id: 'gesture-session',
      user_input: 'user pointed at artifact',
      interaction_type: 'gesture',
      context_artifact_id: 42
    };

    const result = await createAiCuratorInteraction(gestureInput);

    expect(result.curator_response).toMatch(/gesture/i);
    expect(result.curator_response).toMatch(/3D space/i);
    expect(result.context_artifact_id).toEqual(42);
  });

  it('should handle help requests appropriately', async () => {
    const helpInput: CreateAiCuratorInteractionInput = {
      session_id: 'help-session',
      user_input: 'what can you do?',
      interaction_type: 'voice',
      context_artifact_id: null
    };

    const result = await createAiCuratorInteraction(helpInput);

    expect(result.curator_response).toMatch(/help/i);
    expect(result.curator_response).toMatch(/navigate/i);
  });

  it('should store multiple interactions with same session', async () => {
    const input1: CreateAiCuratorInteractionInput = {
      session_id: 'multi-session',
      user_input: 'Hello',
      interaction_type: 'text',
      context_artifact_id: null
    };

    const input2: CreateAiCuratorInteractionInput = {
      session_id: 'multi-session',
      user_input: 'Show me data engineering projects',
      interaction_type: 'text',
      context_artifact_id: null
    };

    await createAiCuratorInteraction(input1);
    await createAiCuratorInteraction(input2);

    const interactions = await db.select()
      .from(aiCuratorInteractionsTable)
      .where(eq(aiCuratorInteractionsTable.session_id, 'multi-session'))
      .execute();

    expect(interactions).toHaveLength(2);
    expect(interactions[0].user_input).toEqual('Hello');
    expect(interactions[1].user_input).toEqual('Show me data engineering projects');
  });
});
