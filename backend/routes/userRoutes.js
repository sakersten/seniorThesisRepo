const express = require('express');
const router = express.Router();
const db = require('../db'); 

router.get('/', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });

    try {
        const result = await db.query(
            'SELECT user_id, name, email FROM users WHERE user_id=$1',
            [req.session.userId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;