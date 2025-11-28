
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const admin = require('firebase-admin');
const { Firestore } = require('@google-cloud/firestore');
const fs = require('fs');
const path = require('path');

// The Firebase Admin SDK and Google Cloud Firestore library will automatically
// use the service account credentials specified in the GOOGLE_APPLICATION_CREDENTIALS
// environment variable. We load this from the .env file.

// Initialize Firebase Admin SDK - this is still useful for auth handling
try {
  admin.initializeApp({
    projectId: process.env.PROJECT_ID,
  });
  console.log(`Firebase Admin SDK initialized for project: ${process.env.PROJECT_ID}`);
} catch (error) {
    // A project can only be initialized once
  if (error.code !== 'app/duplicate-app') {
    console.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1);
  }
}

// Create a Firestore client pointing to the specific database
const db = new Firestore({
    projectId: process.env.PROJECT_ID,
    databaseId: process.env.FIRESTORE_ID,
});
console.log(`Attempting to connect to Firestore database: '${process.env.FIRESTORE_ID}' in project '${process.env.PROJECT_ID}'`);


const dataDir = path.join(__dirname, '../data');

// Corrected filenames to match the actual files in the /data directory.
const filesToProcess = {
  'geojson': ['berlin.json', 'milan.json'],
  'report': ['berlin.report.json', 'milan.report.json']
};

async function uploadData() {
  for (const collectionName in filesToProcess) {
    const filenames = filesToProcess[collectionName];

    for (const filename of filenames) {
      const filepath = path.join(dataDir, filename);
      try {
        const fileContent = fs.readFileSync(filepath, 'utf8');
        let data = fileContent.trim() === '' ? {} : JSON.parse(fileContent);

        // Fix for GeoJSON nested arrays: Stringify the geometry object.
        // This is done because Firestore cannot handle nested arrays deeper than 20 levels.
        if (collectionName === 'geojson' && data.features && Array.isArray(data.features)) {
            data.features.forEach(feature => {
                if (feature.geometry) {
                    feature.geometry = JSON.stringify(feature.geometry);
                }
            });
        }

        let docName;
        if (collectionName === 'report') {
            // For 'berlin.report.json', create doc 'berlin'
            docName = filename.replace('.report.json', '');
        } else {
            // For 'berlin.json', create doc 'berlin'
            docName = filename.replace('.json', '');
        }


        const docRef = db.collection(collectionName).doc(docName);
        await docRef.set(data);
        console.log(`Successfully uploaded ${filename} to collection '${collectionName}' with document name '${docName}'`);

      } catch (error) {
        if (error.code === 'ENOENT') {
          // Make the error message more tolerant as not all sample data might exist
          console.log(`Optional file not found, skipping: ${filepath}`);
        } else if (error instanceof SyntaxError) {
          console.error(`Error parsing JSON from file: ${filepath}`, error);
        } else {
          console.error(`An error occurred while processing ${filepath}:`, error);
        }
      }
    }
  }
  console.log('Data upload script finished.');
}

uploadData();
