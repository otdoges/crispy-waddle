import React, { useState, useEffect, createContext, useContext } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Theme {
  id?: string; // Add id property
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  typography: {
    fontFamily: string;
    headingSize: string;
    bodySize: string;
    lineHeight: string;
  };
  spacing: {
    padding: string;
    gap: string;
    radius: string;
  };
  animations: {
    transition: string;
    messageIn: string;
    messageOut: string;
    reaction: string;
  };
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  loading: boolean;
  error: Error | null;
  availableThemes: Theme[];
  saveTheme: (theme: Theme) => Promise<void>;
}

const defaultTheme: Theme = {
  id: 'default',
  colors: {
    primary: '#7C3AED',
    secondary: '#5B21B6',
    background: '#1F2937',
    surface: '#374151',
    text: '#F9FAFB',
    accent: '#60A5FA'
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingSize: '1.25rem',
    bodySize: '1rem',
    lineHeight: '1.5'
  },
  spacing: {
    padding: '1rem',
    gap: '0.5rem',
    radius: '0.5rem'
  },
  animations: {
    transition: 'all 0.2s ease-in-out',
    messageIn: 'slideInLeft',
    messageOut: 'slideInRight',
    reaction: 'bounce'
  }
};

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
  loading: false,
  error: null,
  availableThemes: [],
  saveTheme: async () => {}
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [availableThemes, setAvailableThemes] = useState<Theme[]>([]);

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadTheme();
    loadAvailableThemes();
  }, []);

  const loadTheme = async () => {
    try {
      const { data: userTheme, error: userThemeError } = await supabase
        .from('user_theme_preferences')
        .select('theme_id, custom_overrides')
        .single();

      if (userThemeError) throw userThemeError;

      if (userTheme) {
        const { data: themeData, error: themeError } = await supabase
          .from('ui_themes')
          .select('*')
          .eq('id', userTheme.theme_id)
          .single();

        if (themeError) throw themeError;

        const customTheme = {
          ...themeData,
          ...userTheme.custom_overrides
        };

        setTheme(customTheme);
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load theme'));
      setLoading(false);
    }
  };

  const loadAvailableThemes = async () => {
    try {
      const { data: themes, error: themesError } = await supabase
        .from('ui_themes')
        .select('*');

      if (themesError) throw themesError;

      setAvailableThemes(themes || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load available themes'));
    }
  };

  const saveTheme = async (newTheme: Theme) => {
    try {
      const { data: userTheme, error: userThemeError } = await supabase
        .from('user_theme_preferences')
        .upsert({
          theme_id: newTheme.id,
          custom_overrides: {
            colors: newTheme.colors,
            typography: newTheme.typography,
            spacing: newTheme.spacing,
            animations: newTheme.animations
          }
        })
        .single();

      if (userThemeError) throw userThemeError;

      setTheme(newTheme);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save theme'));
      throw err;
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        loading,
        error,
        availableThemes,
        saveTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default useTheme; 