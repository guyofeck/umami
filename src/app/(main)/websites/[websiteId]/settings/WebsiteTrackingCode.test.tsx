import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/render';
import { WebsiteTrackingCode } from './WebsiteTrackingCode';

const { toast, config } = vi.hoisted(() => ({
  toast: vi.fn(),
  config: { trackerScriptName: '', cloudMode: false },
}));

vi.mock('@umami/react-zen', async importOriginal => ({
  ...(await importOriginal<typeof import('@umami/react-zen')>()),
  useToast: () => ({ toast }),
}));

vi.mock('@/components/hooks', async importOriginal => ({
  ...(await importOriginal<typeof import('@/components/hooks')>()),
  useConfig: () => config,
}));

describe('WebsiteTrackingCode', () => {
  beforeEach(() => {
    toast.mockReset();
    config.trackerScriptName = '';
  });

  test('copies the displayed snippet and confirms success', async () => {
    const { user } = render(
      <WebsiteTrackingCode websiteId="website-123" hostUrl="https://analytics.example.com" />,
    );
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();

    await user.click(screen.getByRole('button', { name: 'Copy tracking code' }));

    expect(writeText).toHaveBeenCalledWith(
      (screen.getByRole('textbox') as HTMLTextAreaElement).value,
    );
    expect(writeText).toHaveBeenCalledWith(
      '<script defer src="https://analytics.example.com/script.js" data-website-id="website-123"></script>',
    );
    await waitFor(() => expect(toast).toHaveBeenCalledWith('Tracking code copied to clipboard.'));
  });

  test('uses the configured tracking script URL', async () => {
    config.trackerScriptName = 'https://cdn.example.com/custom.js';
    const { user } = render(<WebsiteTrackingCode websiteId="website-456" />);
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();

    await user.click(screen.getByRole('button', { name: 'Copy tracking code' }));

    expect(writeText).toHaveBeenCalledWith(
      '<script defer src="https://cdn.example.com/custom.js" data-website-id="website-456"></script>',
    );
    await waitFor(() => expect(toast).toHaveBeenCalledWith('Tracking code copied to clipboard.'));
  });

  test('does not confirm success when clipboard access fails', async () => {
    const { user } = render(<WebsiteTrackingCode websiteId="website-123" />);
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
      new Error('Clipboard access denied'),
    );

    await user.click(screen.getByRole('button', { name: 'Copy tracking code' }));

    await waitFor(() => expect(toast).toHaveBeenCalledWith('Something went wrong.'));
    expect(toast).not.toHaveBeenCalledWith('Tracking code copied to clipboard.');
  });
});
