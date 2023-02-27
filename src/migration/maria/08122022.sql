-- hi_business_analytics.business_chat_analytics definition
CREATE TABLE `business_chat_analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_account` varchar(255) NOT NULL,
  `date_hours` varchar(255) NOT NULL,
  `room_id` varchar(255) NOT NULL,
  `week_in_month` int(11) NOT NULL,
  `week_in_year` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `day` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_business_chat_analytics` (`business_account`,`date_hours`,`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- hi_business_analytics.new_customer definition
CREATE TABLE `new_customer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_analytics_id` int(11) NOT NULL,
  `from_id` varchar(255) NOT NULL,
  `to_id` varchar(255) NOT NULL,
  `send_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_new_customer_0` (`from_id`,`to_id`),
  KEY `idx_new_customer_1` (`business_analytics_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4;

-- hi_business_analytics.business_landing_page_analytics definition
CREATE TABLE `business_landing_page_analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session` varchar(255) NOT NULL,
  `ip_address` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `business_jabberid` varchar(255) NOT NULL,
  `business_unique_id` varchar(255) NOT NULL,
  `OS` varchar(255) DEFAULT NULL,
  `browser_agent` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `user_agent` varchar(255) NOT NULL,
  `device` varchar(255) NOT NULL,
  `device_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_business_landing_page_analytics_0` (`ip_address`),
  KEY `idx_business_landing_page_analytics_1` (`url`),
  KEY `idx_business_landing_page_analytics_2` (`business_jabberid`),
  KEY `idx_business_landing_page_analytics_3` (`business_unique_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;