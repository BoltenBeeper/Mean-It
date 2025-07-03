const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const chatGPTRoutes = require("./ChatGPT"); // Adjust the path as necessary

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/chatGPT", chatGPTRoutes); // Ensure the endpoint matches

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});