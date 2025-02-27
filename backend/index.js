import dotenv from "dotenv";

import { app } from "./app.js";
dotenv.config();

app.listen(process.env.Port || 8000, () => {
  console.log(`Server is running at port: ${process.env.PORT}`);
});
