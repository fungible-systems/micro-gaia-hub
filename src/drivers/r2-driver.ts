import { DriverModel, ReadResult } from "./types";

export class R2Driver implements DriverModel {
  private bucket: R2Bucket;

  constructor(bucket: R2Bucket) {
    this.bucket = bucket;
  }

  async write(
    path: string,
    body: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob,
    meta?: {
      contentType: string;
      contentLength?: string;
    }
  ): Promise<void> {
    const data = await this.bucket.put(path, body, {
      httpMetadata: {
        contentType: meta?.contentType ?? "application/octet-stream",
      },
      customMetadata: {
        contentLength: meta?.contentLength,
      },
    });
  }

  async rename(currentPath: string, newPath: string): Promise<void> {
    const current = await this.read(currentPath);
    await this.write(newPath, current.data, {
      contentLength: current.contentLength,
      contentType: current.contentType,
    });
    await this.delete(currentPath);
  }

  async delete(path: string): Promise<void> {
    await this.bucket.delete(path);
  }

  async read(path: string): Promise<ReadResult | undefined> {
    const obj = await this.bucket.get(path);
    if (!obj) return;
    return {
      data: obj.body,
      contentType: obj.httpMetadata.contentType,
      contentLength: obj.customMetadata.contentLength as string | undefined,
    };
  }

  async list(
    path: string,
    options?: { suffix?: string; page?: string; stat?: boolean }
  ): Promise<{ entries: string[]; page?: string }> {
    const { truncated, objects, cursor } = await this.bucket.list({
      prefix: `${path}${options.suffix ? "/" + options.suffix : ""}`,
      cursor: options?.page,
    });

    const entries = [];

    for (const { key } of objects) entries.push(key.replace(`${path}/`, ""));

    return {
      entries,
      page: truncated ? cursor : null,
    };
  }
}
