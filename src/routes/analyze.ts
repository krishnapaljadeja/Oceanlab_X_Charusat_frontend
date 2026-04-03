const express = require('express');
const router = express.Router();
const { deleteAnalysis } = require('../db/queries');

router.post('/analyze/refresh', async (req:any, res:any) => {
    const { repo } = req.body;
    try {
        await deleteAnalysis(repo);
        res.status(200).send({ message: 'Analysis refreshed successfully.' });
    } catch (error:any) {
        if (error.code === 'P2025') {
            res.status(404).send({ error: 'Analysis record not found.' });
        } else {
            res.status(500).send({ error: 'An error occurred while refreshing analysis.' });
        }
    }
});

module.exports = router;