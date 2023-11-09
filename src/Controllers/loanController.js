const db = require("../Db_connection/config");


const {
  calculateCreditScore,
  calculateMonthlyInstallment,
} = require("./loanHelper");

exports.checkEligibility = async (req, res) => {
  try {
    const { customer_id, loan_amount, interest_rate, tenure } = req.body;


    const customerQuery = `
      SELECT * FROM customers
      WHERE customer_id = ?;
    `;
    const [customer] = await db.query(customerQuery, [customer_id]);

    if (!customer) {
      return res.status(400).json({ error: "Customer not found" });
    }

    const loanQuery = `
      SELECT * FROM loans
      WHERE customer_id = ?;
    `;
    const customerLoans = await db.query(loanQuery, [customer_id]);


    const creditScore = calculateCreditScore(customer, customerLoans);


    let approval = false;
    let corrected_interest_rate = interest_rate;

    if (creditScore > 50) {
      approval = true;
    } else if (creditScore > 30 && creditScore <= 50) {
      if (interest_rate <= 12) {
        corrected_interest_rate = 16;
      }
    }

    const monthlyInstallment = calculateMonthlyInstallment(
      loan_amount,
      corrected_interest_rate,
      tenure
    );

    res.status(200).json({
      customer_id: customer_id,
      approval: approval,
      interest_rate: interest_rate,
      corrected_interest_rate: corrected_interest_rate,
      tenure: tenure,
      monthly_installment: monthlyInstallment,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while checking loan eligibility." });
  }
};

exports.createLoan = async (req, res) => {
  try {
    const { customer_id, loan_amount, interest_rate, tenure } = req.body;

    const customerQuery = `
      SELECT * FROM customers
      WHERE customer_id = ?;
    `;
    const [customer] = await db.query(customerQuery, [customer_id]);

    if (!customer) {
      return res
        .status(400)
        .json({
          loan_id: null,
          customer_id: customer_id,
          loan_approved: false,
          message: "Customer not found",
        });
    }

    const creditScore = calculateCreditScore(customer, loan_amount, tenure);

    let loanApproved = false;
    let message = "";

    if (creditScore > 50) {
      loanApproved = true;
    } else if (creditScore >= 30 && creditScore <= 50) {
      if (interest_rate <= 12) {
        interest_rate = 16;
        message =
          "Interest rate adjusted to the minimum for the given credit score.";
        loanApproved = true;
      } else {
        message = "Interest rate is too high for the given credit score.";
      }
    } else {
      message = "Loan application rejected due to low credit score.";
    }

    if (loanApproved) {
      const createLoanQuery = `
        INSERT INTO loans (customer_id, loan_amount, interest_rate, tenure, monthly_installment)
        VALUES (?, ?, ?, ?, ?);
      `;
      const loanResult = await db.query(createLoanQuery, [
        customer_id,
        loan_amount,
        interest_rate,
        tenure,
        calculateMonthlyInstallment(loan_amount, interest_rate, tenure),
      ]);

      return res.status(201).json({
        loan_id:loanResult.insertId,
        customer_id: customer_id,
        loan_approved: true,
        message: "Loan application approved",
        monthly_installment: calculateMonthlyInstallment(
          loan_amount,
          interest_rate,
          tenure
        ),
      });
    }

    return res
      .status(200)
      .json({
        loan_id: null,
        customer_id: customer_id,
        loan_approved: false,
        message: message,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        loan_id: null,
        customer_id: null,
        loan_approved: false,
        message: "An error occurred while processing the loan application.",
      });
  }
};

exports.viewLoan = async (req, res) => {
  try {
    const loanId = req.params.loan_id;

    const viewLoanQuery = `
      SELECT loans.loan_id, customers.customer_id, customers.first_name, customers.last_name, customers.phone_number, customers.age, loans.interest_rate, loans.monthly_installment, loans.tenure
      FROM loans
      INNER JOIN customers ON loans.customer_id = customers.customer_id
      WHERE loans.loan_id = ?;
    `;
    const [loanDetails] = await db.query(viewLoanQuery, [loanId]);

    if (!loanDetails) {
      return res.status(404).json({ message: "Loan not found" });
    }

    const loanApproved = true;

    res.status(200).json({
      loan_id: loanDetails.loan_id,
      customer: {
        id: loanDetails.customer_id,
        first_name: loanDetails.first_name,
        last_name: loanDetails.last_name,
        phone_number: loanDetails.phone_number,
        age: loanDetails.age,
      },
      loan_approved: loanApproved,
      interest_rate: loanDetails.interest_rate,
      monthly_installment: loanDetails.monthly_installment,
      tenure: loanDetails.tenure,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching loan details." });
  }
};

exports.makePayment = async (req, res) => {
  try {
    const customerId = req.params.customer_id;
    const loanId = req.params.loan_id;
    const paymentAmount = req.body.payment_amount;

    const customerQuery = `
      SELECT * FROM customers
      WHERE customer_id = ?;
    `;
    const loanQuery = `
      SELECT * FROM loans
      WHERE loan_id = ?;
    `;

    const [customer] = await db.query(customerQuery, [customerId]);
    const [loan] = await db.query(loanQuery, [loanId]);

    if (!customer || !loan) {
      return res.status(404).json({ message: "Customer or loan not found" });
    }

    const remainingBalance = loan.loan_amount - loan.amount_paid;

    const monthlyInstallment = calculateMonthlyInstallment(
      remainingBalance,
      loan.interest_rate,
      loan.tenure
    );

    if (paymentAmount < monthlyInstallment) {
      return res
        .status(400)
        .json({ message: "Payment amount is less than the EMI amount" });
    }

    loan.amount_paid += paymentAmount;


    if (loan.amount_paid >= loan.loan_amount) {
      loan.amount_paid = loan.loan_amount;
    }

    const updateLoanQuery = `
      UPDATE loans
      SET amount_paid = ?
      WHERE loan_id = ?;
    `;
    await db.query(updateLoanQuery, [loan.amount_paid, loanId]);

    res
      .status(200)
      .json({
        message: "Payment successful",
        remaining_balance: loan.loan_amount - loan.amount_paid,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while processing the payment." });
  }
};

exports.viewStatement = async (req, res) => {
  try {
    const customerId = req.params.customer_id;
    const loanId = req.params.loan_id;


    const customerQuery = `
      SELECT * FROM customers
      WHERE customer_id = ?;
    `;
    const loanQuery = `
      SELECT * FROM loans
      WHERE loan_id = ?;
    `;

    const [customer] = await db.query(customerQuery, [customerId]);
    const [loan] = await db.query(loanQuery, [loanId]);

    if (!customer || !loan) {
      return res.status(404).json({ message: "Customer or loan not found" });
    }

    const remainingBalance = loan.loan_amount - loan.amount_paid;

    const remainingEMIs = Math.ceil(
      remainingBalance / loan.monthly_installment
    );


    const statement = {
      customer_id: customer.customer_id,
      loan_id: loan.loan_id,
      principal: loan.loan_amount,
      interest_rate: loan.interest_rate,
      amount_paid: loan.amount_paid,
      monthly_installment: loan.monthly_installment,
      repayments_left: remainingEMIs,
    };

    res.status(200).json(statement);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "An error occurred while fetching the loan statement.",
      });
  }
};
