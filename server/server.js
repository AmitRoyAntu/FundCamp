import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment configuration
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import app from './app.js';

const PORT = parseInt(process.env.SERVER_PORT || process.env.PORT || '5001', 10) || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CampFund Server running on port ${PORT}`);
});
