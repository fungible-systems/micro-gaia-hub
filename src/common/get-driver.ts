import { Context } from "hono";
import { R2Driver } from "../drivers/r2-driver";
import { DriverModel } from "../drivers/types";
// TODO: ENV flag for this
// import { RedisDriver } from "../drivers/redis-driver";

export const getDriver = (
  context: Context<any, { MY_BUCKET: R2Bucket }>
): DriverModel => {
  // TODO: ENV flag for this
  // return new RedisDriver();
  return new R2Driver(context.env.MY_BUCKET);
};
