const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const pool = require('./utils/db');

const app = express();

app.use(express.static(path.join(__dirname, '../client/build')));

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads')); // 設定上傳目錄
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // 使用原始文件名
  },
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 使用 multer 中間件處理文件上傳
app.post('/uplaodFile', upload.single('file'), async (req, res) => {
  const action = req.body.action;
  const filePath = path.join(__dirname, 'uploads', req.file.originalname);

  try {
    if (action === 'new' && fs.existsSync(filePath)) {
      // 檢查文件是否存在
      return res.status(409).send('File already exists');
    }

    res.status(200).send('File uploaded and replaced successfully');
  } catch (error) {
    console.error('Error handling file upload:', error);
    res.status(500).send('Failed to upload file');
  }
});

app.get('/getTemplate', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM template WHERE status = 1'
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).send('Failed to fetch templates');
  }
});

app.post('/createTemplate', async (req, res) => {
  const { name, content } = req.body;
  // 驗證
  if (!name || !content) {
    return res.status(400).send('Name or template does not exist');
  }

  try {
    await pool.execute(
      'INSERT INTO template (name, content, status) VALUES (?, ?, 1)',
      [name, JSON.stringify(content)]
    );

    res.status(201).send('Template saved successfully.');
  } catch (error) {
    console.error('Error handling template save:', error);
    res.status(500).send('Failed to save template');
  }
});

app.post('/deleteTemplate', async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).send('Template ID does not exist');
  }

  try {
    const [rows] = await pool.execute('SELECT * FROM template WHERE id = ?', [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).send('Template not found.');
    }

    await pool.execute('UPDATE template SET Status = 0 WHERE id = ?', [id]);

    res.status(200).send('Template deleted successfully.');
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).send('Failed to delete template.');
  }
});

app.use((req, res) => {
  console.log('Here is 404');
  res.status(404).send('There is no such page');
});

app.listen(process.env.PORT, () => {
  console.log(`Server running at port ${process.env.PORT}`);
});
