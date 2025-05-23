// server/index.ts
import express3 from "express";
import { createServer } from "http";

// server/routes.ts
import express from "express";

// shared/schema.ts
import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var subjects = [
  "arabic",
  "english",
  "math",
  "chemistry",
  "physics",
  "biology",
  "constitution",
  "islamic"
];
var semesters = ["first", "second"];
var files = pgTable("files", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject", { enum: subjects }).notNull(),
  semester: text("semester", { enum: semesters }).notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull()
});
var exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  subject: text("subject", { enum: subjects }).notNull(),
  date: text("date").notNull(),
  topics: text("topics").array().notNull()
});
var quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject", { enum: subjects }).notNull(),
  creator: text("creator").notNull(),
  description: text("description"),
  code: text("code").notNull().unique(),
  questions: json("questions").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  name: text("name").notNull(),
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull(),
  answers: json("answers").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var adminUsername = "mohamed_admen_mo2025";
var adminPassword = "mohamed_admen_mo2025#";
var insertFileSchema = createInsertSchema(files).omit({ id: true, uploadedAt: true });
var insertExamSchema = createInsertSchema(exams).omit({ id: true });
var insertQuizSchema = createInsertSchema(quizzes).omit({ id: true, createdAt: true, code: true });
var insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({ id: true, createdAt: true });
var questionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number()
});

