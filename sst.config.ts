/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "build0",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const infra = await import("./infra");

    return {
      urls: {
        "build0-web": infra.website.url,
      }
    };
  },
});
