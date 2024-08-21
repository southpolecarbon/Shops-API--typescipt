const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

const MAGENTO_API_URL = process.env.MAGENTO_API_URL;

app.post("/graphql", async (req, res) => {
  try {
    console.log("Received GraphQL request:", JSON.stringify(req.body, null, 2));
    const response = await axios.post(MAGENTO_API_URL, req.body, {
      headers: {
        "Content-Type": "application/json",
        Store: "default",
        // Add any necessary authentication headers here
      },
    });
    console.log("GraphQL response:", JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      error: "An error occurred",
      details: error.response ? error.response.data : error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
