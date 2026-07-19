/**
 * run once: node reset-password.js
 * Reads ADMIN_PASSWORD from .env, hashes it, and updates data/db.json
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');
const password = process.env.ADMIN_PASSWORD || 'admin124';

if (!fs.existsSync(DB_PATH)) {
    console.error('❌  data/db.json not found. Start the server once first, then re-run this script.');
    process.exit(1);
}

const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const hash = bcrypt.hashSync(password, 10);
db.admin.passwordHash = hash;
fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 4));

console.log('✅  Password reset successfully!');
console.log(`    Username : ${db.admin.username}`);
console.log(`    Password : ${password}`);
console.log('\n👉  Now restart the server: node server.js');
