// const fs = require('fs');
// const path = require('path');
// const multer = require('multer');

// // Ensure the uploads directory exists
// const uploadDir = path.join('uploads/songs');


// console.log('Upload directory:', uploadDir);

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Function to generate a unique filename
// function getUniqueFilename(destination, originalName) {
//   const extension = path.extname(originalName); // Get the file extension (e.g., .mp3)
//   const baseName = path.basename(originalName, extension); // Get the base name of the file (without extension)
//   let newFilename = originalName;
//   let counter = 1;

//   // Check if a file with the same name already exists
//   while (fs.existsSync(path.join(destination, newFilename))) {
//     newFilename = `${baseName}-${counter}${extension}`; // Add index if file exists
//     counter++;
//   }

//   return newFilename;
// }

// // Multer configuration
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir); // Upload directory
//   },
//   filename: function (req, file, cb) {
//     const uniqueFilename = getUniqueFilename(uploadDir, file.originalname); // Generate a unique filename
//     cb(null, uniqueFilename); // Return the unique filename
//   }
// });

// const upload = multer({ storage: storage });

// module.exports = upload;




const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Define the absolute path to the uploads folder (for file system operations)
const absoluteUploadDir = path.join(__dirname, '..', 'public', 'uploads', 'songs');

// Ensure the uploads directory exists
if (!fs.existsSync(absoluteUploadDir)) {
  fs.mkdirSync(absoluteUploadDir, { recursive: true });
}

// Function to generate a unique filename (replacing spaces with hyphens)
function getUniqueFilename(destination, originalName) {
  const extension = path.extname(originalName); // Get the file extension (e.g., .mp3)
  const baseName = path.basename(originalName, extension).replace(/\s+/g, '-'); // Replace spaces with hyphens
  let newFilename = `${baseName}${extension}`;
  let counter = 1;

  // Check if a file with the same name already exists
  while (fs.existsSync(path.join(destination, newFilename))) {
    newFilename = `${baseName}-${counter}${extension}`; // Add index if file exists
    counter++;
  }

  return newFilename;
}

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, absoluteUploadDir); // Upload directory (for file system)
  },
  filename: function (req, file, cb) {
    const uniqueFilename = getUniqueFilename(absoluteUploadDir, file.originalname); // Generate a unique filename
    cb(null, uniqueFilename); // Return the unique filename
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
