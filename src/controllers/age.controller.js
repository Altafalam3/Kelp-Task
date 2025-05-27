import { pool } from '../config/database.js';
import CSVService from '../services/csv.service.js';

const AgeController = {
   getAgeDistribution: async (req, res) => {
      try {
         const result = await pool.query('SELECT age FROM users');
         const records = result.rows.map(row => ({ name: '', age: row.age }));
         const distribution = CSVService.calculateAgeDistribution(records);
         const count = records.length;

         console.log(`Total rows processed for age distribution: ${count}`);

         // Print age distribution report
         console.log('\nAge-Group % Distribution');
         console.log('< 20:', distribution.under20 + '%');
         console.log('20 to 40:', distribution['20to40'] + '%');
         console.log('40 to 60:', distribution['40to60'] + '%');
         console.log('> 60:', distribution.over60 + '%');

         res.status(200).json({
            ageDistribution: distribution,
            recordsProcessed: count
         });
      } catch (error) {
         console.error('Error fetching age distribution:', error);
         res.status(500).json({ error: 'Failed to fetch age distribution' });
      }
   }
};

export { AgeController };
