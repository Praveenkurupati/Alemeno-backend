const Sequelize = require('sequelize');
const sequelize = require('../Db_connection/config');


const Customer = sequelize.define('customer', {
  customer_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  first_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  last_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  age: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  phone_number: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  monthly_salary: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  approved_limit: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  current_debt: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});



const Loan = sequelize.define('loan', {
  loan_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customer_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  loan_amount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  tenure: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  interest_rate: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  monthly_installment: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  EMIs_paid_on_time: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  start_date: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  end_date: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  amount_paid: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

Customer.hasMany(Loan, { foreignKey: 'customer_id' });
Loan.belongsTo(Customer, { foreignKey: 'customer_id' });

module.exports={
    Customer,
    Loan
}


