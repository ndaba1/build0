import { Cluster } from "ioredis";
import { Resource } from "sst";

const cache = Resource.BuildZeroRedisCache;

export const redis = new Cluster(
  [
    {
      host: cache.host,
      port: cache.port,
    },
  ],
  {
    redisOptions: {
      tls: { checkServerIdentity: () => undefined },
      username: cache.username,
      password: cache.password,
      showFriendlyErrorStack: true,
    },
    slotsRefreshTimeout: 3000,
    dnsLookup: (address, callback) => callback(null, address),
  }
);
