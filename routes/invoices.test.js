process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require('../app');
const db = require('../db');

//setup logic
let testCompany;
beforeEach(async () => {
    let result = await db.query(
        `INSERT INTO invoices (comp_code, amt, paid)
        VALUES ('ibm', '143.00', 'false)
        RETURNING id, comp_code, amt, add_date, paid_date`
    );
    testCompany = result.rows[0];
})

//teardown logic
afterEach(async () => {
    await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
    await db.end();
})