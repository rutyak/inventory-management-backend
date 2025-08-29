const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db.js");
const userRouter = require("./routes/userRoutes.js");
const productRouter = require("./routes/productRouter.js");
const cookieParser = require("cookie-parser");

dotenv.config();

connectDB();

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "https://pocket-notes-app-new.netlify.app"],
  methods: ["GET", "POST", "PATCH", "DELETE"],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use(userRouter);
app.use(productRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
