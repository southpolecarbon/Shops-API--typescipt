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
  // try {
  const response = await axios.post(
    process.env.GQL_API_URL as string,
    req.body
  );
  res.json(response.data);
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       console.error("Error:", error.message);
  //       return res.status(400).json(error.message);
  //     }
  //
  //     res.status(500).json({
  //       error: "An error occurred",
  //       details: error.response ? error.response.data : error.message,
  //     });
  //   }
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
