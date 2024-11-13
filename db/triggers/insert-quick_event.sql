DELIMITER //

CREATE TRIGGER insert_into_vnb_from_qck
AFTER INSERT ON event_quick
FOR EACH ROW
BEGIN
    INSERT INTO venues_bookings 
    (ven_id, start_date, end_date, start_time, end_time, ven_stat, qck_evn_id)
    VALUES (
        NEW.ven_id,
        NEW.evn_qk_sd,
        NEW.evn_qk_ed,
        NEW.evn_qk_st,
        NEW.evn_qk_et,
        CASE
            WHEN NEW.qck_stat = 1 THEN 1
            ELSE 0
        END,
        NEW.evn_qk_id  -- assuming you want to use the evn_qk_id here
    );
END //

DELIMITER ;
