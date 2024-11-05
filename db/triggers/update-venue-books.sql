DELIMITER //

CREATE TRIGGER update_venue_booking
AFTER UPDATE ON event_tb
FOR EACH ROW
BEGIN
    UPDATE venues_bookings
    SET ven_id = NEW.ven_id,
        start_date = NEW.event_sd,
        end_date = NEW.evn_ed,
        start_time = NEW.evn_st,
        end_time = NEW.event_et,
        ven_stat = NEW.evn_stat 
    WHERE ven_book_id = NEW.evn_id;
END //

DELIMITER ;
