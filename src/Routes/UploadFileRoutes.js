const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const excel = require('exceljs');
const db = require('../Db_connection/config');

// Define the destination for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads'); // Replace 'uploads' with your folder name
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Define a generic function to handle file uploads and data insertion
function handleFileUpload(req, res, tableName, columnNames, successMessage) {
  const workbook = new excel.Workbook();
  workbook.xlsx.readFile(req.file.path)
    .then(() => {
      const worksheet = workbook.getWorksheet(1);
      const insertPromises = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const data = {};

          for (let i = 0; i < columnNames.length; i++) {
            data[columnNames[i]] = row.getCell(i + 1).value;
          }

          const insertQuery = {
            text: `INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES (${columnNames.map((_, index) => `$${index + 1}`).join(', ')})`,
            values: columnNames.map((column) => data[column]),
          };

          insertPromises.push(db.query(insertQuery));
        }
      });

      Promise.all(insertPromises)
        .then(() => {
          res.status(200).json({ message: successMessage });
        })
        .catch((err) => {
          res.status(500).json({ message: 'An error occurred while inserting data into the database' });
        });
    })
    .catch((err) => {
      res.status(500).json({ message: 'An error occurred while processing the Excel file' });
    });
}

router.post('/upload-customer-data', upload.single('customerData'), (req, res) => {
  handleFileUpload(req, res, 'customers', ['first_name', 'last_name', 'phone_number', 'monthly_salary', 'approved_limit', 'current_debt'], 'Customer data uploaded successfully');
});

router.post('/ingest-loan-data', upload.single('loanData'), (req, res) => {
  handleFileUpload(req, res, 'loans', ['customer_id', 'loan_id', 'loan_amount', 'tenure', 'interest_rate', 'monthly_repayment', 'emis_paid_on_time', 'start_date', 'end_date'], 'Loan data ingested successfully');
});

module.exports = router;
