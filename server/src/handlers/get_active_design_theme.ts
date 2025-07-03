
import { db } from '../db';
import { designSystemThemesTable } from '../db/schema';
import { type DesignSystemTheme } from '../schema';
import { eq } from 'drizzle-orm';

export const getActiveDesignTheme = async (): Promise<DesignSystemTheme | null> => {
  try {
    // Query for the active design theme
    const result = await db.select()
      .from(designSystemThemesTable)
      .where(eq(designSystemThemesTable.is_active, true))
      .limit(1)
      .execute();

    // Return null if no active theme found
    if (result.length === 0) {
      return null;
    }

    // Return the theme with proper type assertion for jsonb fields
    const theme = result[0];
    return {
      id: theme.id,
      name: theme.name,
      colors: theme.colors as DesignSystemTheme['colors'],
      typography: theme.typography as DesignSystemTheme['typography'],
      spacing: theme.spacing as DesignSystemTheme['spacing'],
      animations: theme.animations as DesignSystemTheme['animations'],
      is_active: theme.is_active,
      created_at: theme.created_at,
      updated_at: theme.updated_at
    };
  } catch (error) {
    console.error('Failed to fetch active design theme:', error);
    throw error;
  }
};
