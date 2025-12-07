const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');
const apiUrl = process.env.API_URL || 'http://localhost:3000';

const content = `export const environment = {
  // Ruta de la API
  API_URL: '${apiUrl}',
};
`;

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, content, { encoding: 'utf8' });
console.log(`Wrote environment file to ${targetPath}`);
