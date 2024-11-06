DELIMITER //

CREATE TRIGGER after_event_insert
AFTER INSERT ON event_tb
FOR EACH ROW
BEGIN
    INSERT INTO venues_bookings (
        ven_id,
        start_date,
        end_date,
        start_time,
        end_time,
        ven_stat,
        evn_id,
        quick_evn
    )
    VALUES (
		NEW.ven_id,
        NEW.event_sd,
        NEW.evn_ed,
        NEW.evn_st,
        NEW.event_et,
        1,
        NEW.evn_id,
        NULL
    );
END //

DELIMITER ;


