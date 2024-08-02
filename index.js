const express = require('express');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const wss = new WebSocket('ws://localhost:8080'); // substitua pela URL do seu servidor WebSocket

const imagensDir = path.join(__dirname, 'imagens');
const audiosDir = path.join(__dirname, 'audios');

let imagemAtual = 0;
let imagemEnviada = false;

// Conecta ao servidor WebSocket
wss.on('open', () => {
  console.log('Conectado ao servidor WebSocket');
});

// Envia uma imagem a cada 10 segundos
setInterval(() => {
  if (!imagemEnviada) {
    const imagem = fs.readdirSync(imagensDir)[imagemAtual];
    const imagemPath = path.join(imagensDir, imagem);
    const imagemBuffer = fs.readFileSync(imagemPath);

    wss.send(imagemBuffer, (err) => {
      if (err) {
        console.error('Erro ao enviar imagem:', err);
      } else {
        imagemEnviada = true;
        console.log(`Imagem ${imagem} enviada`);
      }
    });
  }
}, 10000);

// Recebe o arquivo de áudio e salva em uma pasta
wss.on('message', (audioBuffer) => {
  const audioPath = path.join(audiosDir, `audio_${imagemAtual}.mp3`);
  fs.writeFileSync(audioPath, audioBuffer);
  console.log(`Áudio salvo em ${audioPath}`);

  imagemEnviada = false;
  imagemAtual = (imagemAtual + 1) % fs.readdirSync(imagensDir).length;
});

app.listen(3000, () => {
  console.log('Servidor BFF rodando na porta 3000');
});