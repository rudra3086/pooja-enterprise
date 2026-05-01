// Script to retrieve and display products from the database
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'pooja_enterprise',
});

async function viewProducts() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('📦 PRODUCTS IN DATABASE\n');
    console.log('='.repeat(80));
    
    // Get all products with their categories
    const [products] = await conn.execute(`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.base_price,
        p.min_order_quantity,
        p.is_customizable,
        c.name as category_name,
        p.is_active
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY c.name, p.name
    `);

    if (products.length === 0) {
      console.log('No products found in database');
      return;
    }

    for (const prod of products) {
      console.log(`\n📝 ${prod.name}`);
      console.log(`   ID: ${prod.id}`);
      console.log(`   Category: ${prod.category_name}`);
      console.log(`   Base Price: ₹${prod.base_price}`);
      console.log(`   Min Order: ${prod.min_order_quantity}`);
      console.log(`   Customizable: ${prod.is_customizable ? 'Yes' : 'No'}`);
      console.log(`   Status: ${prod.is_active ? 'Active' : 'Inactive'}`);
      console.log(`   Description: ${prod.description?.substring(0, 60)}...`);

      // Get variants for this product
      const [variants] = await conn.execute(`
        SELECT id, sku, name, price, stock_quantity
        FROM product_variants
        WHERE product_id = ?
        ORDER BY name
      `, [prod.id]);

      if (variants.length > 0) {
        console.log(`\n   📦 Variants:`);
        for (const var_item of variants) {
          console.log(`      • ${var_item.name}`);
          console.log(`        SKU: ${var_item.sku} | Price: ₹${var_item.price} | Stock: ${var_item.stock_quantity}`);
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`\nTotal Products: ${products.length}`);

    // Get categories summary
    const [categories] = await conn.execute('SELECT id, name, COUNT(p.id) as product_count FROM categories c LEFT JOIN products p ON c.id = p.category_id GROUP BY c.id, c.name');
    
    console.log('\n📂 CATEGORIES SUMMARY:');
    for (const cat of categories) {
      console.log(`   • ${cat.name}: ${cat.product_count} products`);
    }

  } catch (err) {
    console.error('❌ Error retrieving products:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

viewProducts();
