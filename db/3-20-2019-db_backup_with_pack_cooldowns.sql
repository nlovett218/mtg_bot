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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mtg_gamedata`
--

LOCK TABLES `mtg_gamedata` WRITE;
/*!40000 ALTER TABLE `mtg_gamedata` DISABLE KEYS */;
/*!40000 ALTER TABLE `mtg_gamedata` ENABLE KEYS */;
UNLOCK TABLES;

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
  `mtg_lastClaimDateTime` datetime DEFAULT NULL,
  `mtg_packs` int(11) NOT NULL DEFAULT '0',
  `mtg_dailyPackCooldown` datetime DEFAULT NULL,
  `mtg_weeklyPackCooldown` datetime DEFAULT NULL,
  `mtg_currency` int(11) NOT NULL DEFAULT '0',
  `mtg_lastCardDrawnDateTime` datetime DEFAULT NULL,
  `mtg_lastAttackDateTime` datetime DEFAULT NULL,
  `mtg_lastDeathDateTime` datetime DEFAULT NULL,
  `mtg_lastQuerySentDateTime` datetime DEFAULT NULL,
  `mtg_guilds` json DEFAULT NULL,
  `mtg_lastOptInOutDateTime` datetime DEFAULT NULL,
  `mtg_startingDeck` varchar(10) DEFAULT NULL,
  `mtg_kills` int(11) NOT NULL DEFAULT '0',
  `mtg_deaths` int(11) NOT NULL DEFAULT '0',
  `mtg_damagedealt` int(11) NOT NULL DEFAULT '0',
  `mtg_amounthealed` int(11) NOT NULL DEFAULT '0',
  `mtg_reset` tinyint(4) DEFAULT NULL,
  `mtg_accountType` varchar(45) DEFAULT 'BASIC_USER',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mtg_user`
--

LOCK TABLES `mtg_user` WRITE;
/*!40000 ALTER TABLE `mtg_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `mtg_user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-03-22 10:18:12
