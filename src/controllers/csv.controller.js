import { pool } from '../config/database.js';
import CSVService from '../services/csv.service.js';

const CSVController = {
   // inserting csv data into db
   uploadAndProcess: async (req, res) => {
      try {
         if (!req.file) {
            res.status(400).json({ error: 'No CSV file uploaded' });
            return;
         }
         const filePath = req.file.path;

         const records = await CSVService.parseCSVFile(filePath);

         for (const record of records) {
            await pool.query(
               'INSERT INTO users (name, age, address, additional_info) VALUES ($1, $2, $3, $4)',
               [record.name, record.age, record.address, record.additional_info]
            );
         }

         res.status(201).json({
            message: 'CSV file processed successfully',
            recordsProcessed: records.length
         });
      } catch (error) {
         console.error('Error processing CSV file:', error);
         res.status(500).json({ error: 'Failed to process CSV file' });
      }
   }
};

export { CSVController };
