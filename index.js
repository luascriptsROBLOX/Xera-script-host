const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;

let lastPostTime = Date.now();
let postCount = 0;

app.use(express.static('public'));
app.use(bodyParser.text());

app.use('/scripts', (req, res, next) => {
  const now = Date.now();
  const elapsedTime = now - lastPostTime;

  if (elapsedTime < 5000) {
    return res.status(429).send('Rate limit exceeded. Please try again later.');
  }

  if (elapsedTime >= 120000) {
    lastPostTime = now;
    postCount = 0;
  }

  if (postCount >= 100) {
    return res.status(429).send('Rate limit exceeded. Please try again later.');
  }

  lastPostTime = now;
  postCount++;
  next();
});

app.post('/scripts', (req, res) => {
  const codeContent = req.body;

  if (codeContent.trim() !== "") {
    const fileName = generateRandomFileName();
    const filePath = path.join(__dirname, 'public', 'scripts', `${fileName}.html`);

    fs.writeFile(filePath, codeContent, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log(`File ${fileName}.html created successfully.`);
        return res.send(`${fileName}.html`);
      }
    });
  } else {
    res.status(400).send('Bad Request: Please provide code content.');
  }
});

function generateRandomFileName() {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
