import app from "./app.js";
import { serverConfig } from "./config.js";

app.listen(serverConfig.port, () => {
  console.log(`Server is listening on port ${serverConfig.port}`);
});
