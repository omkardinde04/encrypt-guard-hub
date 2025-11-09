import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Image, FileVideo, FileAudio, File } from "lucide-react";

interface FilePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: {
    name: string;
    url: string;
    type?: string;
  } | null;
}

export function FilePreviewDialog({
  open,
  onOpenChange,
  file,
}: FilePreviewDialogProps) {
  if (!file) return null;

  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension || '');
  const isVideo = ['mp4', 'webm', 'ogg'].includes(fileExtension || '');
  const isAudio = ['mp3', 'wav', 'ogg', 'm4a'].includes(fileExtension || '');
  const isPDF = fileExtension === 'pdf';
  const isText = ['txt', 'md', 'json', 'xml', 'csv'].includes(fileExtension || '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isImage && <Image className="w-5 h-5" />}
            {isVideo && <FileVideo className="w-5 h-5" />}
            {isAudio && <FileAudio className="w-5 h-5" />}
            {(isPDF || isText) && <FileText className="w-5 h-5" />}
            {!isImage && !isVideo && !isAudio && !isPDF && !isText && <File className="w-5 h-5" />}
            {file.name}
          </DialogTitle>
          <DialogDescription>File Preview</DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-auto">
          {isImage && (
            <img
              src={file.url}
              alt={file.name}
              className="w-full h-auto rounded-lg"
            />
          )}
          {isVideo && (
            <video controls className="w-full rounded-lg">
              <source src={file.url} />
              Your browser does not support the video tag.
            </video>
          )}
          {isAudio && (
            <div className="flex items-center justify-center p-8">
              <audio controls className="w-full">
                <source src={file.url} />
                Your browser does not support the audio tag.
              </audio>
            </div>
          )}
          {isPDF && (
            <iframe
              src={file.url}
              className="w-full h-[60vh] rounded-lg"
              title={file.name}
            />
          )}
          {isText && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Text preview not available. Please download the file to view its contents.
              </p>
            </div>
          )}
          {!isImage && !isVideo && !isAudio && !isPDF && !isText && (
            <div className="bg-muted p-8 rounded-lg text-center">
              <File className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Preview not available for this file type.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please download the file to view its contents.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
