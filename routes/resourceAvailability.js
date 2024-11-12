const express = require('express');
const router = express.Router();
const db = require('../models/db'); 

router.post('/resource-available', async (req, res) => {
    const {startDate, endDate, startTime, endTime} = req.body;
    try {
        const [inventoryItems] = await db.query(`
            SELECT 
            i.inv_id,
            i.inv_prd_name,
            i.inv_item_cnt,
            i.inv_serv_cnt,
            i.inv_rmv_cnt,
            i.inv_type,
            i.inv_stat,
            COALESCE(SUM(er.res_count), 0) AS inv_in_use, 
            (i.inv_item_cnt - i.inv_serv_cnt - i.inv_rmv_cnt - COALESCE(SUM(er.res_count), 0)) AS inv_available
        FROM 
            inventory i
        LEFT JOIN 
            event_resources er ON i.inv_id = er.inv_id
            AND ((er.res_tdate BETWEEN ? AND ?
                 OR er.res_rdate BETWEEN ? AND ?) OR (? BETWEEN er.res_tdate AND er.res_rdate
                 OR ? BETWEEN er.res_tdate AND er.res_rdate))
            AND ((er.res_ttime BETWEEN ? AND ?
                 OR er.res_rtime BETWEEN ? AND ?) OR (? BETWEEN er.res_ttime AND er.res_rtime
                 OR ? BETWEEN er.res_ttime AND er.res_rtime))
        GROUP BY 
            i.inv_id, i.inv_prd_name, i.inv_item_cnt, i.inv_serv_cnt, i.inv_rmv_cnt;
        `, 
        [
            startDate,endDate,startDate,endDate,startDate,endDate,
            startTime,endTime,startTime,endTime,startTime,endTime
        ]); 
        res.json(inventoryItems); 
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;