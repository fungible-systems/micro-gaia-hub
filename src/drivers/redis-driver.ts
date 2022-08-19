import { Redis } from "@upstash/redis";
import { DriverModel, ReadResult } from "./types";

const redis = new Redis({
  url: "URL",
  token: "TOKEN",
});

export class RedisDriver implements DriverModel {
  async read(path: string): Promise<ReadResult | undefined> {
    const data = await redis.get<string>(path);
    if (data)
      return {
        data: JSON.stringify(data),
      };
    return null;
  }

  async write(
    path: string,
    body: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob | null,
    meta?: { contentType?: string; contentLength?: string }
  ): Promise<void> {
    await redis.set(path, body);
  }

  async rename(currentPath: string, newPath: string): Promise<void> {
    await redis.rename(currentPath, newPath);
  }

  async delete(path: string): Promise<void> {
    console.log("todo");
    // await redis.();
  }

  async list(
    path: string,
    options?: { suffix?: string; page?: string; stat?: boolean }
  ): Promise<{ entries: string[]; page?: string }> {
    const data = await redis.keys(path);

    return {
      entries: data,
      page: null,
    };
  }
}
