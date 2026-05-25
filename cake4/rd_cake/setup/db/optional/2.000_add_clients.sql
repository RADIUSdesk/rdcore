DROP PROCEDURE IF EXISTS add_clients;

DELIMITER //

CREATE PROCEDURE add_clients()
BEGIN

IF NOT EXISTS (
    SELECT *
    FROM information_schema.tables
    WHERE table_name = 'clients'
      AND table_schema = DATABASE()
) THEN

    CREATE TABLE `clients` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `username` varchar(255) NOT NULL,
      `password` varchar(255) NOT NULL,
      `token` char(36) NOT NULL,
      `created` datetime DEFAULT NULL,
      `modified` datetime DEFAULT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    
    INSERT INTO `clients` VALUES (1,'kirkvanderwalt@gmail.com','$2y$10$zkMUVyKxbY62XuQ0AXCDlOUDiJBaoN8/Rvv51Q9MogiUex0lD.EyK','ea771de2-a36e-4e62-920f-eafc22b9c159','2026-02-27 03:28:01','2026-02-27 03:28:01');

END IF;

END//

DELIMITER ;

CALL add_clients();
