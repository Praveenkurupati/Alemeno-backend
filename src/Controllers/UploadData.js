const excel = require('exceljs');
const db = require('../Db_connection/config')


exports.insertCustomerData = (req, res) => {
    const workbook = new excel.Workbook();
    workbook.xlsx.readFile(req.file.path) // Use the path of the uploaded file
      .then(() => {
        const worksheet = workbook.getWorksheet(1);
        const insertPromises = [];
  
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            const customer = {
              first_name: row.getCell(2).value,
              last_name: row.getCell(3).value,
              phone_number: row.getCell(4).value,
              monthly_salary: row.getCell(5).value,
              approved_limit: row.getCell(6).value,
              current_debt: row.getCell(7).value,
            };
  
            const insertQuery = {
              text: 'INSERT INTO customers (first_name, last_name, phone_number, monthly_salary, approved_limit, current_debt) VALUES ($1, $2, $3, $4, $5, $6)',
              values: [
                customer.first_name,
                customer.last_name,
                customer.phone_number,
                customer.monthly_salary,
                customer.approved_limit,
                customer.current_debt,
              ],
            };
  
            insertPromises.push(db.query(insertQuery));
          }
        });
  
        Promise.all(insertPromises)
          .then(() => {
            res.status(200).json({ message: 'Customer data uploaded successfully' });
          })
          .catch((err) => {
            res.status(500).json({ message: 'An error occurred while inserting data into the database' });
          });
      })
      .catch((err) => {
        res.status(500).json({ message: 'An error occurred while processing the Excel file' });
      });
  };



exports.ingestLoanData = (req, res) => {
    const workbook = new excel.Workbook();
    workbook.xlsx.readFile(req.file.path) // Use the path of the uploaded file
      .then(() => {
        const worksheet = workbook.getWorksheet(1);
        const insertPromises = [];
  
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            const loan = {
              customer_id: row.getCell(1).value,
              loan_id: row.getCell(2).value,
              loan_amount: row.getCell(3).value,
              tenure: row.getCell(4).value,
              interest_rate: row.getCell(5).value,
              monthly_repayment: row.getCell(6).value,
              emis_paid_on_time: row.getCell(7).value,
              start_date: row.getCell(8).value,
              end_date: row.getCell(9).value,
            };
  
            const insertQuery = {
              text: 'INSERT INTO loans (customer_id, loan_id, loan_amount, tenure, interest_rate, monthly_repayment, emis_paid_on_time, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
              values: [
                loan.customer_id,
                loan.loan_id,
                loan.loan_amount,
                loan.tenure,
                loan.interest_rate,
                loan.monthly_repayment,
                loan.emis_paid_on_time,
                loan.start_date,
                loan.end_date,
              ],
            };
  
            insertPromises.push(db.query(insertQuery));
          }
        });
  
        Promise.all(insertPromises)
          .then(() => {
            res.status(200).json({ message: 'Loan data ingested successfully' });
          })
          .catch((err) => {
            res.status(500).json({ message: 'An error occurred while ingesting data into the database' });
          });
      })
      .catch((err) => {
        res.status(500).json({ message: 'An error occurred while processing the Excel file' });
      });
  };
  


