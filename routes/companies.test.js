process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require('../app');
const db = require('../db');


//setup logic
let testCompany;
beforeEach(async () => {
    let result = await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES ('ibm', 'IBM', 'Maker of Intel chips and other comp stuff')
        RETURNING code, name, description`
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

//route testing

describe('GET /companies', function() {
    test('get list of all companies', async function() {
        const resp = await request(app).get('/companies');
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({ companies: [testCompany] })
    })
    test('show 404 if no companies found', async function() {
        await db.query(`DELETE FROM companies`);
        const resp = await request(app).get('/companies');
        expect(resp.statusCode).toEqual(404);
        expect(resp.body.error.message).toBe('No companies currently in database')
        
    })
})

describe('GET /companies/:code', function() {
    test('get company by code', async () => {
        testCompany.invoices = [];
        const resp = await request(app).get(`/companies/${testCompany.code}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({ company: testCompany });
    })
    test('show 404 if company code not found', async () => {
        const code = 'noCompany'
        const resp = await request(app).get(`/companies/${code}`);
        expect(resp.statusCode).toEqual(404);
        expect(resp.body.error.message).toBe(`No company found with code: ${code}`)
    });
});

describe('POST /companies new company', function() {
    test('post a new company from provided information', async () => {
        const data = {
            "code" : "apple",
            "name" : "Apple", 
            "description" : "Makes MacOs and iOs products"
        }
        const resp = await request(app).post('/companies').send(data);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({ company: data })
    });
});

describe('PUT /:code edit company info', function() {
    test('edit data of given information and a code', async () => {
        code = testCompany.code;
        const data = {
            "name": "HAL",
            "description" : "super computer from Space Odyssey 2000"
        }
        const resp = await request(app).put(`/companies/${testCompany.code}`).send(data);
        console.log('resp.body is ', resp.body);
        console.log('testCompany is ', testCompany);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({ company: {"code": "ibm", "name": "HAL", "description": "super computer from Space Odyssey 2000"} });
    });
    test('return 404 if code not found', async () => {
        const data = {
            "name" : "HAL",
            "description" : "super computer .... "
        }
        const code = 0;
        const resp = await request(app).put(`/companies/${code}`).send(data);
        expect(resp.statusCode).toEqual(404);
        expect(resp.body.error.message).toEqual(`Company not found with code: ${code}`)
    })
})

describe('DELETE / company info', function() {
    test('remove record from DB', async () => {
        const resp = await request(app).delete(`/companies/${testCompany.code}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({ status: "deleted" });
    })
});