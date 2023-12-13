const express = require("express");
const router = new express.Router();
const ExpressError = require('../expressError')

const db = require('../db');

router.get('/', async (request, response, next) => {
    try {
        const results = await db.query(
        `SELECT id, comp_code, amt, paid, add_date, paid_date
        FROM invoices`
        )

        return response.json({ invoices: results.rows })
    }
    catch(e) {
        return next(new ExpressError(e));
    }
});

router.get('/:id', async (request, response, next) => {
    try {
        const id = request.params.id;
        const results = await db.query(
            `SELECT id, comp_code, amt, paid, add_date, paid_date
            FROM invoices
            WHERE id = $1`, [id]
        )
        if (results.rows.length === 0) {
            return next(new ExpressError(`No invoice found with id of '${id}'`, 404))
        }

        return response.json({ invoice: results.rows[0] })
    }
    catch (e) {
        console.log(e);
        return next;
    }
});

router.post('/', async (request, response, next) => {
    try {
        const { comp_code, amt } = request.body;

        const results = await db.query(
            `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt]
        )

        return response.status(201).json({ invoice: results.rows[0] })
    }
    catch(e) {
        return next(e);
    }
});

router.put('/:id', async (request, response, next) => {
    try {
        const { amt } = request.body;
        const id = request.params.id;
        const results = await db.query(
            `UPDATE invoices SET amt=$1
            WHERE id=$2
            RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
            [amt, id]
        )

        if (results.rows.length === 0 ) {
            return next(new ExpressError(`No invoice found with id of '${id}'`, 404))
        }
        
        return response.json({ invoice: results.rows[0] });
    }
    catch (e) {
        return next(e);
    }
});

router.delete('/:id', async (request, response, next) => {
    try {
        const id = request.params.id;

        const results = await db.query(
            `DELETE FROM invoices
            WHERE id=$1`,
            [id]
        )
        if (results.rows.length === 0) {
            return next(new ExpressError(`No invoice found with id of '${id}'`, 404))
        }
        return response.json({ status: "deleted" })
    }
    catch (e) {
        return next(e);
    }
})

module.exports = router;