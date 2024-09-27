const crypto = require('crypto');

// Key and IV for encryption/decryption (use environment variables in production)
const algorithm = 'aes-256-cbc';  // Advanced Encryption Standard
const key = crypto.randomBytes(32);  // 32 bytes key for AES-256
const iv = crypto.randomBytes(16);  // 16 bytes IV

// Encrypt function
function encrypt(text) {
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text.toString());
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

// Decrypt function
function decrypt(text) {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = { encrypt, decrypt };


