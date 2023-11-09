exports.calculateCreditScore = (customer, loanData) => {
  let creditScore = 100;

  // Component i: Deduct points based on past loans paid on time
  if (customer.EMIs_paid_on_time < customer.total_EMI) {
    const lateLoans = customer.total_EMI - customer.EMIs_paid_on_time;
    creditScore -= lateLoans * 5; // Deduct 5 points for each late loan
  }

  // Component ii: Deduct points based on the number of loans taken in the past
  if (customer.total_loans > 5) {
    const extraLoans = customer.total_loans - 5;
    creditScore -= extraLoans * 10; // Deduct 10 points for each extra loan
  }

  // Component iii: Deduct points based on loan activity in the current year
  if (customer.loans_this_year > 2) {
    const extraLoansThisYear = customer.loans_this_year - 2;
    creditScore -= extraLoansThisYear * 8; // Deduct 8 points for each extra loan this year
  }

  // Component iv: Deduct points if sum of current loans > approved limit
  if (customer.current_loan_sum > customer.approved_limit) {
    creditScore = 0;
  }

  return Math.round(creditScore); // Ensure credit score is a whole number
};



// Function to calculate the monthly installment
exports.calculateMonthlyInstallment = (loanAmount, interestRate, tenure) => {
  const monthlyInterestRate = interestRate / 100 / 12;
  const totalInterest =
    loanAmount * (Math.pow(1 + monthlyInterestRate, tenure) - 1);
  const monthlyInstallment =
    (loanAmount * monthlyInterestRate) /
    (1 - Math.pow(1 + monthlyInterestRate, -tenure));
  return monthlyInstallment;
};
