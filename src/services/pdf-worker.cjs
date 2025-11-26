const fs = require('fs').promises;

async function extractPdf(filePath) {
  try {
    // On charge le module ici pour capturer l'erreur si le module est manquant
    const pdf = require('pdf-parse');
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    // On renvoie l'erreur sous forme de texte pour ne pas crasher le worker
    throw new Error(`Erreur worker PDF : ${error.message}`);
  }
}

if (process.send) {
  process.on('message', async (message) => {
    try {
      const text = await extractPdf(message.filePath);
      process.send({ success: true, text });
    } catch (error) {
      process.send({ success: false, error: error.message });
    }
  });
}