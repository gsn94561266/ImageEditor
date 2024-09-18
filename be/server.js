const express = require("express");
const multer = require("multer");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads")); // 設定上傳目錄
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // 使用原始文件名
  },
});

const upload = multer({ storage: storage });

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 使用 multer 中間件處理文件上傳
app.post("/upload", upload.single("file"), async (req, res) => {
  const action = req.body.action;
  const filePath = path.join(__dirname, "uploads", req.file.originalname);

  try {
    if (action === "new" && fs.existsSync(filePath)) {
      // 檢查文件是否存在
      return res.status(409).send("File already exists");
    }

    res.status(200).send("File uploaded and replaced successfully");
  } catch (error) {
    console.error("Error handling file upload:", error);
    res.status(500).send("Failed to upload file");
  }
});

app.use((req, res) => {
  console.log("Here is 404");
  res.status(404).send("There is no such page");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running at port ${process.env.PORT}`);
});
