DELIMITER //

CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO user_password_memory (usr_id, usr_pwd, usr_pwd_creation_dt)
    VALUES (NEW.usr_id, NEW.usr_pass, CURDATE());
END //

DELIMITER ;
