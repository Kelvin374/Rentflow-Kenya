'use client';

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

type PostgresChangesFilter = {
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  table: string;
  filter?: string;
};

export function useRealtimeSubscription(
  channelName: string,
  filters: PostgresChangesFilter[],
  callback: (payload: any) => void,
  enabled = true
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const client = supabase;
    let channel: RealtimeChannel;

    channel = client.channel(channelName);

    filters.forEach((filter) => {
      channel.on(
        'postgres_changes' as any,
        {
          event: filter.event,
          schema: filter.schema || 'public',
          table: filter.table,
          filter: filter.filter,
        } as any,
        (payload: any) => {
          callbackRef.current(payload);
        }
      );
    });

    channel.subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [channelName, enabled, JSON.stringify(filters)]);
}
