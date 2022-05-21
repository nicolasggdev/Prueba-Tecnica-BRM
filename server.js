const { app } = require("./app");

const dotenv = require("dotenv");

const { database } = require("./database/database");

const { initModels } = require("./database/initModels");

dotenv.config({ path: "./config.env" });

database
  .authenticate()
  .then(() => console.log("Database is authenticated"))
  .catch((err) => console.log(err));

initModels();

database
  .sync()
  .then(() => console.log("Database is synced"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Express app is running on PORT: ${PORT}`);
});
