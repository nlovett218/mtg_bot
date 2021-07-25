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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mtg_gamedata`
--

LOCK TABLES `mtg_gamedata` WRITE;
/*!40000 ALTER TABLE `mtg_gamedata` DISABLE KEYS */;
INSERT INTO `mtg_gamedata` VALUES (12,'253984568179294210','{\"hand\": [], \"graveyard\": []}','{\"tapped\": {}, \"untapped\": {}}','{\"deck\": []}',1,'{\"lands\": [], \"creatures\": [], \"enchantments\": []}',1,1),(13,'309149319708016641','{\"hand\": [], \"graveyard\": []}','{\"tapped\": {}, \"untapped\": {}}','{\"deck\": []}',3,'{\"lands\": [], \"creatures\": [], \"enchantments\": []}',1,0),(14,'348681076027293697','{\"hand\": [], \"graveyard\": []}','{\"tapped\": {}, \"untapped\": {}}','{\"deck\": []}',1,'{\"lands\": [], \"creatures\": [], \"enchantments\": []}',1,1),(15,'219150311720353794','{\"hand\": [], \"graveyard\": []}','{\"tapped\": {}, \"untapped\": {}}','{\"deck\": []}',1,'{\"lands\": [], \"creatures\": [], \"enchantments\": []}',1,0),(20,'80821105685700608','{\"hand\": [\"MTG_0195\", \"MTG_0190\", \"MTG_0205\", \"MTG_0205\"], \"graveyard\": []}','{\"tapped\": {}, \"untapped\": {}}','{\"deck\": [\"LAND_0005\", \"MTG_0134\", \"MTG_0134\", \"LAND_0005\", \"LAND_0005\", \"LAND_0003\", \"LAND_0005\", \"LAND_0005\", \"LAND_0005\", \"LAND_0005\", \"MTG_0180\", \"MTG_0114\", \"MTG_0198\", \"LAND_0005\", \"MTG_0149\", \"LAND_0005\", \"MTG_0114\", \"LAND_0005\", \"LAND_0005\", \"MTG_0154\", \"MTG_0169\", \"LAND_0005\", \"LAND_0005\", \"MTG_0185\", \"MTG_0149\", \"LAND_0005\", \"LAND_0005\", \"LAND_0003\", \"MTG_0109\", \"MTG_0149\", \"LAND_0005\", \"LAND_0005\"]}',2,'{\"lands\": [{\"cardID\": \"LAND_0005\", \"colors\": \"blue\", \"fieldID\": \"8w97J69B018w0c\", \"isTapped\": false, \"attributes\": \"\", \"equipped_cards\": {}, \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0005\", \"colors\": \"blue\", \"fieldID\": \"8KbJbBlI1PDirT\", \"isTapped\": false, \"attributes\": \"\", \"equipped_cards\": {}, \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0005\", \"colors\": \"blue\", \"fieldID\": \"9ruGbG11YU35Xl\", \"isTapped\": false, \"attributes\": \"\", \"equipped_cards\": {}, \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0005\", \"colors\": \"blue\", \"fieldID\": \"t445w3CK7G89l5\", \"isTapped\": false, \"attributes\": \"\", \"equipped_cards\": {}, \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0005\", \"colors\": \"blue\", \"fieldID\": \"6nXp37a1ui5o63\", \"isTapped\": false, \"attributes\": \"\", \"equipped_cards\": {}, \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0005\", \"colors\": \"blue\", \"fieldID\": \"Luv4dv7Oml400c\", \"isTapped\": false, \"attributes\": \"\", \"equipped_cards\": {}, \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0005\", \"colors\": \"blue\", \"fieldID\": \"uW87H23FVxG9kP\", \"isTapped\": false, \"attributes\": \"\", \"equipped_cards\": {}, \"manaProduceAmount\": 1}], \"creatures\": [{\"power\": 6, \"cardID\": \"MTG_0174\", \"fieldID\": \"64xPY58R45c2D7\", \"cardName\": \"Salvager of Pirates\", \"isTapped\": false, \"strength\": 4, \"attributes\": \"\", \"equipped_cards\": {}, \"isDeclaredAttacker\": true, \"isDeclaredDefender\": false}, {\"power\": 8, \"cardID\": \"MTG_0205\", \"fieldID\": \"Ml4ft3N9XdAAdN\", \"cardName\": \"Silverclad Sphinx\", \"isTapped\": false, \"strength\": 6, \"attributes\": \"\", \"equipped_cards\": {}, \"isDeclaredAttacker\": true, \"isDeclaredDefender\": false}], \"enchantments\": []}',1,1),(21,'201841156990959616','{\"hand\": [\"MTG_0108\", \"LAND_0004\", \"MTG_0189\", \"MTG_0179\", \"MTG_0123\", \"LAND_0004\", \"LAND_0004\"], \"graveyard\": []}','{\"tapped\": {}, \"untapped\": {}}','{\"deck\": [\"MTG_0194\", \"MTG_0194\", \"LAND_0004\", \"MTG_0123\", \"LAND_0004\", \"LAND_0004\", \"MTG_0138\", \"LAND_0004\", \"LAND_0004\", \"LAND_0004\", \"LAND_0004\", \"LAND_0004\", \"LAND_0004\", \"LAND_0004\", \"LAND_0004\", \"LAND_0004\", \"MTG_0179\", \"LAND_0004\", \"MTG_0168\", \"MTG_0128\", \"MTG_0128\", \"LAND_0004\", \"LAND_0004\", \"LAND_0004\", \"LAND_0004\", \"MTG_0199\", \"MTG_0158\", \"LAND_0004\", \"LAND_0004\", \"LAND_0004\", \"LAND_0004\", \"MTG_0168\", \"MTG_0128\"]}',1,'{\"lands\": [], \"creatures\": [], \"enchantments\": []}',1,1),(22,'201841156990959616','{\"hand\": [\"MTG_0189\", \"LAND_0004\", \"LAND_0004\", \"MTG_0118\", \"MTG_0199\", \"LAND_0004\", \"MTG_0179\"], \"graveyard\": []}','{\"tapped\": {}, \"untapped\": {}}','{\"deck\": [\"LAND_0004\", \"LAND_0004\", \"LAND_0004\", \"MTG_0103\", \"LAND_0004\", \"LAND_0004\", \"LAND_0004\", \"MTG_0194\", \"MTG_0143\", \"LAND_0004\", \"MTG_0123\", \"LAND_0004\", \"MTG_0133\", \"LAND_0004\", \"MTG_0158\", \"MTG_0199\", \"LAND_0004\", \"LAND_0004\", \"LAND_0004\", \"LAND_0004\", \"MTG_0199\", \"LAND_0004\", \"LAND_0004\", \"MTG_0173\", \"LAND_0004\", \"LAND_0004\", \"LAND_0004\", \"LAND_0004\", \"LAND_0004\", \"MTG_0123\", \"MTG_0204\", \"LAND_0004\", \"MTG_0143\"]}',1,'{\"lands\": [], \"creatures\": [], \"enchantments\": []}',1,1);
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
  `mtg_packs` int(11) NOT NULL DEFAULT '0',
  `mtg_currency` int(11) DEFAULT NULL,
  `mtg_lastCardDrawnDateTime` datetime DEFAULT NULL,
  `mtg_lastAttackDateTime` datetime DEFAULT NULL,
  `mtg_lastDeathDateTime` datetime DEFAULT NULL,
  `mtg_lastQuerySentDateTime` datetime DEFAULT NULL,
  `mtg_guilds` json DEFAULT NULL,
  `mtg_startingDeck` varchar(10) DEFAULT NULL,
  `mtg_kills` int(11) NOT NULL DEFAULT '0',
  `mtg_deaths` int(11) NOT NULL DEFAULT '0',
  `mtg_damagedealt` int(11) NOT NULL DEFAULT '0',
  `mtg_amounthealed` int(11) NOT NULL DEFAULT '0',
  `mtg_reset` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mtg_user`
