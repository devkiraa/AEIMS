CREATE SCHEMA `aeims` ;

USE aeims;

CREATE TABLE `users` (
  `usr_id` int NOT NULL,
  `usr_name` varchar(100) NOT NULL,
  `usr_pass` varchar(256) NOT NULL,
  `usr_role` varchar(30) NOT NULL,
  `usr_dept` varchar(50) NOT NULL,
  `usr_stat` varchar(10) NOT NULL,
  PRIMARY KEY (`usr_id`),
  UNIQUE KEY `usr_name_UNIQUE` (`usr_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `venues` (
  `ven_id` int NOT NULL,
  `ven_name` varchar(30) NOT NULL,
  `ven_block` varchar(30) NOT NULL,
  `ven_cap` varchar(45) NOT NULL,
  PRIMARY KEY (`ven_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `venues_bookings` (
  `ven_book_id` int NOT NULL,
  `ven_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `ven_stat` int NOT NULL,
  `evn_id` int DEFAULT NULL,
  `qck_evn_id` int DEFAULT NULL,
  PRIMARY KEY (`ven_book_id`),
  KEY `ven_id_ref_idx` (`ven_id`),
  CONSTRAINT `ven_id_ref` FOREIGN KEY (`ven_id`) REFERENCES `venues` (`ven_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `inventory` (
  `inv_id` int NOT NULL,
  `inv_prd_name` varchar(50) NOT NULL,
  `inv_item_count` varchar(5) NOT NULL,
  `inv_service_count` varchar(5) NOT NULL,
  `inv_remove_count` varchar(5) NOT NULL,
  `inv_first_added` date NOT NULL,
  `inv_stat` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`inv_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `user_details` (
  `usr_id` int NOT NULL,
  `usr_aname` varchar(100) NOT NULL,
  `usr_mob` varchar(12) NOT NULL,
  `usr_cre_date` date NOT NULL,
  `usr_del_date` date DEFAULT NULL,
  `usr_club` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`usr_id`),
  UNIQUE KEY `usr_mob_UNIQUE` (`usr_mob`),
  CONSTRAINT `fk_user_details_users` FOREIGN KEY (`usr_id`) REFERENCES `users` (`usr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `event_tb` (
  `evn_id` int NOT NULL,
  `evn_name` varchar(100) NOT NULL,
  `evn_desc` varchar(260) NOT NULL,
  `evn_dept` varchar(100) NOT NULL,
  `event_poster` varchar(100) NOT NULL,
  `ven_id` int NOT NULL,
  `event_sd` date NOT NULL,
  `evn_ed` date NOT NULL,
  `evn_st` time NOT NULL,
  `event_et` time NOT NULL,
  `evn_vol_cnt` int NOT NULL,
  `evn_snk` tinyint NOT NULL,
  `evn_food` tinyint NOT NULL,
  `evn_stat` int NOT NULL,
  `evn_approval` tinyint NOT NULL,
  PRIMARY KEY (`evn_id`),
  KEY `evn_ven_ref_idx` (`ven_id`),
  CONSTRAINT `evn_ven_ref` FOREIGN KEY (`ven_id`) REFERENCES `venues` (`ven_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `event_coordinator` (
  `eco_id` int NOT NULL AUTO_INCREMENT,
  `usr_id` int NOT NULL,
  `evn_id` int NOT NULL,
  PRIMARY KEY (`eco_id`),
  KEY `evn_coor_idx` (`evn_id`),
  KEY `evn_coor_usr_idx` (`usr_id`),
  CONSTRAINT `evn_coor` FOREIGN KEY (`evn_id`) REFERENCES `event_tb` (`evn_id`),
  CONSTRAINT `evn_coor_usr` FOREIGN KEY (`usr_id`) REFERENCES `users` (`usr_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `event_guest_details` (
  `gst_id` int NOT NULL,
  `evn_id` int NOT NULL,
  `gst_name` varchar(30) NOT NULL,
  `gst_details` varchar(200) NOT NULL,
  `gst_type` tinyint NOT NULL,
  `gst_food` tinyint DEFAULT NULL,
  `gst_cnv` tinyint DEFAULT NULL,
  `gst_acc` tinyint DEFAULT NULL,
  `gst_fee` tinyint DEFAULT NULL,
  PRIMARY KEY (`gst_id`),
  KEY `gst_evn_ref_idx` (`evn_id`),
  CONSTRAINT `gst_evn_ref` FOREIGN KEY (`evn_id`) REFERENCES `event_tb` (`evn_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `event_modification_log` (
  `evn_mod_id` int NOT NULL,
  `evn_id` int NOT NULL,
  `evn_lst_mod_date` date NOT NULL,
  `evn_lst_mod_time` time NOT NULL,
  `usr_id` int NOT NULL,
  `evn_mod_data` varchar(45) NOT NULL,
  PRIMARY KEY (`evn_mod_id`),
  KEY `evn_mod_id_idx` (`evn_id`),
  KEY `evn_mod_usr_ref_idx` (`usr_id`),
  CONSTRAINT `evn_id_ref` FOREIGN KEY (`evn_id`) REFERENCES `event_tb` (`evn_id`),
  CONSTRAINT `evn_mod_usr_ref` FOREIGN KEY (`usr_id`) REFERENCES `users` (`usr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `event_resources` (
  `res_id` int NOT NULL,
  `evn_id` int NOT NULL,
  `inv_id` int NOT NULL,
  `res_count` int NOT NULL,
  `res_tdate` date NOT NULL,
  `res_rdate` date NOT NULL,
  `res_ttime` time NOT NULL,
  `res_rtime` time NOT NULL,
  PRIMARY KEY (`res_id`),
  KEY `evn_inv_ref_idx` (`inv_id`),
  KEY `evn_id_ref_idx` (`evn_id`),
  CONSTRAINT `evn_id_inv_ref` FOREIGN KEY (`evn_id`) REFERENCES `event_tb` (`evn_id`),
  CONSTRAINT `evn_inv_ref` FOREIGN KEY (`inv_id`) REFERENCES `inventory` (`inv_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `notification_tb` (
  `noti_id` int NOT NULL,
  `noti_message` varchar(150) NOT NULL,
  `evn_id` int DEFAULT NULL,
  `noti_date` date NOT NULL,
  `noti_time` time NOT NULL,
  `noti_stat` int NOT NULL,
  `usr_id` int NOT NULL,
  PRIMARY KEY (`noti_id`),
  KEY `noti_evn_ref_idx` (`evn_id`),
  KEY `noti_usr_ref_idx` (`usr_id`),
  CONSTRAINT `noti_evn_ref` FOREIGN KEY (`evn_id`) REFERENCES `event_tb` (`evn_id`),
  CONSTRAINT `noti_usr_ref` FOREIGN KEY (`usr_id`) REFERENCES `users` (`usr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `event_quick` (
  `evn_qk_id` int NOT NULL,
  `evn_qk_name` varchar(100) NOT NULL,
  `ven_id` int NOT NULL,
  `evn_qk_sd` date NOT NULL,
  `evn_qk_ed` date NOT NULL,
  `evn_qk_st` time NOT NULL,
  `evn_qk_et` time NOT NULL,
  `usr_id` int NOT NULL,
  `qck_stat` int NOT NULL,
  PRIMARY KEY (`evn_qk_id`),
  KEY `quick_event_usr_idx` (`usr_id`),
  KEY `quick_event_ven_idx` (`ven_id`),
  CONSTRAINT `quick_event_usr` FOREIGN KEY (`usr_id`) REFERENCES `users` (`usr_id`),
  CONSTRAINT `quick_event_ven` FOREIGN KEY (`ven_id`) REFERENCES `venues` (`ven_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `mail_log` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `mail_kind` varchar(100) DEFAULT NULL,
  `mail_date` date DEFAULT NULL,
  `mail_time` time DEFAULT NULL,
  `mail_stat` varchar(15) DEFAULT NULL,
  `usr_id` int DEFAULT NULL,
  `receiver_email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `mail_recipient_idx` (`usr_id`),
  CONSTRAINT `mail_recipient` FOREIGN KEY (`usr_id`) REFERENCES `users` (`usr_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `password_resets` (
  `reset_id` int NOT NULL AUTO_INCREMENT,
  `usr_id` int NOT NULL,
  `reset_token` varchar(255) NOT NULL,
  `reset_token_expiry` datetime NOT NULL,
  `reset_link_stat` int DEFAULT '0',
  PRIMARY KEY (`reset_id`),
  KEY `usr_id` (`usr_id`),
  CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`usr_id`) REFERENCES `users` (`usr_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `user_login_log` (
  `login_id` int NOT NULL AUTO_INCREMENT,
  `usr_id` int NOT NULL,
  `usr_log_dt` date NOT NULL,
  `usr_log_time` time NOT NULL,
  PRIMARY KEY (`login_id`),
  KEY `usr_login_log_idx` (`usr_id`),
  CONSTRAINT `usr_login_log` FOREIGN KEY (`usr_id`) REFERENCES `users` (`usr_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `user_password_memory` (
  `usr_pwd_mem_id` int NOT NULL,
  `usr_id` int NOT NULL,
  `usr_pwd` varchar(100) NOT NULL,
  `usr_pwd_creation_dt` date NOT NULL,
  PRIMARY KEY (`usr_pwd_mem_id`),
  KEY `usr_pwd_mem_idx` (`usr_id`),
  CONSTRAINT `usr_pwd_mem` FOREIGN KEY (`usr_id`) REFERENCES `users` (`usr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
