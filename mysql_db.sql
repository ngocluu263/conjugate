/*
SQLyog Community v12.16 (64 bit)
MySQL - 5.5.50-MariaDB : Database - verbs
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*Table structure for table `translations` */

DROP TABLE IF EXISTS `translations`;

CREATE TABLE `translations` (
  `lang` char(100) DEFAULT NULL,
  `verb` char(100) DEFAULT NULL,
  `english` char(100) DEFAULT NULL,
  `description` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `translations` */

LOCK TABLES `translations` WRITE;

UNLOCK TABLES;

/*Table structure for table `verbs` */

DROP TABLE IF EXISTS `verbs`;

CREATE TABLE `verbs` (
  `lang` char(10) DEFAULT NULL,
  `verb` char(100) DEFAULT NULL,
  `conjugations` char(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `verbs` */

LOCK TABLES `verbs` WRITE;

UNLOCK TABLES;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
