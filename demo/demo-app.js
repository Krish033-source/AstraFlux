import { logError } from "../client/logger.js";
console.log("Demo app → error every 5s to AstraFlux…");
setInterval(() => {
  try {
    const data = undefined;
    console.log(data.length);
  } catch (err) {
    logError(err, { service: "demo-app", env: "dev" });
  }
}, 5000);
