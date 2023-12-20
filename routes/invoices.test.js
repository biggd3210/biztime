process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require('../app');
const db = require('../db');

//setup logic
let testInvoice;
let testCompany;
beforeAll(async () => {
    let companyResult = await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES ('ibm', 'IBM', 'Maker of Intel chips and other comp stuff')
        RETURNING code, name, description`
    )
    testCompany = companyResult.rows[0];
})

beforeEach(async () => {
    let result = await db.query(
        `INSERT INTO invoices (comp_code, amt, paid)
        VALUES ('ibm', '143.00', 'false')
        RETURNING id, comp_code, amt, add_date, paid_date`
    );
    testInvoice = result.rows[0];
})

//teardown logic
afterEach(async () => {
    await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
    await db.end();
})

describe('GET /invoices', function () {
    test('get list of all invoices', async () => {
        const resp = await request(app).get('/invoices');
        console.log(resp.body)
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({ invoices: [testInvoice] });
    })
})