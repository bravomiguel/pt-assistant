declare module 'react-media-recorder' {
  export interface ReactMediaRecorderProps {
    audio?: boolean;
    video?: boolean;
    onStop?: (blobUrl: string, blob: Blob) => void;
    blobPropertyBag?: BlobPropertyBag;
    screen?: boolean;
    mediaRecorderOptions?: MediaRecorderOptions;
    askPermissionOnMount?: boolean;
  }

  export interface ReactMediaRecorderRenderProps {
    status: 'idle' | 'acquiring_media' | 'ready' | 'recording' | 'stopped' | 'failed';
    startRecording: () => void;
    stopRecording: () => void;
    pauseRecording: () => void;
    resumeRecording: () => void;
    mediaBlobUrl: string | null;
    clearBlobUrl: () => void;
    previewStream: MediaStream | null;
    error: string;
  }

  export function useReactMediaRecorder(props?: ReactMediaRecorderProps): ReactMediaRecorderRenderProps;
}
