
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type User } from '../schema';

export async function getUserProfile(): Promise<User | null> {
  try {
    // Get the first user record (assuming single user portfolio)
    const result = await db.select()
      .from(usersTable)
      .limit(1)
      .execute();

    if (result.length === 0) {
      return null;
    }

    // Return the user profile
    return result[0];
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
}
