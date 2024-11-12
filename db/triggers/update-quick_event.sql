DELIMITER //

CREATE TRIGGER update_qck_stat_in_vnb
AFTER UPDATE ON event_quick
FOR EACH ROW
BEGIN
    IF NEW.qck_stat = 1 THEN
        DELETE FROM venues_bookings
        WHERE qck_evn_id = NEW.evn_qk_id;
    ELSEIF NEW.qck_stat = 0 THEN
        UPDATE venues_bookings
        SET 
            ven_id = NEW.ven_id,
            start_date = NEW.evn_qk_sd,
            end_date = NEW.evn_qk_ed,
            start_time = NEW.evn_qk_st,
            end_time = NEW.evn_qk_et
        WHERE qck_evn_id = NEW.evn_qk_id;
    END IF;
END //

DELIMITER ;
