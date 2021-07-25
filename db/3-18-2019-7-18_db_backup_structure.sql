CREATE DATABASE  IF NOT EXISTS `mtg_db` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `mtg_db`;
-- MySQL dump 10.13  Distrib 8.0.15, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: mtg_db
-- ------------------------------------------------------
-- Server version	8.0.15

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `mtg_discord_servers`
--

DROP TABLE IF EXISTS `mtg_discord_servers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `mtg_discord_servers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mtg_userID` varchar(45) NOT NULL,
  `mtg_discord_serverID` varchar(45) DEFAULT NULL,
  `mtg_optedIn` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mtg_gamedata`
--

DROP TABLE IF EXISTS `mtg_gamedata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `mtg_gamedata` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mtg_userID` varchar(45) NOT NULL,
  `mtg_currentHand` json DEFAULT NULL,
  `mtg_currentMana` json DEFAULT NULL,
  `mtg_currentDeck` json DEFAULT NULL,
  `mtg_currentPhase` int(11) NOT NULL DEFAULT '1',
  `mtg_currentBattlefield` json DEFAULT NULL,
  `mtg_allowedCardDraw` int(11) DEFAULT '1',
  `mtg_allowedLandCast` int(11) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mtg_user`
--

DROP TABLE IF EXISTS `mtg_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `mtg_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mtg_userID` varchar(45) NOT NULL,
  `mtg_rankxp` int(15) NOT NULL DEFAULT '0',
  `mtg_health` int(11) NOT NULL DEFAULT '20',
  `mtg_wildcards` json NOT NULL,
  `mtg_packs` int(11) NOT NULL DEFAULT '0',
  `mtg_currency` int(11) DEFAULT NULL,
  `mtg_lastCardDrawnDateTime` datetime DEFAULT NULL,
  `mtg_lastAttackDateTime` datetime DEFAULT NULL,
  `mtg_lastDeathDateTime` datetime DEFAULT NULL,
  `mtg_lastQuerySentDateTime` datetime DEFAULT NULL,
  `mtg_optedIn` tinyint(4) NOT NULL DEFAULT '0',
  `mtg_startingDeck` varchar(10) DEFAULT NULL,
  `mtg_kills` int(11) NOT NULL DEFAULT '0',
  `mtg_deaths` int(11) NOT NULL DEFAULT '0',
  `mtg_damagedealt` int(11) NOT NULL DEFAULT '0',
  `mtg_amounthealed` int(11) NOT NULL DEFAULT '0',
  `mtg_reset` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-03-18 19:38:06
