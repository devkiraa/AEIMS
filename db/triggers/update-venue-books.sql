DELIMITER //

CREATE TRIGGER trg_after_update_evn
AFTER UPDATE ON event_tb
FOR EACH ROW
BEGIN
    UPDATE venues_bookings
    SET 
        ven_id = NEW.ven_id,
        start_date = NEW.event_sd,
        end_date = NEW.evn_ed,
        start_time = NEW.evn_st,
        end_time = NEW.event_et,
        ven_stat = CASE
            WHEN NEW.evn_approval = 1 THEN 1
            ELSE 0
        END
    WHERE evn_id = NEW.evn_id;
END //

DELIMITER ;