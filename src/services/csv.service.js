import fs from 'fs';
import util from 'util';
const readFile = util.promisify(fs.readFile);

const CSVService = {
   // Handles nested property assignment for dot notation keys
   processComplexProperty: (obj, key, value) => {
      const parts = key.split('.');
      let current = obj;

      for (let i = 0; i < parts.length - 1; i++) {
         const part = parts[i];
         if (!(part in current)) {
            current[part] = {};
         }
         current = current[part];
      }

      current[parts[parts.length - 1]] = value;
   },

   // Parses a single CSV line into an array of values
   parseCSVLine: (line) => {
      const values = [];
      let currentValue = '';
      let withinQuotes = false;

      for (let i = 0; i < line.length; i++) {
         const char = line[i];
         if (char === '"') {
            withinQuotes = !withinQuotes;
         }
         else if (char === ',' && !withinQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
         }
         else {
            currentValue += char;
         }
      }

      values.push(currentValue.trim());
      return values;
   },

   // Reads and parses a CSV file into user records
   parseCSVFile: async (filePath) => {
      try {
         let fileContent = await readFile(filePath, 'utf-8');

         if (fileContent.charCodeAt(0) === 0xFEFF) {
            fileContent = fileContent.slice(1);
         }

         const allLines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');
         if (allLines.length < 2) {
            throw new Error('CSV file must contain headers and at least one data row');
         }

         const headers = CSVService.parseCSVLine(allLines[0]);
         const records = [];

         for (let i = 1; i < allLines.length; i++) {
            const values = CSVService.parseCSVLine(allLines[i]);

            if (values.length !== headers.length) {
               console.log(`Header/values length mismatch at line ${i + 1}: headers=${headers.length}, values=${values.length}`);
               console.log('Line content:', allLines[i]);
               continue;
            };

            const rawRecord = {};
            const complexRecord = {};
            headers.forEach((header, index) => {
               if (header.includes('.')) {
                  CSVService.processComplexProperty(complexRecord, header, values[index]);
               } else {
                  rawRecord[header] = values[index];
               }
            });

            const address = complexRecord.address || null;
            const additional_info = {};

            for (const key in complexRecord) {
               if (key !== 'name' && key !== 'address') {
                  additional_info[key] = complexRecord[key];
               }
            }

            for (const key in rawRecord) {
               if (key !== 'age' && key !== 'name.firstName' && key !== 'name.lastName') {
                  additional_info[key] = rawRecord[key];
               }
            }

            const userRecord = {
               name: `${(complexRecord.name?.firstName || '')} ${(complexRecord.name?.lastName || '')}`.trim(),
               age: parseInt(rawRecord.age) || 0,
               address,
               additional_info
            };

            records.push(userRecord);
         }

         return records;
      } catch (error) {
         console.error('Error parsing CSV file:', error);
         throw error;
      }
   },

   // Calculates age group distribution from user records
   calculateAgeDistribution: (records) => {
      const distribution = {
         'under20': 0,
         '20to40': 0,
         '40to60': 0,
         'over60': 0
      };

      const total = records.length;
      if (total === 0) return distribution;

      records.forEach(record => {
         if (record.age < 20) distribution.under20++;
         else if (record.age <= 40) distribution['20to40']++;
         else if (record.age <= 60) distribution['40to60']++;
         else distribution.over60++;
      });

      return Object.fromEntries(
         Object.entries(distribution).map(([key, value]) => [
            key,
            Math.round((value / total) * 100)
         ])
      );
   }
};

export default CSVService;
