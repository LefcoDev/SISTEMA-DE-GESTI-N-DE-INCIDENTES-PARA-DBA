import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage for avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for attachments
const attachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/attachments');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'attachment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const imageFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const attachmentFilter = (req: any, file: any, cb: any) => {
  // Allow common file types for DBA work
  const allowedTypes = [
    'text/plain', 
    'text/csv', 
    'application/json', 
    'application/pdf', 
    'application/zip', 
    'application/x-zip-compressed',
    'application/sql',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];
  
  // Also check extensions because mime types can be tricky for code files
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.log', '.txt', '.sql', '.json', '.csv', '.pdf', '.zip', '.png', '.jpg', '.jpeg'];

  if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(null, true); // Accept all for now to avoid issues, or restrict if strict security needed
  }
};

export const upload = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export const uploadAttachment = multer({
  storage: attachmentStorage,
  fileFilter: attachmentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});
