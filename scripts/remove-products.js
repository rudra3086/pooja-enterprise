// Script to remove all products and variants from the database
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'pooja_enterprise',
});

async function removeProducts() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('Starting product removal...\n');
    
    // Disable foreign key checks
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✓ Disabled foreign key checks');
    
    // Delete product variants
    await conn.execute('DELETE FROM product_variants');
    console.log('✓ Deleted all product variants');
    
    // Delete products
    await conn.execute('DELETE FROM products');
    console.log('✓ Deleted all products');
    
    // Delete categories
    await conn.execute('DELETE FROM categories');
    console.log('✓ Deleted all categories');
    
    // Re-enable foreign key checks
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Re-enabled foreign key checks');
    
    console.log('\n✅ All products removed successfully!');
  } catch (err) {
    console.error('❌ Error removing products:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

removeProducts();
