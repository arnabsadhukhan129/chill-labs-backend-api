import express, { Express } from "express";
import morgan from "morgan";
import connectDB from "./config/db.connect";
import authRoutes from "./routes/auth.route";
import roleRoutes from "./routes/role.route";
import userAddressRoutes from './routes/userAddress.routes'
import countryRoutes from "./routes/country.routes";
import { setupSwagger } from "./swagger";
import parseUserInfo from "./middleware/parseUserInfo";
import adminRoutes from "./routes/adminAuthRoutes";
import schoolRoutes from './routes/school.routes';
import hrRoutes from './routes/hr.routes';
import schoolAdminRoutes from './routes/schoolAdmin.routes';
import loginRoutes from './routes/login.routes';
import categoryRoutes from './routes/category.routes';
import subCategoryRoutes from './routes/sub-category.routes';
import cors from "cors";
import uploadRoutes from "./routes/upload.route";
import profileRoutes from './routes/profile.routes';
import companyRoutes from './routes/company.route';
import searchHistoryRoutes from './routes/searchHistoryRoutes';
import activityRoutes from "./routes/activity";
import inspirationRoutes from "./routes/inspiration.route";
import HealthScan from "./routes/healthScan.route";

const app: Express = express();
app.use(cors({
  origin: [
    "http://localhost:4200",
    "http://chilllabsadmin.demoyourprojects.com"
  ],
  credentials: true
}));

async function initializeServices() {
  try {
    console.log("Initializing DB connection...");
    await connectDB();
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Error initializing services:", error);
    process.exit(1); // Exit the process if initialization fails
  }
}

initializeServices();

setupSwagger(app); // No need for type casting now
// app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// app.use("/auth", parseUserInfo, authRoutes);
app.use("/user-address", parseUserInfo, userAddressRoutes);
app.use("/rbac", parseUserInfo, roleRoutes);
app.use("/list", parseUserInfo, countryRoutes);

//................................

app.use("/admin", adminRoutes);
app.use('/schools', schoolRoutes);
app.use("/auth", authRoutes);
app.use("/hr", hrRoutes);
app.use('/school-admin', schoolAdminRoutes);
app.use('/login', loginRoutes);
app.use('/categories', categoryRoutes);
app.use('/auth', loginRoutes);
app.use('/profile',profileRoutes)

app.use("/upload", uploadRoutes);

app.use('/sub-categories', subCategoryRoutes);

app.use('/companies', companyRoutes);

app.use('/search-history',searchHistoryRoutes);

app.use('/activity', activityRoutes);

app.use('/inspiration', inspirationRoutes);

app.use('/health-scan',HealthScan);

app.get("/", (req, res) => {
  res.send("hello");
});



process.on("SIGINT", async () => {
  console.log("SIGINT received: closing MongoDB connection...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received: closing MongoDB connection...");
  process.exit(0);
});

export default app;
