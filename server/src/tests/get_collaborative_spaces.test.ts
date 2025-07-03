
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { collaborativeSpacesTable } from '../db/schema';
import { getCollaborativeSpaces } from '../handlers/get_collaborative_spaces';

describe('getCollaborativeSpaces', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no spaces exist', async () => {
    const result = await getCollaborativeSpaces();
    expect(result).toEqual([]);
  });

  it('should return all collaborative spaces', async () => {
    // Create test spaces
    await db.insert(collaborativeSpacesTable)
      .values([
        {
          name: 'Main Conference Room',
          description: 'Large meeting space for presentations',
          space_type: 'meeting_room',
          max_participants: 20,
          is_active: true
        },
        {
          name: 'Feedback Corner',
          description: 'Intimate space for design reviews',
          space_type: 'feedback_space',
          max_participants: 8,
          is_active: true
        },
        {
          name: 'Presentation Theater',
          description: 'Immersive presentation environment',
          space_type: 'presentation_area',
          max_participants: 50,
          is_active: false
        }
      ])
      .execute();

    const result = await getCollaborativeSpaces();

    expect(result).toHaveLength(3);
    
    // Check first space
    const meetingRoom = result.find(s => s.name === 'Main Conference Room');
    expect(meetingRoom).toBeDefined();
    expect(meetingRoom!.space_type).toEqual('meeting_room');
    expect(meetingRoom!.max_participants).toEqual(20);
    expect(meetingRoom!.is_active).toBe(true);
    expect(meetingRoom!.id).toBeDefined();
    expect(meetingRoom!.created_at).toBeInstanceOf(Date);
    expect(meetingRoom!.updated_at).toBeInstanceOf(Date);

    // Check second space
    const feedbackSpace = result.find(s => s.name === 'Feedback Corner');
    expect(feedbackSpace).toBeDefined();
    expect(feedbackSpace!.space_type).toEqual('feedback_space');
    expect(feedbackSpace!.max_participants).toEqual(8);
    expect(feedbackSpace!.is_active).toBe(true);

    // Check third space
    const presentationArea = result.find(s => s.name === 'Presentation Theater');
    expect(presentationArea).toBeDefined();
    expect(presentationArea!.space_type).toEqual('presentation_area');
    expect(presentationArea!.max_participants).toEqual(50);
    expect(presentationArea!.is_active).toBe(false);
  });

  it('should handle spaces with null descriptions', async () => {
    await db.insert(collaborativeSpacesTable)
      .values({
        name: 'Simple Room',
        description: null,
        space_type: 'meeting_room',
        max_participants: 10,
        is_active: true
      })
      .execute();

    const result = await getCollaborativeSpaces();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Simple Room');
    expect(result[0].description).toBeNull();
    expect(result[0].space_type).toEqual('meeting_room');
  });
});
