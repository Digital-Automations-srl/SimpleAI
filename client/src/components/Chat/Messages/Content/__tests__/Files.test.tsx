/* eslint-disable i18next/no-literal-string */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { TMessage } from 'librechat-data-provider';
import Files from '../Files';

let mockShareId: string | undefined;

jest.mock('~/Providers', () => ({
  useFileMapContext: () => ({}),
  useShareContext: () => ({ shareId: mockShareId }),
}));
jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string) => key,
}));
jest.mock(
  '~/components/Chat/Input/Files/FileContainer',
  () =>
    ({ onClick }: { onClick: () => void }) => <button onClick={onClick}>file action</button>,
);
jest.mock('../Image', () => ({ alignRight }: { alignRight?: boolean }) => (
  <div data-testid="image-preview" data-aligned-right={String(alignRight)}>
    image preview
  </div>
));
jest.mock(
  '../FilePreviewDialog',
  () =>
    ({ open, deliveryPath }: { open: boolean; deliveryPath?: string }) =>
      open ? <div>preview: {deliveryPath}</div> : null,
);

it('exposes extracted image text without changing ordinary image previews', () => {
  render(
    <Files
      message={
        {
          files: [
            { file_id: 'text-image', type: 'image/png', llmDeliveryPath: 'text' },
            { file_id: 'image', type: 'image/png' },
          ],
        } as TMessage
      }
    />,
  );
  expect(screen.getAllByText('image preview')).toHaveLength(1);
  expect(screen.getByTestId('image-preview')).toHaveAttribute('data-aligned-right', 'true');
  fireEvent.click(screen.getByText('file action'));
  expect(screen.getByText('preview: text')).toBeInTheDocument();
});

describe('attachments copied from a shared link', () => {
  const sharedCopy = { files: [{ filename: 'offerta.pdf', type: 'application/pdf' }] } as TMessage;

  beforeEach(() => {
    mockShareId = undefined;
  });

  it('warns that the model no longer reads them', () => {
    render(<Files message={sharedCopy} />);
    expect(screen.getByRole('note')).toHaveTextContent('com_ui_shared_files_detached');
  });

  it('says nothing about files the model still reads', () => {
    render(<Files message={{ files: [{ file_id: 'f1', type: 'application/pdf' }] } as TMessage} />);
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('says nothing on the shared link itself', () => {
    mockShareId = 'share-1';
    render(<Files message={sharedCopy} />);
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });
});
