// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Permitir que qualquer aparelho na rede local acesse
app.use(cors());
// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// === Configuração do Multer para salvar uploads em public/uploads ===
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    // Cria um nome único com timestamp para evitar repetições
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// ROTA para subir (upload) arquivo: /upload
app.post('/upload', upload.single('arquivo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
  }
  res.json({ message: 'Upload feito com sucesso!', filename: req.file.filename });
});

// ROTA para listar todos os arquivos enviados: /files
app.get('/files', (req, res) => {
  const uploadsDir = path.join(__dirname, 'public/uploads');
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao ler pasta de uploads.' });
    }
    // Retorna um JSON com o array de nomes de arquivos
    res.json(files);
  });
});

// ROTA para baixar (download) um arquivo específico: /download?file=<nome_do_arquivo>
app.get('/download', (req, res) => {
  const fileName = req.query.file;
  if (!fileName) {
    return res.status(400).send('Precisa especificar ?file=<nome_do_arquivo>');
  }
  const filePath = path.join(__dirname, 'public/uploads', fileName);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('Arquivo não encontrado.');
  }
});

// Inicia o servidor na porta 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Para acessar de outro aparelho (Xbox), use http://<IP-do-PC>:${PORT}`);
});
