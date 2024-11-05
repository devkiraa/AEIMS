DELIMITER //

CREATE TRIGGER insert_venue_books
AFTER INSERT ON event_tb
FOR EACH ROW
BEGIN
    INSERT INTO venues_bookings (ven_book_id, ven_id, start_date, end_date, start_time, end_time, ven_stat)
    VALUES (NEW.evn_id, NEW.ven_id, NEW.event_sd, NEW.evn_ed, NEW.evn_st, NEW.event_et, NEW.evn_stat);
END //

DELIMITER ;
    