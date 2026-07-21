import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('@/lib/supabase/client', () => {
  const supabase = {
    auth: {},
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  };

  return {
    supabase,
    createSupabaseClient: vi.fn(() => supabase),
  };
});
