import { env } from "@/env";
import { Cluster } from "ioredis";

export const redis = new Cluster(
  [
    {
      host: env.REDIS_HOST,
      port: 6379,
    },
  ],
  {
    redisOptions: {
      tls: { checkServerIdentity: () => undefined },
      username: env.REDIS_USERNAME,
      password: env.REDIS_PASSWORD,
      showFriendlyErrorStack: true,
    },
    slotsRefreshTimeout: 30000,
    dnsLookup: (address, callback) => callback(null, address),
  }
);
