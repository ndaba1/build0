import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import { authConfig } from "./auth";

export const { runWithAmplifyServerContext } = createServerRunner({
  config: authConfig,
});
