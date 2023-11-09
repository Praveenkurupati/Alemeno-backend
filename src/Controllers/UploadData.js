// controllers/uploadController.js

const multer = require('multer');
const ExcelJS = require('exceljs');
const { Customer } = require('../Db_Schemas/Db_Schemas');

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Set your upload directory

exports.uploadCustomers = upload.single('customerFile', (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const workbook = new ExcelJS.Workbook();
  const fileBuffer = req.file.buffer;
  console.log(fileBuffer)

  workbook.xlsx.load(fileBuffer).then((workbook) => {
    const worksheet = workbook.getWorksheet(1); // Assuming data is on the first worksheet

    const data = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // Skip the header row
        return;
      }

      const values = row.values;
      data.push({
        customer_id: values[1],
        first_name: values[2],
        last_name: values[3],
        age: values[4],
        phone_number: values[5],
        monthly_salary: values[6],
        approved_limit: values[7],
      });
    });

    // Process the data and insert it into the database
    Customer.bulkCreate(data)
      .then(() => {
        res.status(200).json({ message: 'Data uploaded successfully' });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ message: 'Error uploading data' });
      });
  });
});



exports.uploadLoans = upload.single('loanFile', (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const workbook = new ExcelJS.Workbook();
  const fileBuffer = req.file.buffer;

  workbook.xlsx.load(fileBuffer).then((workbook) => {
    const worksheet = workbook.getWorksheet(1); // Assuming data is on the first worksheet

    const data = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // Skip the header row
        return;
      }

      const values = row.values;
      data.push({
        customer_id: values[1],
        loan_id: values[2],
        loan_amount: values[3],
        tenure: values[4],
        interest_rate: values[5],
        monthly_payment: values[6],
        EMIs_paid_on_Time: values[7],
        start_date: new Date(values[8]),
        end_date: new Date(values[9]),
      });
    });

    // Process the data and insert it into the database
    Loan.bulkCreate(data)
      .then(() => {
        res.status(200).json({ message: 'Loan data uploaded successfully' });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ message: 'Error uploading loan data' });
      });
  });
});