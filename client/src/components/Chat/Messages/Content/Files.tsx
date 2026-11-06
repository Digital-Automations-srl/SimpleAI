import { useMemo, useState, useCallback, memo } from 'react';
import type { TFile, TMessage } from 'librechat-data-provider';
import FileContainer from '~/components/Chat/Input/Files/FileContainer';
import { usesImagePreview, hydrateFileDeliveryMetadata } from '~/utils';
import { useFileMapContext, useShareContext } from '~/Providers';
import FilePreviewDialog from './FilePreviewDialog';
import { useLocalize } from '~/hooks';
import Image from './Image';

/** A file copied from a shared link keeps its metadata but not its id: the model no longer sees it. */
export function hasDetachedFiles(files?: Partial<TFile>[] | null): boolean {
  return files?.some((file) => !file.file_id) ?? false;
}

const Files = ({ message }: { message?: TMessage }) => {
  const localize = useLocalize();
  const fileMap = useFileMapContext();
  const { shareId } = useShareContext();
  const files = useMemo(
    () => hydrateFileDeliveryMetadata(message?.files, undefined, shareId ? undefined : fileMap),
    [message?.files, fileMap, shareId],
  );
  const imageFiles = useMemo(() => {
    return files?.filter(usesImagePreview) || [];
  }, [files]);

  const otherFiles = useMemo(() => {
    return files?.filter((file) => !usesImagePreview(file)) || [];
  }, [files]);

  const showDetachedNotice = !shareId && hasDetachedFiles(files);

  const [selectedFile, setSelectedFile] = useState<Partial<TFile> | null>(null);

  const handleClose = useCallback((open: boolean) => {
    if (!open) {
      setSelectedFile(null);
    }
  }, []);

  return (
    <>
      {otherFiles.length > 0 &&
        otherFiles.map((file, index) => (
          <FileContainer
            key={file.file_id ?? `${file.filename}-${index}`}
            file={file as TFile}
            onClick={() => setSelectedFile(file)}
          />
        ))}
      {imageFiles.length > 0 &&
        imageFiles.map((file, index) => (
          <Image
            key={file.file_id ?? `${file.filename}-${index}`}
            alignRight
            imagePath={file.preview ?? file.filepath ?? ''}
            height={file.height ?? 1920}
            width={file.width ?? 1080}
            altText={file.filename ?? 'Uploaded Image'}
          />
        ))}
      {showDetachedNotice && (
        <p className="w-full text-xs text-text-secondary" role="note">
          {localize('com_ui_shared_files_detached')}
        </p>
      )}
      <FilePreviewDialog
        open={selectedFile !== null}
        onOpenChange={handleClose}
        fileName={selectedFile?.filename ?? ''}
        fileId={selectedFile?.file_id}
        filePath={selectedFile?.filepath}
        fileType={selectedFile?.type ?? undefined}
        fileSource={selectedFile?.source}
        fileSize={(selectedFile as TFile)?.bytes}
        deliveryPath={selectedFile?.llmDeliveryPath}
      />
    </>
  );
};

export default memo(Files);
