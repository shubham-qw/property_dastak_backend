'use strict';

/**
 * Creates a user row you can authorize for /admin/* by setting ADMIN_USER_UUIDS
 * to the printed user_uuid. Admin routes use JWT + that env list (not user.class).
 *
 * Usage:
 *   node scripts/create-admin-user.js <phone_e164> <email> [first_name] [last_name]
 *
 * Or set in .env:
 *   ADMIN_PHONE, ADMIN_EMAIL, optional ADMIN_FIRST_NAME, ADMIN_LAST_NAME
 *   then: node scripts/create-admin-user.js
 *
 * Requires: PG_HOSTNAME, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD (same as app)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = require('pg');
const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');

function buildPool() {
  const host = process.env.PG_HOSTNAME;
  const port = process.env.PG_PORT;
  const database = process.env.PG_DATABASE;
  const user = process.env.PG_USERNAME;
  const password = process.env.PG_PASSWORD;

  if (!host || !port || !database || !user) {
    console.error(
      'Missing PG_* env vars. Set PG_HOSTNAME, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD.',
    );
    process.exit(1);
  }

  return new Pool({
    host,
    port: parseInt(String(port), 10),
    database,
    user,
    password: password ?? '',
  });
}

async function main() {
  const phone =
    process.argv[2] || process.env.ADMIN_PHONE || process.env.ADMIN_SCRIPT_PHONE;
  const email =
    process.argv[3] || process.env.ADMIN_EMAIL || process.env.ADMIN_SCRIPT_EMAIL;
  const firstName =
    process.argv[4] ||
    process.env.ADMIN_FIRST_NAME ||
    process.env.ADMIN_SCRIPT_FIRST_NAME ||
    'Admin';
  const lastName =
    process.argv[5] ||
    process.env.ADMIN_LAST_NAME ||
    process.env.ADMIN_SCRIPT_LAST_NAME ||
    'User';
  
  const password =
    process.argv[6] ||
    process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_SCRIPT_PASSWORD

  
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

  if (!phone || !email) {
    console.error(
      'Usage: node scripts/create-admin-user.js <phone_e164> <email> [first_name] [last_name]',
    );
    console.error(
      '   or set ADMIN_PHONE and ADMIN_EMAIL (or ADMIN_SCRIPT_*) in .env',
    );
    process.exit(1);
  }

  const pool = buildPool();
  const userUuid = randomUUID();

  try {
    const res = await pool.query(
      `INSERT INTO users (user_uuid, first_name, last_name, phone_number, email, class, password,salt)
       VALUES ($1, $2, $3, $4, $5, 'user', $6, $7)
       RETURNING id, user_uuid, first_name, last_name, phone_number, email, class, password, salt`,
      [userUuid, firstName, lastName, phone, email, password,hashedPassword],
    );

    const row = res.rows[0];
    console.log('Created user:', row);
    console.log('');
    console.log('Add this to your .env (comma-separate if you already have admins):');
    console.log(`ADMIN_USER_UUIDS=${row.user_uuid}`);
    console.log('');
    console.log(
      'Log in with OTP using this phone number; JWT user_uuid must match for /admin/*.',
    );
  } catch (err) {
    if (err.code === '23505') {
      console.error(
        'Insert failed: phone_number or email already exists. Use different values or delete the existing user.',
      );
    } else {
      console.error(err.message || err);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
