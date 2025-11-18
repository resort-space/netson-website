const fs = require('fs');

// Read .env as UTF-16LE and write as UTF-8
try {
    const content = fs.readFileSync('.env', 'utf16le').replace(/^\ufeff/, '');
    fs.writeFileSync('.env', content, 'utf8');
    console.log('✅ .env fixed to UTF-8 encoding');
} catch (error) {
    console.error('❌ Error fixing .env:', error);
}