
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

    if (result.length === 0) {
      return null;
    }

    const theme = result[0];
    
    // Return the theme (no numeric conversions needed for this schema)
    return {
      id: theme.id,
      name: theme.name,
      colors: theme.colors as any, // JSONB field
      typography: theme.typography as any, // JSONB field
      spacing: theme.spacing as any, // JSONB field
      animations: theme.animations as any, // JSONB field
      is_active: theme.is_active,
      created_at: theme.created_at,
      updated_at: theme.updated_at
    };
  } catch (error) {
    console.error('Failed to get active design theme:', error);
    throw error;
  }
};
