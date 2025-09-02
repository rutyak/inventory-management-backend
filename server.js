const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db.js");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRouter.js");
const productRouter = require("./routes/productRouter.js");
const invoiceRouter = require("./routes/invoiceRouter.js");
const authRouter = require("./routes/authRouter.js");

dotenv.config();

connectDB();

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://inventory-management-dashboard.netlify.app",
    "https://inventory-management-frontend-pi-ruby.vercel.app",
  ],
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use(authRouter);
app.use(userRouter);
app.use(productRouter);
app.use(invoiceRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
