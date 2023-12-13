const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError')

const db = require('../db');


router.get('/', async (request, response, next) => {
    try {
        const results = await db.query(
            `SELECT code, name, description FROM companies`
        );
        
        return response.json({ companies: results.rows });
    }
    catch (e) {
        return next(e);
    }
});

router.get('/:code', async (request, response, next) => {
    try {
        const code = request.params.code;
        const compResults = await db.query(
            `SELECT code, name, description FROM companies
            WHERE code=$1`,
            [code]
        )
        
        const invoiceResults = await db.query(
            `SELECT id FROM invoices
            WHERE comp_code=$1`,
            [code]
        )
        
        if (compResults.rows.length === 0) {
            return next(new ExpressError(`No company found with code: ${code}`, 404))
        }

        const company = compResults.rows[0];
        const invoices = invoiceResults.rows;

        company.invoices = invoices.map(inv => inv.id);

        return response.json( { company: company })
    }
    catch (e) {
        return next(new ExpressError(e))
    }
})

router.post('/', async (request, response, next) => {
    try {
        const { code, name, description } = request.body;
        const results = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`, 
            [code, name, description]
        );

        return response.status(201).json({ company: results.rows[0] });
    }
    catch (e) {
        return next(new ExpressError(e));
    }
});

router.put('/:code', async (request, response, next) => {
    try {
        const code = request.params.code;
        const { name, description } = request.body;
        const results = await db.query(
            `UPDATE companies SET name=$1, description=$2
            WHERE code = $3
            RETURNING code, name, description`, [name, description, code]
        )

        return response.json({ company: results.rows[0]})
    }
    catch (e) {
        return next(new ExpressError(e))
    }
})

router.delete('/:code', async (request, response, next) => {
    try {
        const code = request.params.code;
        const results = await db.query(
            `DELETE FROM companies
            WHERE code = $1`, [code]
        )

        return response.json({ status: "deleted"})
    }
    catch(e) {
        return next(new ExpressError("Company not found", 404));
    }
})

module.exports = router;