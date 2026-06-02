/**
 * OCR Script for Qsure API Documentation
 * 
 * This script processes all JPG scans from the Qsure PDF and extracts text using Google Cloud Vision API directly
 * 
 * Usage: node scripts/ocr-qsure-pdf.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const INPUT_DIR = path.join(__dirname, '../docs/collection/pdfscan');
const OUTPUT_FILE = path.join(__dirname, '../docs/collection/QSURE_API_DOCUMENTATION_OCR.txt');
const KEY_PATH = path.join(__dirname, '../google-vision-key.json');

// Load Google Cloud credentials
let credentials;
try {
  credentials = JSON.parse(fs.readFileSync(KEY_PATH, 'utf-8'));
} catch (error) {
  console.error('❌ Failed to load google-vision-key.json');
  console.error('Make sure the file exists in apps/frontend/');
  process.exit(1);
}

// Generate JWT token for Google Cloud Vision API
async function getAccessToken() {
  const { client_email, private_key } = credentials;
  
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600;
  
  const payload = {
    iss: client_email,
    scope: 'https://www.googleapis.com/auth/cloud-vision',
    aud: 'https://oauth2.googleapis.com/token',
    exp: expiry,
    iat: now,
  };
  
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(private_key, 'base64url');
  
  const jwt = `${signatureInput}.${signature}`;
  
  // Exchange JWT for access token
  const https = require('https');
  const querystring = require('querystring');
  
  const postData = querystring.stringify({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  });
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length,
      },
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response.access_token);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function processImage(imagePath) {
  try {
    // Read image file
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Get access token
    const accessToken = await getAccessToken();
    
    // Call Google Cloud Vision API
    const https = require('https');
    
    const requestBody = JSON.stringify({
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: 'TEXT_DETECTION' }],
        },
      ],
    });
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'vision.googleapis.com',
        path: '/v1/images:annotate',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody),
        },
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.responses && response.responses[0] && response.responses[0].fullTextAnnotation) {
              resolve(response.responses[0].fullTextAnnotation.text);
            } else {
              resolve('');
            }
          } catch (error) {
            reject(error);
          }
        });
      });
      
      req.on('error', reject);
      req.write(requestBody);
      req.end();
    });
    
  } catch (error) {
    console.error(`Failed to process ${path.basename(imagePath)}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting Qsure PDF OCR processing...\n');
  
  // Check if input directory exists
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ Input directory not found: ${INPUT_DIR}`);
    process.exit(1);
  }
  
  // Get all JPG files
  const files = fs.readdirSync(INPUT_DIR)
    .filter(file => file.toLowerCase().endsWith('.jpg'))
    .sort(); // Sort to maintain page order
  
  if (files.length === 0) {
    console.error('❌ No JPG files found in input directory');
    process.exit(1);
  }
  
  console.log(`📄 Found ${files.length} pages to process\n`);
  
  // Process each image
  let allText = '';
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imagePath = path.join(INPUT_DIR, file);
    
    console.log(`[${i + 1}/${files.length}] Processing: ${file}`);
    
    const text = await processImage(imagePath);
    
    if (text) {
      allText += `\n\n========== PAGE ${i + 1}: ${file} ==========\n\n`;
      allText += text;
      successCount++;
      console.log(`✅ Success (${text.length} characters)\n`);
    } else {
      failCount++;
      console.log(`❌ Failed\n`);
    }
    
    // Add delay to avoid rate limiting
    if (i < files.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Save output
  fs.writeFileSync(OUTPUT_FILE, allText, 'utf-8');
  
  console.log('\n✅ OCR processing complete!');
  console.log(`📊 Results: ${successCount} success, ${failCount} failed`);
  console.log(`💾 Output saved to: ${OUTPUT_FILE}`);
  console.log(`📏 Total characters extracted: ${allText.length}`);
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
