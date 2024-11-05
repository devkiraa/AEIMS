DELIMITER //

CREATE TRIGGER update_user_password_log
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE user_password_memory
    SET usr_pwd = NEW.usr_pass,
        usr_pwd_creation_dt = CURDATE()
    WHERE usr_id = NEW.usr_id;
END //

DELIMITER ;