--

LOCK TABLES `mtg_user` WRITE;
/*!40000 ALTER TABLE `mtg_user` DISABLE KEYS */;
INSERT INTO `mtg_user` VALUES (69,'253984568179294210',0,-4,'{\"rare\": 2, \"common\": 10, \"mythic\": 1, \"uncommon\": 5}',0,0,'2019-03-17 00:57:33',NULL,'2019-03-17 04:43:12','2019-03-17 01:07:33',NULL,'green',0,16,1,0,1),(70,'309149319708016641',0,-2,'{\"rare\": 2, \"common\": 10, \"mythic\": 1, \"uncommon\": 5}',0,0,'2019-03-15 11:07:35',NULL,'2019-03-16 08:25:55','2019-03-15 11:17:35',NULL,'red',0,1,0,0,1),(71,'348681076027293697',0,-2,'{\"rare\": 2, \"common\": 10, \"mythic\": 1, \"uncommon\": 5}',0,0,'2019-03-15 11:19:06',NULL,'2019-03-16 08:25:07','2019-03-15 11:29:06',NULL,'green',0,1,0,0,1),(72,'219150311720353794',0,-2,'{\"rare\": 2, \"common\": 10, \"mythic\": 1, \"uncommon\": 5}',0,0,'2019-03-16 10:09:33',NULL,'2019-03-16 08:18:26','2019-03-16 12:06:52',NULL,'white',0,1,0,0,1),(77,'80821105685700608',19,6,'{\"rare\": 2, \"common\": 10, \"mythic\": 1, \"uncommon\": 5}',0,66,'2019-03-18 06:48:01','2019-03-20 08:45:32',NULL,'2019-03-17 04:34:50','{\"GUILD_345835071690768384\": {\"optedInToServer\": 1}, \"GUILD_510730001251958794\": {\"optedInToServer\": 1}}','blue',1,0,14,0,0),(78,'201841156990959616',0,6,'{\"rare\": 2, \"common\": 10, \"mythic\": 1, \"uncommon\": 5}',0,0,'2019-03-20 06:57:33',NULL,NULL,'2019-03-20 07:07:33','{\"GUILD_345835071690768384\": {\"optedInToServer\": 1}}','red',0,0,0,0,0);
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

-- Dump completed on 2019-03-20 21:36:30
