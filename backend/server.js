const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.post("/graphql", async (req, res) => {
  try {
    console.log("Received GraphQL request:", JSON.stringify(req.body, null, 2));

    const isGetProductsQuery = req.body.operationName === "GetProducts";

    // Extract the Authorization header from the incoming request
    const authHeader = req.headers.authorization;

    // NOTE: the required header's name is different for GetProductsQuery vs the rest of queries/mutations
    const headers = {
      "Content-Type": "application/json",
      ...(isGetProductsQuery
        ? { "Magento-Store-View-Code": process.env.STORE_VIEW_CODE }
        : { Store: process.env.STORE_VIEW_CODE }),
      ...(authHeader && { Authorization: authHeader }), // Include the Authorization header if it exists
    };

    const response = await axios.post(process.env.GQL_API_URL, req.body, {
      headers,
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
