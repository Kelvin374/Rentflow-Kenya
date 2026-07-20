import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
}));

describe('Notifications module', () => {
  it('exports NotificationProvider and useNotifications', async () => {
    const mod = await import('@/components/Notifications');
    expect(mod.NotificationProvider).toBeDefined();
    expect(mod.useNotifications).toBeDefined();
  });
});

describe('Toast module', () => {
  it('exports ToastProvider and useToast', async () => {
    const mod = await import('@/components/Toast');
    expect(mod.ToastProvider).toBeDefined();
    expect(mod.useToast).toBeDefined();
  });
});

describe('SidebarContext module', () => {
  it('exports SidebarProvider and useSidebar', async () => {
    const mod = await import('@/components/SidebarContext');
    expect(mod.SidebarProvider).toBeDefined();
    expect(mod.useSidebar).toBeDefined();
  });
});

describe('ErrorBoundary', () => {
  it('exports ErrorBoundary component', async () => {
    const mod = await import('@/components/ErrorBoundary');
    expect(mod.ErrorBoundary).toBeDefined();
  });
});

describe('ErrorMessage', () => {
  it('exports ErrorMessage component', async () => {
    const mod = await import('@/components/ErrorMessage');
    expect(mod.ErrorMessage).toBeDefined();
  });
});
