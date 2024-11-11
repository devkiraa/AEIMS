DELIMITER //

CREATE TRIGGER trg_after_insert_evn
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
        qck_evn_id
    )
    VALUES (
        NEW.ven_id,
        NEW.event_sd,
        NEW.evn_ed,
        NEW.evn_st,
        NEW.event_et,
        CASE
            WHEN NEW.evn_approval = 1 THEN 1
            ELSE 0
        END,
        NEW.evn_id,
        NULL
    );
END //

DELIMITER ;
