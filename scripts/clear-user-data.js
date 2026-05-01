/*
 Safe DB cleanup script: removes user-generated data but preserves schema, admins and products.

 WARNING: This is destructive. Review and back up your data before running.

 Usage:
   node scripts/clear-user-data.js

 It reads DB connection config from env variables with sensible defaults.
*/

const fs = require('fs').promises
const path = require('path')
const mysql = require('mysql2/promise')

const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306
const DB_USER = process.env.DB_USER || 'root'
const DB_PASS = process.env.DB_PASS || '12345678'
const DB_NAME = process.env.DB_NAME || 'pooja_enterprise'

async function clearUserData() {
  const pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
  })

  let conn
  try {
    conn = await pool.getConnection()
    console.log('Connected to DB', `${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`)

    console.log('\n--- Back up your data now if needed. This will permanently remove rows. ---\n')

    // Disable foreign key checks while truncating
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0')

    // Tables to clear (safe default): remove user data but keep products, product_variants, categories, admins
    const tables = [
      'payment_orders',
      'order_items',
      'orders',
      'cart_items',
      'carts',
      'clients',
      'sessions',
      'contact_messages',
      'password_resets'
    ]

    for (const table of tables) {
      try {
        console.log('Clearing', table)
        await conn.execute(`TRUNCATE TABLE ${table}`)
      } catch (err) {
        console.warn(`Failed to truncate ${table}:`, err.message)
      }
    }

    // Re-enable foreign key checks
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1')

    // Remove uploaded payment proofs to keep storage clean
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'payment-proofs')
    try {
      const files = await fs.readdir(uploadsDir)
      for (const f of files) {
        const full = path.join(uploadsDir, f)
        try {
          await fs.unlink(full)
          console.log('Removed upload:', full)
        } catch (e) {
          console.warn('Could not remove file:', full, e.message)
        }
      }
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.log('No payment uploads folder found, skipping file cleanup')
      } else {
        console.warn('Error cleaning uploads:', e.message)
      }
    }

    console.log('\n✅ Cleanup finished. Admins, products, and other schema are preserved.')
  } catch (e) {
    console.error('Error during cleanup:', e)
  } finally {
    if (conn) conn.release()
    await pool.end()
  }
}

if (require.main === module) {
  (async () => {
    const confirmed = process.env.CLEAR_USER_DATA_CONFIRM === '1'
    if (!confirmed) {
      console.log('\nThis script will CLEAR user data but keep admins and products.\n')
      console.log('To run:')
      console.log('  CLEAR_USER_DATA_CONFIRM=1 node scripts/clear-user-data.js')
      process.exit(0)
    }

    await clearUserData()
  })()
}
