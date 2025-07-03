
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { aiCuratorInteractionsTable } from '../db/schema';
import { getAiCuratorInteractions } from '../handlers/get_ai_curator_interactions';

describe('getAiCuratorInteractions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no interactions exist', async () => {
    const result = await getAiCuratorInteractions('non-existent-session');
    expect(result).toEqual([]);
  });

  it('should return interactions for a specific session', async () => {
    const sessionId = 'test-session-123';
    
    // Create test interactions
    await db.insert(aiCuratorInteractionsTable)
      .values([
        {
          session_id: sessionId,
          user_input: 'Tell me about this project',
          curator_response: 'This is an AI project focused on machine learning.',
          interaction_type: 'text',
          context_artifact_id: null
        },
        {
          session_id: sessionId,
          user_input: 'How does the visualization work?',
          curator_response: 'The visualization uses WebGL for 3D rendering.',
          interaction_type: 'voice',
          context_artifact_id: 1
        },
        {
          session_id: 'different-session',
          user_input: 'Different session question',
          curator_response: 'Different session response',
          interaction_type: 'text',
          context_artifact_id: null
        }
      ])
      .execute();

    const result = await getAiCuratorInteractions(sessionId);

    expect(result).toHaveLength(2);
    
    // Check that we have the expected interactions (order may vary)
    const userInputs = result.map(r => r.user_input);
    expect(userInputs).toContain('Tell me about this project');
    expect(userInputs).toContain('How does the visualization work?');
    
    // Find the specific interaction to test its properties
    const voiceInteraction = result.find(r => r.interaction_type === 'voice');
    expect(voiceInteraction).toBeDefined();
    expect(voiceInteraction!.user_input).toEqual('How does the visualization work?');
    expect(voiceInteraction!.curator_response).toEqual('The visualization uses WebGL for 3D rendering.');
    expect(voiceInteraction!.context_artifact_id).toEqual(1);
    expect(voiceInteraction!.created_at).toBeInstanceOf(Date);
    expect(voiceInteraction!.id).toBeDefined();

    const textInteraction = result.find(r => r.interaction_type === 'text');
    expect(textInteraction).toBeDefined();
    expect(textInteraction!.user_input).toEqual('Tell me about this project');
    expect(textInteraction!.context_artifact_id).toBeNull();
    
    // All interactions should belong to the correct session
    result.forEach(interaction => {
      expect(interaction.session_id).toEqual(sessionId);
    });
  });

  it('should return interactions ordered by created_at descending', async () => {
    const sessionId = 'test-session-456';
    
    // Create interactions with slight delays to ensure different timestamps
    await db.insert(aiCuratorInteractionsTable)
      .values({
        session_id: sessionId,
        user_input: 'First question',
        curator_response: 'First response',
        interaction_type: 'text',
        context_artifact_id: null
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(aiCuratorInteractionsTable)
      .values({
        session_id: sessionId,
        user_input: 'Second question',
        curator_response: 'Second response',
        interaction_type: 'text',
        context_artifact_id: null
      })
      .execute();

    const result = await getAiCuratorInteractions(sessionId);

    expect(result).toHaveLength(2);
    expect(result[0].user_input).toEqual('Second question');
    expect(result[1].user_input).toEqual('First question');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should only return interactions for the specified session', async () => {
    const sessionId1 = 'session-1';
    const sessionId2 = 'session-2';
    
    await db.insert(aiCuratorInteractionsTable)
      .values([
        {
          session_id: sessionId1,
          user_input: 'Question for session 1',
          curator_response: 'Response for session 1',
          interaction_type: 'text',
          context_artifact_id: null
        },
        {
          session_id: sessionId2,
          user_input: 'Question for session 2',
          curator_response: 'Response for session 2',
          interaction_type: 'gesture',
          context_artifact_id: 2
        }
      ])
      .execute();

    const result1 = await getAiCuratorInteractions(sessionId1);
    const result2 = await getAiCuratorInteractions(sessionId2);

    expect(result1).toHaveLength(1);
    expect(result1[0].session_id).toEqual(sessionId1);
    expect(result1[0].user_input).toEqual('Question for session 1');

    expect(result2).toHaveLength(1);
    expect(result2[0].session_id).toEqual(sessionId2);
    expect(result2[0].user_input).toEqual('Question for session 2');
    expect(result2[0].interaction_type).toEqual('gesture');
  });
});
