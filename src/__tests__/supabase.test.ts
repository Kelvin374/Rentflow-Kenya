import { describe, it, expect } from 'vitest';
import { createSupabaseClient } from '@/lib/supabase/client';

describe('createSupabaseClient', () => {
  it('creates a client even when environment variables are missing', () => {
    const client = createSupabaseClient();

    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
  });
});
