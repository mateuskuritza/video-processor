import multer from 'multer';
import path from 'path';

// Configuração do Multer para armazenar os uploads na pasta "uploads"
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

export const upload = multer({ 
    limits: {
        fileSize: 800 * 1024 * 1024, // 800mb
    },
    storage
 });