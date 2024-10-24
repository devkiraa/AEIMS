// Route to get all inventory items
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM inventory');
        res.json(rows); // Sending inventory data as JSON
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});
