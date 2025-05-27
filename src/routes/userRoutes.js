import express from 'express';
import multer from 'multer';
import { CSVController } from '../controllers/csv.controller.js';
import { AgeController } from '../controllers/age.controller.js';

const router = express.Router();

const uploadDir = process.env.CSV_UPLOAD_PATH || './uploads';
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, uploadDir);
   },
   filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
   }
});
const upload = multer({ storage });

router.post('/upload-csv', upload.single('csvFile'), CSVController.uploadAndProcess);

router.get('/age-distribution', AgeController.getAgeDistribution);

export default router;
