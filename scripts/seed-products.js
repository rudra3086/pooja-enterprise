// Script to add sample products and categories to the database
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'pooja_enterprise',
});

async function seedProducts() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('Starting product seeding...\n');
    
    // Insert categories
    const categories = [
      {
        id: 'cat-1',
        name: 'Paper Products',
        slug: 'paper-products',
        description: 'High-quality paper products for businesses'
      },
      {
        id: 'cat-2',
        name: 'Packaging Materials',
        slug: 'packaging-materials',
        description: 'Durable packaging solutions'
      },
      {
        id: 'cat-3',
        name: 'Office Supplies',
        slug: 'office-supplies',
        description: 'Essential office supplies'
      }
    ];

    for (const cat of categories) {
      await conn.execute(
        'INSERT INTO categories (id, name, slug, description, is_active) VALUES (?, ?, ?, ?, true)',
        [cat.id, cat.name, cat.slug, cat.description]
      );
      console.log(`✓ Added category: ${cat.name}`);
    }

    // Insert products
    const products = [
      {
        id: 'prod-1',
        category_id: 'cat-1',
        name: 'A4 White Paper (500 sheets)',
        slug: 'a4-white-paper-500',
        description: 'Premium quality A4 white paper, 80 GSM. Perfect for printing and copying.',
        short_description: 'Premium A4 white paper pack',
        base_price: 250.00,
        min_order_quantity: 1,
        is_customizable: false
      },
      {
        id: 'prod-2',
        category_id: 'cat-1',
        name: 'Colored Paper Assortment',
        slug: 'colored-paper-assortment',
        description: 'Vibrant colored paper in various colors. Great for creative projects.',
        short_description: 'Assorted colored papers',
        base_price: 350.00,
        min_order_quantity: 5,
        is_customizable: false
      },
      {
        id: 'prod-3',
        category_id: 'cat-2',
        name: 'Kraft Corrugated Boxes',
        slug: 'kraft-corrugated-boxes',
        description: 'Sturdy kraft corrugated boxes for shipping. Customizable sizes available.',
        short_description: 'Strong shipping boxes',
        base_price: 1500.00,
        min_order_quantity: 100,
        is_customizable: true,
        customization_options: JSON.stringify({
          sizes: ['10x10x10', '15x15x15', '20x20x20'],
          printing: true,
          logo_customization: true
        })
      },
      {
        id: 'prod-4',
        category_id: 'cat-3',
        name: 'Ballpoint Pens (Pack of 50)',
        slug: 'ballpoint-pens-50',
        description: 'Smooth writing ballpoint pens. Available in multiple colors.',
        short_description: 'Ballpoint pen bulk pack',
        base_price: 150.00,
        min_order_quantity: 1,
        is_customizable: true,
        customization_options: JSON.stringify({
          colors: ['Blue', 'Black', 'Red', 'Green'],
          branding: true
        })
      },
      {
        id: 'prod-5',
        category_id: 'cat-3',
        name: 'File Folders (Pack of 25)',
        slug: 'file-folders-25',
        description: 'Durable file folders for organizing documents. Legal and letter size.',
        short_description: 'Professional file folders',
        base_price: 200.00,
        min_order_quantity: 1,
        is_customizable: false
      }
    ];

    for (const prod of products) {
      await conn.execute(
        'INSERT INTO products (id, category_id, name, slug, description, short_description, base_price, min_order_quantity, is_customizable, customization_options, is_active, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, false)',
        [prod.id, prod.category_id, prod.name, prod.slug, prod.description, prod.short_description, prod.base_price, prod.min_order_quantity, prod.is_customizable, prod.customization_options || null]
      );
      console.log(`✓ Added product: ${prod.name}`);
    }

    // Insert product variants
    const variants = [
      {
        id: 'var-1',
        product_id: 'prod-1',
        sku: 'A4-WHITE-80GSM-500',
        name: 'A4 80 GSM (500 sheets)',
        price: 250.00,
        stock_quantity: 1000
      },
      {
        id: 'var-2',
        product_id: 'prod-2',
        sku: 'COLOR-PAPER-A4-100',
        name: 'Assorted Colors (100 sheets)',
        price: 350.00,
        stock_quantity: 500
      },
      {
        id: 'var-3',
        product_id: 'prod-3',
        sku: 'BOX-10X10-BROWN',
        name: '10x10x10 cm Kraft Box',
        price: 15.00,
        stock_quantity: 5000
      },
      {
        id: 'var-4',
        product_id: 'prod-3',
        sku: 'BOX-15X15-BROWN',
        name: '15x15x15 cm Kraft Box',
        price: 22.00,
        stock_quantity: 3000
      },
      {
        id: 'var-5',
        product_id: 'prod-4',
        sku: 'PEN-BLUE-50',
        name: 'Blue Ballpoint Pens (50)',
        price: 150.00,
        stock_quantity: 2000
      },
      {
        id: 'var-6',
        product_id: 'prod-4',
        sku: 'PEN-BLACK-50',
        name: 'Black Ballpoint Pens (50)',
        price: 150.00,
        stock_quantity: 2000
      },
      {
        id: 'var-7',
        product_id: 'prod-5',
        sku: 'FOLDER-LEGAL-25',
        name: 'Legal Size Folders (25)',
        price: 200.00,
        stock_quantity: 1500
      }
    ];

    for (const var_item of variants) {
      await conn.execute(
        'INSERT INTO product_variants (id, product_id, sku, name, price, stock_quantity, low_stock_threshold) VALUES (?, ?, ?, ?, ?, ?, 10)',
        [var_item.id, var_item.product_id, var_item.sku, var_item.name, var_item.price, var_item.stock_quantity]
      );
      console.log(`✓ Added variant: ${var_item.name}`);
    }

    console.log('\n✅ Sample products seeded successfully!');
  } catch (err) {
    console.error('❌ Error seeding products:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

seedProducts();
