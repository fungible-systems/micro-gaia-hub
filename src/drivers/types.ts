export interface ReadResult {
  data: ReadableStream | string | undefined;
  contentType?: string;
  contentLength?: string;
}

export interface DriverModel {
  write(
    path: string,
    contents:
      | ReadableStream
      | ArrayBuffer
      | ArrayBufferView
      | string
      | null
      | Blob,
    meta?: {
      contentType?: string;
      contentLength?: string;
    }
  ): Promise<void>;

  read(path: string): Promise<ReadResult | undefined>;

  list(
    path: string,
    options?: {
      suffix?: string;
      page?: string;
      stat?: boolean;
    }
  ): Promise<{ entries: string[]; page?: string }>;

  rename(currentPath: string, newPath: string): Promise<void>;

  delete(path: string): Promise<void>;
}
