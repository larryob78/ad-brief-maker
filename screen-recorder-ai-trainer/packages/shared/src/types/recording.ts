export interface RecordingConfig {
  /** Whether to capture full screen or a window/tab */
  captureMode: 'screen' | 'window' | 'tab';
  /** Video resolution constraints */
  resolution?: {
    width: number;
    height: number;
  };
  /** Frame rate (default 30) */
  frameRate?: number;
  /** Whether to capture audio */
  captureAudio: boolean;
  /** Whether to capture system audio */
  captureSystemAudio: boolean;
  /** Video codec preference */
  codec?: string;
}

export interface AnnotationStep {
  id: string;
  /** Timestamp in the video (ms from start) */
  timestamp: number;
  /** End timestamp if this step has a duration */
  endTimestamp?: number;
  /** What the user is doing */
  action: string;
  /** Detailed description of the step */
  description: string;
  /** Application or context being used */
  application?: string;
  /** Screen coordinates of the action area */
  region?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** Tags for categorization */
  tags: string[];
  /** Type of action */
  actionType: 'click' | 'type' | 'scroll' | 'navigate' | 'drag' | 'keyboard_shortcut' | 'wait' | 'custom';
  /** Additional data specific to the action type */
  actionData?: Record<string, unknown>;
}

export interface Recording {
  id: string;
  /** User-given title */
  title: string;
  /** Description of the workflow */
  description: string;
  /** When the recording was created */
  createdAt: string;
  /** When the recording was last modified */
  updatedAt: string;
  /** Duration in milliseconds */
  duration: number;
  /** Video blob URL (for client-side use) */
  videoBlobUrl?: string;
  /** Video file path (for server-side use) */
  videoFilePath?: string;
  /** MIME type of the recording */
  mimeType: string;
  /** File size in bytes */
  fileSize: number;
  /** Recording configuration used */
  config: RecordingConfig;
  /** Annotated steps in the workflow */
  steps: AnnotationStep[];
  /** High-level workflow category */
  category?: string;
  /** Tags for the whole recording */
  tags: string[];
  /** Status of the recording */
  status: 'recording' | 'paused' | 'processing' | 'ready' | 'error';
  /** Thumbnail as data URL */
  thumbnailDataUrl?: string;
}

export interface ExportFormat {
  /** Format for AI training export */
  type: 'jsonl' | 'openai-finetune' | 'raw-bundle';
  /** Whether to include the video file */
  includeVideo: boolean;
  /** Whether to include screenshots at each step */
  includeScreenshots: boolean;
}

export interface ExportEntry {
  recording_id: string;
  title: string;
  description: string;
  duration_ms: number;
  category?: string;
  tags: string[];
  steps: {
    timestamp_ms: number;
    end_timestamp_ms?: number;
    action: string;
    description: string;
    action_type: string;
    application?: string;
    region?: { x: number; y: number; width: number; height: number };
    action_data?: Record<string, unknown>;
  }[];
  video_file?: string;
}
