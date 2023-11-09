const db = require("../Db_connection/config");



exports.registerCustomer = async (req, res) => {
  try {
    const { first_name, last_name, age, monthly_income, phone_number } = req.body;


    const approved_limit = Math.round((36 * monthly_income) / 100000) * 100000;

    const insertCustomerQuery = `
      INSERT INTO customers (first_name, last_name, age, monthly_income, phone_number, approved_limit)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
    
    const values = [first_name, last_name, age, monthly_income, phone_number, approved_limit];

    const result = await db.query(insertCustomerQuery, values);

    if (result.affectedRows === 1) {
      return res.status(201).json({
        customer_id: result.insertId,
        name: `${first_name} ${last_name}`,
        age,
        monthly_income,
        approved_limit,
        phone_number,
      });
    } else {
      return res.status(500).json({ error: 'An error occurred while registering the customer.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while registering the customer.' });
  }
};





