import { createRequestLogger, initLogger, log as eventLog } from "evlog";

const globalForEvlog = globalThis as typeof globalThis & {
  __coralCompassEvlogInitialized?: boolean;
};

if (!globalForEvlog.__coralCompassEvlogInitialized) {
  initLogger({
    env: {
      service: "coral-compass",
      environment: process.env.NODE_ENV ?? "development"
    }
  });
  globalForEvlog.__coralCompassEvlogInitialized = true;
}

export { createRequestLogger, eventLog };
