import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import axios from "axios";
import "dotenv/config";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.post("/graphql", async (req: Request, res: Response) => {
  const isGetProductsQuery = req.body.operationName === "GetProducts";

  //extract the headers set in FE and pass them along to the Magento API
  const {
    authorization,
    store,
    "magento-store-view-code": magentoStoreViewCode,
  } = req.headers;

  const headers = {
    "Content-Type": "application/json",
    ...(isGetProductsQuery
      ? { "Magento-Store-View-Code": magentoStoreViewCode }
      : { Store: store }),
    ...(authorization && { Authorization: authorization }),
  };

  const response = await axios.post(
    process.env.GQL_API_URL as string,
    req.body,
    { headers }
  );
  res.json(response.data);
});

app.use((err: unknown, req: Request, res: Response) => {
  console.error(err);
  if (err instanceof Error) {
    res.status(500).json({
      error: err.name,
      details: err.message,
    });
  } else {
    res.status(500).json({
      details: "An unknown error occurred",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
