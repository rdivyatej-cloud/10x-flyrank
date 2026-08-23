const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const seedData = async () => {
  try {
    console.log('Seeding demo data...');

    // Clean existing data
    await pool.query('DELETE FROM expenses');
    await pool.query('DELETE FROM users');

    // Create demo user
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('password123', salt);
    
    const userRes = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      ['Demo User', 'demo@example.com', password_hash]
    );
    const userId = userRes.rows[0].id;
    console.log('Demo user created: demo@example.com / password123');

    // Insert demo expenses
    const expenses = [
      { amount: 250, category: 'Food', description: 'Lunch at cafe' },
      { amount: 120, category: 'Transport', description: 'Bus ticket' },
      { amount: 900, category: 'Shopping', description: 'New shirt' },
      { amount: 180, category: 'Food', description: 'Dinner' },
      { amount: 1200, category: 'Bills', description: 'Electricity bill' },
      { amount: 400, category: 'Entertainment', description: 'Movie ticket' },
      { amount: 600, category: 'Education', description: 'Online course' },
    ];

    for (const exp of expenses) {
      await pool.query(
        'INSERT INTO expenses (user_id, amount, category, description, date) VALUES ($1, $2, $3, $4, CURRENT_DATE)',
        [userId, exp.amount, exp.category, exp.description]
      );
    }
    console.log('Demo expenses inserted.');
    console.log('Seed complete. You can now login using demo@example.com');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    pool.end();
  }
};

seedData();
