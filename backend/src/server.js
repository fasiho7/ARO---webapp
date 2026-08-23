require("dotenv").config();

const app = require("./app");
const { validateEnv } = require("./utils/env");

const port = process.env.PORT || 5000;

function start() {
  try {
    validateEnv();
    app.listen(port, () => {
      console.log(`Aro backend listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start Aro backend:", error.message);
    process.exit(1);
  }
}

start();
