
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type User } from '../schema';
import { eq } from 'drizzle-orm';

export async function getUserProfile(): Promise<User | null> {
  try {
    // Get the first user record (assuming single user portfolio)
    const results = await db.select()
      .from(usersTable)
      .limit(1)
      .execute();

    if (results.length === 0) {
      return null;
    }

    const user = results[0];
    return {
      id: user.id,
      name: user.name,
      title: user.title,
      bio: user.bio,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  } catch (error) {
    console.error('Failed to get user profile:', error);
    throw error;
  }
}
