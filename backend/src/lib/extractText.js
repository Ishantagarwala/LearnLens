import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

export async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);

  switch (ext) {
    case '.pdf': {
      const data = await pdf(buffer);
      return data.text;
    }
    case '.docx':
    case '.doc': {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case '.txt': {
      return buffer.toString('utf-8');
    }
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}