// server/storage.ts
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
var MemStorage = class {
  files;
  examWeeks;
  exams;
  quizzes;
  quizAttempts;
  currentFileId;
  currentExamWeekId;
  currentExamId;
  currentQuizId;
  currentQuizAttemptId;
  constructor() {
    this.files = /* @__PURE__ */ new Map();
    this.examWeeks = /* @__PURE__ */ new Map();
    this.exams = /* @__PURE__ */ new Map();
    this.quizzes = /* @__PURE__ */ new Map();
    this.quizAttempts = /* @__PURE__ */ new Map();
    this.currentFileId = 1;
    this.currentExamWeekId = 1;
    this.currentExamId = 1;
    this.currentQuizId = 1;
    this.currentQuizAttemptId = 1;
    this.files.clear();
    this.examWeeks.clear();
    this.exams.clear();
    this.quizzes.clear();
    this.quizAttempts.clear();
  }
  // Auth
  async validateAdmin(username, password) {
    return username === adminUsername && password === adminPassword;
  }
  // Files
  async getFiles() {
    return Array.from(this.files.values());
  }
  async getFilesBySubject(subject) {
    return Array.from(this.files.values()).filter((file) => file.subject === subject);
  }
  async getFilesBySemester(semester) {
    return Array.from(this.files.values()).filter((file) => file.semester === semester);
  }
  async getFile(id) {
    return this.files.get(id);
  }
  async createFile(fileData, fileBuffer) {
    const id = this.currentFileId++;
    const fileName = `${Date.now()}-${fileData.fileName}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, fileBuffer);
    const file = {
      id,
      ...fileData,
      filePath: `/uploads/${fileName}`,
      uploadedAt: /* @__PURE__ */ new Date()
    };
    this.files.set(id, file);
    return file;
  }
  async deleteFile(id) {
    const file = this.files.get(id);
    if (!file) return false;
    try {
      const fullPath = path.join(__dirname, "..", file.filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
    return this.files.delete(id);
  }
  // Exam Weeks
  async getExamWeeks() {
    return Array.from(this.examWeeks.values());
  }
  async getExamWeek(id) {
    return this.examWeeks.get(id);
  }
  async createExamWeek(examWeekData) {
    const id = this.currentExamWeekId++;
    const examWeek = {
      id,
      ...examWeekData,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.examWeeks.set(id, examWeek);
    return examWeek;
  }
  async deleteExamWeek(id) {
    const examIds = Array.from(this.exams.values()).filter((exam) => exam.weekId === id).map((exam) => exam.id);
    for (const examId of examIds) {
      this.exams.delete(examId);
    }
    return this.examWeeks.delete(id);
  }
  // Exams
  async getExams() {
    return Array.from(this.exams.values());
  }
  async getExamsByWeek(weekId) {
    return Array.from(this.exams.values()).filter((exam) => exam.weekId === weekId);
  }
  async createExam(examData) {
    const id = this.currentExamId++;
    const exam = {
      id,
      ...examData
    };
    this.exams.set(id, exam);
    return exam;
  }
  async deleteExam(id) {
    return this.exams.delete(id);
  }
  // Quizzes
  async getQuizzes() {
    return Array.from(this.quizzes.values());
  }
  async getQuizByCode(code) {
    return Array.from(this.quizzes.values()).find((quiz) => quiz.code === code);
  }
  async getQuiz(id) {
    return this.quizzes.get(id);
  }
  async createQuiz(quizData) {
    const id = this.currentQuizId++;
    const code = nanoid(8).toUpperCase();
    const quiz = {
      id,
      title: quizData.title,
      subject: quizData.subject,
      creator: quizData.creator,
      description: quizData.description || null,
      questions: quizData.questions,
      code,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }
  async deleteQuiz(id) {
    const attemptIds = Array.from(this.quizAttempts.values()).filter((attempt) => attempt.quizId === id).map((attempt) => attempt.id);
    for (const attemptId of attemptIds) {
      this.quizAttempts.delete(attemptId);
    }
    return this.quizzes.delete(id);
  }
  // Quiz Attempts
  async getQuizAttempts(quizId) {
    return Array.from(this.quizAttempts.values()).filter((attempt) => attempt.quizId === quizId);
  }
  async createQuizAttempt(attemptData) {
    const id = this.currentQuizAttemptId++;
    const attempt = {
      id,
      ...attemptData,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.quizAttempts.set(id, attempt);
    return attempt;
  }
  // Initialize sample data (for development only)
  //private initSampleData() {
  // No initial sample data
  //  this.createExam({
  //    weekId: 1,
  //    day: "الثلاثاء",
  //    subject: "arabic",
  //    date: "12 أكتوبر 2023",
  //    topics: ["الشعر العباسي", "النحو والصرف (الفصل الأول)"],
  //  });
  //  this.createExam({
  //    weekId: 1,
  //    day: "الخميس",
  //    subject: "physics",
  //    date: "14 أكتوبر 2023",
  //    topics: ["الميكانيكا (قوانين نيوتن)", "الديناميكا الحرارية"],
  //  });
  //  this.createExam({
  //    weekId: 2,
  //    day: "الاثنين",
  //    subject: "chemistry",
  //    date: "18 أكتوبر 2023",
  //    topics: ["الجدول الدوري وخواص العناصر", "التفاعلات الكيميائية"],
  //  });
  //  this.createExam({
  //    weekId: 2,
  //    day: "الأربعاء",
  //    subject: "biology",
  //    date: "20 أكتوبر 2023",
  //    topics: ["علم الوراثة", "الجهاز العصبي"],
  //  });
  //  // Create sample quizzes
  //  this.createQuiz({
  //    title: "اختبار الرياضيات - المشتقات",
  //    subject: "math",
  //    creator: "أحمد محمد",
  //    description: "اختبار في حساب التفاضل والمشتقات للصف الثاني عشر",
  //    questions: [
  //      {
  //        question: "ما هي مشتقة الدالة f(x) = x²؟",
  //        options: ["f'(x) = x", "f'(x) = 2x", "f'(x) = 2", "f'(x) = x²"],
  //        correctAnswer: 1
  //      },
  //      {
  //        question: "ما هي مشتقة الدالة f(x) = sin(x)؟",
  //        options: ["f'(x) = cos(x)", "f'(x) = -sin(x)", "f'(x) = tan(x)", "f'(x) = -cos(x)"],
  //        correctAnswer: 0
  //      }
  //    ],
  //  });
  //  this.createQuiz({
  //    title: "اختبار الفيزياء - قوانين نيوتن",
  //    subject: "physics",
  //    creator: "سارة أحمد",
  //    description: "اختبار في قوانين نيوتن للحركة",
  //    questions: [
  //      {
  //        question: "ما هو القانون الأول لنيوتن؟",
  //        options: [
  //          "قانون البقاء",
  //          "قانون التسارع",
  //          "قانون رد الفعل",
  //          "قانون الجاذبية"
  //        ],
  //        correctAnswer: 0
  //      },
  //      {
  //        question: "ما هي وحدة قياس القوة في النظام الدولي؟",
  //        options: ["نيوتن", "جول", "واط", "باسكال"],
  //        correctAnswer: 0
  //      }
  //    ],
  //  });
  //  this.createQuiz({
  //    title: "اختبار اللغة العربية - النحو",
  //    subject: "arabic",
  //    creator: "محمد علي",
  //    description: "اختبار في قواعد النحو والإعراب",
  //    questions: [
  //      {
  //        question: "ما هو إعراب كلمة (كتاب) في جملة: قرأت كتابا مفيدا؟",
  //        options: ["فاعل", "مفعول به", "مبتدأ", "خبر"],
  //        correctAnswer: 1
  //      },
  //      {
  //        question: "ما هو جمع كلمة (قلم)؟",
  //        options: ["أقلام", "قلمات", "قلمون", "قالم"],
  //        correctAnswer: 0
  //      }
  //    ],
  //  });
  //}
};
var storage = new MemStorage();

// server/routes.ts
import multer from "multer";
import path2 from "path";
import fs2 from "fs";
import { fileURLToPath as fileURLToPath2 } from "url";
import { parseISO, setHours } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
var __dirname2 = path2.dirname(fileURLToPath2(import.meta.url));
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  }
});
var uploadsDir2 = path2.join(__dirname2, "../uploads");
if (!fs2.existsSync(uploadsDir2)) {
  fs2.mkdirSync(uploadsDir2, { recursive: true });
}
async function registerRoutes(app2) {
  app2.use("/uploads", express.static(path2.join(__dirname2, "../uploads")));
  app2.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const isValid = await storage.validateAdmin(username, password);
    if (isValid) {
      return res.status(200).json({ message: "Login successful" });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  });
  app2.get("/api/files", async (req, res) => {
    try {
      const subject = req.query.subject;
      const semester = req.query.semester;
      let files2;
      if (subject && semester) {
        const bySubject = await storage.getFilesBySubject(subject);
        files2 = bySubject.filter((file) => file.semester === semester);
      } else if (subject) {
        files2 = await storage.getFilesBySubject(subject);
      } else if (semester) {
        files2 = await storage.getFilesBySemester(semester);
      } else {
        files2 = await storage.getFiles();
      }
      res.json(files2);
    } catch (error) {
      console.error("Error getting files:", error);
      res.status(500).json({ message: "Failed to get files" });
    }
  });
  app2.get("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.getFile(id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json(file);
    } catch (error) {
      console.error("Error getting file:", error);
      res.status(500).json({ message: "Failed to get file" });
    }
  });
  app2.post("/api/files", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      console.log("File upload request:", {
        title: req.body.title,
        subject: req.body.subject,
        semester: req.body.semester,
        fileName: req.file.originalname
      });
      const fileData = {
        title: req.body.title,
        subject: req.body.subject,
        semester: req.body.semester,
        fileName: req.file.originalname,
        filePath: ""
        // Will be set in the storage implementation
      };
      const parseResult = insertFileSchema.safeParse({
        title: req.body.title,
        subject: req.body.subject,
        semester: req.body.semester,
        fileName: req.file.originalname,
        filePath: `/uploads/${req.file.originalname}`
      });
      if (!parseResult.success) {
        console.error("Validation error:", parseResult.error);
        return res.status(400).json({
          message: "Invalid file data",
          errors: parseResult.error.errors
        });
      }
      const file = await storage.createFile(
        parseResult.data,
        req.file.buffer
      );
      res.status(201).json(file);
    } catch (error) {
      console.error("Error creating file:", error);
      res.status(500).json({ message: "Failed to create file" });
    }
  });
  app2.delete("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFile(id);
      if (!deleted) {
        return res.status(404).json({ message: "File not found" });
      }
      res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });
  app2.get("/api/exams", async (req, res) => {
    try {
      const weekId = req.query.weekId ? parseInt(req.query.weekId) : void 0;
      let exams2;
      if (weekId) {
        exams2 = await storage.getExamsByWeek(weekId);
      } else {
        exams2 = await storage.getExams();
      }
      res.json(exams2);
    } catch (error) {
      console.error("Error getting exams:", error);
      res.status(500).json({ message: "Failed to get exams" });
    }
  });
  app2.post("/api/exams", async (req, res) => {
    try {
      const parseResult = insertExamSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid exam data",
          errors: parseResult.error.errors
        });
      }
      const exam = await storage.createExam(parseResult.data);
      res.status(201).json(exam);
    } catch (error) {
      console.error("Error creating exam:", error);
      res.status(500).json({ message: "Failed to create exam" });
    }
  });
  app2.delete("/api/exams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteExam(id);
      if (!deleted) {
        return res.status(404).json({ message: "Exam not found" });
      }
      res.status(200).json({ message: "Exam deleted successfully" });
    } catch (error) {
      console.error("Error deleting exam:", error);
      res.status(500).json({ message: "Failed to delete exam" });
    }
  });
  async function deleteExpiredExams() {
    try {
      const exams2 = await storage.getExams();
      for (const exam of exams2) {
        const examDate = parseISO(exam.date);
        const examDateTime = setHours(examDate, 3);
        examDateTime.setMinutes(30);
        const currentTimeUTC = /* @__PURE__ */ new Date();
        const saudiArabiaTimeZone = "Asia/Riyadh";
        const currentTimeSaudiArabia = new Date(formatInTimeZone(currentTimeUTC, saudiArabiaTimeZone, "yyyy-MM-dd'T'HH:mm:ssXXX"));
        if (examDateTime <= currentTimeSaudiArabia) {
          await storage.deleteExam(exam.id);
          console.log(`Exam with id ${exam.id} deleted automatically.`);
        }
      }
    } catch (error) {
      console.error("Error deleting expired exams:", error);
    }
  }
  setInterval(deleteExpiredExams, 60 * 1e3);
  app2.get("/api/quizzes", async (_req, res) => {
    try {
      const quizzes2 = await storage.getQuizzes();
      res.json(quizzes2);
    } catch (error) {
      console.error("Error getting quizzes:", error);
      res.status(500).json({ message: "Failed to get quizzes" });
    }
  });
  app2.get("/api/quizzes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quiz = await storage.getQuiz(id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      console.error("Error getting quiz:", error);
      res.status(500).json({ message: "Failed to get quiz" });
    }
  });
  app2.get("/api/quizzes/code/:code", async (req, res) => {
    try {
      const code = req.params.code;
      const quiz = await storage.getQuizByCode(code);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      console.error("Error getting quiz by code:", error);
      res.status(500).json({ message: "Failed to get quiz" });
    }
  });
  app2.post("/api/quizzes", async (req, res) => {
    try {
      const parseResult = insertQuizSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid quiz data",
          errors: parseResult.error.errors
        });
      }
      const quiz = await storage.createQuiz(parseResult.data);
      res.status(201).json(quiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });
  app2.delete("/api/quizzes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteQuiz(id);
      if (!deleted) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.status(200).json({ message: "Quiz deleted successfully" });
    } catch (error) {
      console.error("Error deleting quiz:", error);
      res.status(500).json({ message: "Failed to delete quiz" });
    }
  });
  app2.get("/api/quiz-attempts/:quizId", async (req, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      const attempts = await storage.getQuizAttempts(quizId);
      res.json(attempts);
    } catch (error) {
      console.error("Error getting quiz attempts:", error);
      res.status(500).json({ message: "Failed to get quiz attempts" });
    }
  });
  app2.post("/api/quiz-attempts", async (req, res) => {
    try {
      const parseResult = insertQuizAttemptSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid quiz attempt data",
          errors: parseResult.error.errors
        });
      }
      const attempt = await storage.createQuizAttempt(parseResult.data);
      res.status(201).json(attempt);
    } catch (error) {
      console.error("Error creating quiz attempt:", error);
      res.status(500).json({ message: "Failed to create quiz attempt" });
    }
  });
}

// server/vite.ts
import express2 from "express";
import fs3 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid as nanoid2 } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid2()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = createServer(app);
  await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
