import { expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/render';
import { WebsiteTrackingCode } from './WebsiteTrackingCode';

vi.mock('@/components/hooks', () => ({
  useConfig: () => ({ trackerScriptName: 'custom-tracker.js' }),
  useMessages: () => ({
    t: (value: string) => value,
    labels: { trackingCode: 'Tracking code' },
    messages: { trackingCode: 'Add this script to your website.' },
  }),
}));

test('copies the displayed snippet and confirms success', async () => {
  const { user } = render(
    <WebsiteTrackingCode websiteId="website-123" hostUrl="https://analytics.example.com" />,
  );
  const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
  const snippet =
    '<script defer src="https://analytics.example.com/custom-tracker.js" data-website-id="website-123"></script>';

  expect(screen.getByRole('textbox')).toHaveValue(snippet);
  await user.click(screen.getByRole('button', { name: 'Copy tracking code' }));

  expect(writeText).toHaveBeenCalledWith(snippet);
  expect(screen.getByRole('status')).toHaveTextContent('Copied!');
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copy tracking code'), {
    timeout: 2500,
  });
});

test('does not confirm a copy when the clipboard is unavailable', async () => {
  const { user } = render(<WebsiteTrackingCode websiteId="website-123" />);
  const clipboard = navigator.clipboard;
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });

  try {
    await user.click(screen.getByRole('button', { name: 'Copy tracking code' }));
    expect(screen.getByRole('status')).toHaveTextContent('Copy tracking code');
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
  } finally {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard });
  }
});
