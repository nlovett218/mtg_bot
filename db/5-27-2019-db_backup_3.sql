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
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mtg_gamedata`
--

LOCK TABLES `mtg_gamedata` WRITE;
/*!40000 ALTER TABLE `mtg_gamedata` DISABLE KEYS */;
INSERT INTO `mtg_gamedata` VALUES (33,'80821105685700608','{\"hand\": [\"MTG_0148\", \"MTG_0163\"], \"graveyard\": []}','{\"tapped\": {}, \"untapped\": {}}','{\"deck\": [\"LAND_0002\", \"MTG_0212\", \"MTG_0157\", \"LAND_0002\", \"LAND_0002\", \"MTG_0112\", \"MTG_0207\", \"MTG_0141\", \"MTG_0120\", \"MTG_0105\", \"LAND_0005\", \"MTG_0134\", \"LAND_0003\", \"MTG_0119\", \"LAND_0002\", \"LAND_0002\", \"MTG_0121\", \"LAND_0002\", \"MTG_0200\", \"LAND_0002\", \"MTG_0144\", \"MTG_0208\", \"LAND_0005\", \"MTG_0151\", \"LAND_0004\", \"LAND_0001\", \"LAND_0002\", \"MTG_0145\", \"MTG_0127\", \"MTG_0145\", \"LAND_0002\", \"MTG_0103\", \"LAND_0002\", \"MTG_0210\", \"MTG_0126\", \"LAND_0004\", \"MTG_0190\", \"MTG_0129\", \"MTG_0164\", \"LAND_0002\", \"MTG_0114\", \"MTG_0156\", \"LAND_0003\", \"MTG_0197\", \"LAND_0003\", \"LAND_0002\", \"LAND_0002\", \"LAND_0003\", \"MTG_0116\", \"MTG_0163\", \"MTG_0116\", \"MTG_0129\", \"MTG_0176\", \"MTG_0196\", \"LAND_0002\", \"MTG_0183\", \"MTG_0213\", \"LAND_0002\", \"LAND_0002\", \"LAND_0002\", \"MTG_0159\", \"MTG_0110\", \"MTG_0101\", \"MTG_0115\", \"LAND_0002\", \"MTG_0150\", \"MTG_0106\", \"MTG_0196\", \"MTG_0174\"]}',1,'{\"lands\": [{\"cardID\": \"LAND_0002\", \"colors\": \"black\", \"fieldID\": \"oOnWlRq4hBROAI\", \"ownerID\": \"80821105685700608\", \"cardName\": \"Swamp\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0002\", \"colors\": \"black\", \"fieldID\": \"D470TFtV0gqH8k\", \"ownerID\": \"80821105685700608\", \"cardName\": \"Swamp\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0002\", \"colors\": \"black\", \"fieldID\": \"WTi3fl523GIq95\", \"ownerID\": \"80821105685700608\", \"cardName\": \"Swamp\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0002\", \"colors\": \"black\", \"fieldID\": \"MQ63t8CgIgPM5j\", \"ownerID\": \"80821105685700608\", \"cardName\": \"Swamp\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0002\", \"colors\": \"black\", \"fieldID\": \"171dEhrPvIG4p6\", \"ownerID\": \"80821105685700608\", \"cardName\": \"Swamp\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0002\", \"colors\": \"black\", \"fieldID\": \"3zx41lv4i15o1n\", \"ownerID\": \"80821105685700608\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0002\", \"colors\": \"black\", \"fieldID\": \"Wv0T9FIy3jaF6x\", \"ownerID\": \"80821105685700608\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0002\", \"colors\": \"black\", \"fieldID\": \"ZFxZoPI36Y9Fqo\", \"ownerID\": \"80821105685700608\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0005\", \"colors\": \"blue\", \"fieldID\": \"R72NEuPZpzbRvs\", \"ownerID\": \"80821105685700608\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0002\", \"colors\": \"black\", \"fieldID\": \"IW2uhF82bCmteh\", \"ownerID\": \"80821105685700608\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0003\", \"colors\": \"green\", \"fieldID\": \"Q135LY2H5Op9Zn\", \"ownerID\": \"80821105685700608\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}], \"creatures\": [{\"power\": 3, \"cardID\": \"MTG_0121\", \"fieldID\": \"oFW8Hv0p10vK51\", \"ownerID\": \"80821105685700608\", \"isTapped\": false, \"strength\": 1, \"permanent\": true, \"attributes\": \"\", \"equipped_cards\": [\"QahHj3M3ALPYtt\", \"Y5CIY7d4as457j\"], \"isDeclaredAttacker\": true, \"isDeclaredDefender\": false}, {\"power\": 7, \"cardID\": \"MTG_0187\", \"fieldID\": \"p6IbY0ZRy7vx8e\", \"ownerID\": \"80821105685700608\", \"isTapped\": false, \"strength\": 5, \"permanent\": true, \"attributes\": \"\", \"equipped_cards\": [], \"isDeclaredAttacker\": true, \"isDeclaredDefender\": false}, {\"power\": 4, \"cardID\": \"MTG_0141\", \"fieldID\": \"Gf4VCgMjhpku23\", \"ownerID\": \"80821105685700608\", \"isTapped\": false, \"strength\": 2, \"permanent\": true, \"attributes\": \"\", \"equipped_cards\": [], \"isDeclaredAttacker\": true, \"isDeclaredDefender\": false}, {\"power\": 3, \"cardID\": \"MTG_0131\", \"fieldID\": \"QI9722Q2RX905H\", \"ownerID\": \"80821105685700608\", \"isTapped\": false, \"strength\": 3, \"permanent\": true, \"attributes\": \"\", \"equipped_cards\": [], \"isDeclaredAttacker\": true, \"isDeclaredDefender\": false}], \"enchantments\": [{\"cardID\": \"MTG_0212\", \"target\": null, \"fieldID\": \"QahHj3M3ALPYtt\", \"ownerID\": \"80821105685700608\", \"isTapped\": false, \"permanent\": true, \"attributes\": {\"amount\": 1, \"cardType\": \"aura\", \"creature\": {\"power\": {\"add\": 0, \"subtract\": 0}, \"strength\": {\"add\": 3, \"subtract\": 0}}, \"permanent_type\": \"creature\"}, \"equipped_cards\": []}, {\"cardID\": \"MTG_0212\", \"target\": null, \"fieldID\": \"Y5CIY7d4as457j\", \"ownerID\": \"80821105685700608\", \"isTapped\": false, \"permanent\": true, \"attributes\": {\"amount\": 1, \"cardType\": \"aura\", \"creature\": {\"power\": {\"add\": 0, \"subtract\": 0}, \"strength\": {\"add\": 3, \"subtract\": 0}}, \"permanent_type\": \"creature\"}, \"equipped_cards\": []}]}',0,0),(34,'222226372280451072','{\"hand\": [], \"graveyard\": []}','{\"tapped\": {}, \"untapped\": {}}','{\"deck\": []}',1,'{\"lands\": [], \"creatures\": [], \"enchantments\": []}',1,1),(35,'293836756166377482','{\"hand\": [\"LAND_0002\", \"MTG_0187\", \"MTG_0208\", \"LAND_0002\", \"LAND_0002\", \"LAND_0002\", \"LAND_0002\"], \"graveyard\": []}','{\"tapped\": {}, \"untapped\": {}}','{\"deck\": [\"MTG_0132\", \"MTG_0144\", \"MTG_0131\", \"MTG_0163\", \"MTG_0171\", \"MTG_0131\", \"MTG_0110\", \"MTG_0171\", \"LAND_0005\", \"LAND_0002\", \"MTG_0208\", \"LAND_0004\", \"MTG_0187\", \"MTG_0182\", \"MTG_0187\", \"LAND_0002\", \"LAND_0002\", \"MTG_0103\", \"LAND_0002\", \"MTG_0101\", \"LAND_0002\", \"LAND_0002\", \"MTG_0162\", \"MTG_0149\", \"MTG_0207\", \"MTG_0149\", \"LAND_0002\", \"LAND_0002\", \"LAND_0002\", \"MTG_0117\", \"MTG_0101\", \"MTG_0132\", \"LAND_0002\", \"MTG_0101\", \"LAND_0005\", \"MTG_0160\", \"MTG_0111\", \"LAND_0002\", \"MTG_0101\", \"MTG_0101\", \"LAND_0002\", \"MTG_0144\", \"MTG_0168\", \"MTG_0106\", \"LAND_0004\", \"LAND_0002\", \"MTG_0136\", \"LAND_0002\", \"LAND_0004\", \"MTG_0101\", \"LAND_0005\", \"LAND_0002\", \"MTG_0182\", \"LAND_0002\", \"MTG_0131\", \"LAND_0001\", \"LAND_0005\", \"MTG_0133\", \"LAND_0002\", \"MTG_0107\", \"LAND_0003\", \"LAND_0002\", \"MTG_0199\", \"LAND_0004\", \"LAND_0002\", \"MTG_0156\", \"LAND_0002\", \"MTG_0208\"]}',1,'{\"lands\": [], \"creatures\": [], \"enchantments\": []}',1,1),(36,'201841156990959616','{\"hand\": [\"LAND_0001\", \"MTG_0213\", \"MTG_0213\"], \"graveyard\": []}','{\"tapped\": {}, \"untapped\": {}}','{\"deck\": [\"LAND_0001\", \"MTG_0196\", \"MTG_0140\", \"MTG_0155\", \"LAND_0001\", \"MTG_0140\", \"LAND_0001\", \"LAND_0001\", \"MTG_0175\", \"MTG_0201\", \"LAND_0001\", \"MTG_0105\", \"LAND_0001\", \"LAND_0001\", \"LAND_0001\", \"LAND_0001\", \"MTG_0125\", \"LAND_0001\", \"LAND_0001\", \"LAND_0001\", \"LAND_0001\", \"LAND_0001\", \"LAND_0001\", \"MTG_0140\", \"MTG_0110\", \"MTG_0181\", \"LAND_0001\", \"MTG_0191\", \"MTG_0105\", \"MTG_0155\", \"LAND_0001\", \"MTG_0181\"]}',1,'{\"lands\": [{\"cardID\": \"LAND_0001\", \"colors\": \"white\", \"fieldID\": \"V4cF8DXI49m94U\", \"ownerID\": \"201841156990959616\", \"cardName\": \"Plains\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0001\", \"colors\": \"white\", \"fieldID\": \"WJ025u2WFCiiX1\", \"ownerID\": \"201841156990959616\", \"cardName\": \"Plains\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0001\", \"colors\": \"white\", \"fieldID\": \"uD1jX03P2DbBRs\", \"ownerID\": \"201841156990959616\", \"cardName\": \"Plains\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0001\", \"colors\": \"white\", \"fieldID\": \"btuR42JFY3c0GA\", \"ownerID\": \"201841156990959616\", \"cardName\": \"Plains\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0001\", \"colors\": \"white\", \"fieldID\": \"54M2LkKRiPD198\", \"ownerID\": \"201841156990959616\", \"cardName\": \"Plains\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0001\", \"colors\": \"white\", \"fieldID\": \"59zQrZXxhTW07V\", \"ownerID\": \"201841156990959616\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}], \"creatures\": [{\"power\": 1, \"cardID\": \"MTG_0100\", \"fieldID\": \"50tglOEr6Eddh1\", \"ownerID\": \"201841156990959616\", \"isTapped\": false, \"strength\": 1, \"permanent\": true, \"attributes\": \"\", \"equipped_cards\": [\"cdp6X2E1540lt2\", \"iKdSn8Q0n4yUiE\"], \"isDeclaredAttacker\": false, \"isDeclaredDefender\": false}, {\"power\": 1, \"cardID\": \"MTG_0100\", \"fieldID\": \"w28z5aHUOJNRjO\", \"ownerID\": \"201841156990959616\", \"isTapped\": false, \"strength\": 1, \"permanent\": true, \"attributes\": \"\", \"equipped_cards\": [], \"isDeclaredAttacker\": false, \"isDeclaredDefender\": false}], \"enchantments\": [{\"cardID\": \"MTG_0213\", \"target\": null, \"fieldID\": \"cdp6X2E1540lt2\", \"ownerID\": \"201841156990959616\", \"isTapped\": false, \"permanent\": true, \"attributes\": {\"amount\": 1, \"cardType\": \"aura\", \"creature\": {\"power\": {\"add\": 1, \"subtract\": 0}, \"strength\": {\"add\": 1, \"subtract\": 0}}, \"permanent_type\": \"creature\"}, \"equipped_cards\": []}, {\"cardID\": \"MTG_0213\", \"target\": null, \"fieldID\": \"iKdSn8Q0n4yUiE\", \"ownerID\": \"201841156990959616\", \"isTapped\": false, \"permanent\": true, \"attributes\": {\"amount\": 1, \"cardType\": \"aura\", \"creature\": {\"power\": {\"add\": 1, \"subtract\": 0}, \"strength\": {\"add\": 1, \"subtract\": 0}}, \"permanent_type\": \"creature\"}, \"equipped_cards\": []}]}',1,1),(37,'147548446289690625','{\"hand\": [\"MTG_0199\", \"MTG_0212\", \"MTG_0188\", \"MTG_0136\", \"MTG_0184\"], \"graveyard\": []}','{\"tapped\": {}, \"untapped\": {}}','{\"deck\": [\"LAND_0003\", \"MTG_0118\", \"LAND_0004\", \"LAND_0004\", \"MTG_0163\", \"LAND_0001\", \"MTG_0187\", \"MTG_0144\", \"MTG_0189\", \"LAND_0002\", \"MTG_0149\", \"LAND_0005\", \"MTG_0149\", \"MTG_0116\", \"LAND_0003\", \"MTG_0125\", \"LAND_0003\", \"LAND_0004\", \"LAND_0002\", \"MTG_0159\", \"MTG_0195\", \"LAND_0004\", \"MTG_0212\", \"LAND_0002\", \"MTG_0195\", \"LAND_0004\", \"MTG_0174\", \"LAND_0004\", \"LAND_0004\", \"MTG_0127\", \"LAND_0005\", \"MTG_0165\", \"LAND_0001\", \"LAND_0004\", \"MTG_0127\", \"LAND_0004\", \"LAND_0004\", \"MTG_0153\", \"MTG_0140\", \"MTG_0213\", \"LAND_0002\", \"MTG_0125\", \"MTG_0144\", \"MTG_0198\", \"MTG_0135\", \"MTG_0150\", \"MTG_0163\", \"LAND_0004\", \"LAND_0004\", \"MTG_0158\", \"LAND_0004\", \"LAND_0004\", \"MTG_0152\", \"LAND_0004\", \"LAND_0001\", \"MTG_0166\", \"LAND_0004\", \"MTG_0131\", \"MTG_0118\", \"LAND_0004\", \"MTG_0118\", \"MTG_0139\", \"MTG_0214\", \"LAND_0002\", \"LAND_0002\", \"MTG_0187\", \"LAND_0004\", \"MTG_0206\", \"MTG_0176\", \"MTG_0194\", \"MTG_0124\", \"LAND_0002\", \"LAND_0003\", \"MTG_0117\", \"LAND_0004\", \"MTG_0136\", \"LAND_0004\", \"MTG_0208\", \"MTG_0114\", \"MTG_0125\", \"MTG_0114\", \"MTG_0179\", \"LAND_0002\", \"MTG_0186\", \"MTG_0118\", \"MTG_0184\", \"LAND_0004\", \"MTG_0125\"]}',1,'{\"lands\": [{\"cardID\": \"LAND_0004\", \"colors\": \"red\", \"fieldID\": \"KRCKR0sMN6hka2\", \"ownerID\": \"147548446289690625\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0004\", \"colors\": \"red\", \"fieldID\": \"x6EX271ACnf65Y\", \"ownerID\": \"147548446289690625\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0004\", \"colors\": \"red\", \"fieldID\": \"M68ZvAURRcqmjf\", \"ownerID\": \"147548446289690625\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0004\", \"colors\": \"red\", \"fieldID\": \"jiD6eh6Qmtv7AZ\", \"ownerID\": \"147548446289690625\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0004\", \"colors\": \"red\", \"fieldID\": \"zdj3DQomdF3Zgi\", \"ownerID\": \"147548446289690625\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}, {\"cardID\": \"LAND_0001\", \"colors\": \"white\", \"fieldID\": \"k90dCSYTw00Dbu\", \"ownerID\": \"147548446289690625\", \"isTapped\": false, \"permanent\": true, \"equipped_cards\": [], \"manaProduceAmount\": 1}], \"creatures\": [{\"power\": 3, \"cardID\": \"MTG_0153\", \"fieldID\": \"Mig00UBSbWw92J\", \"ownerID\": \"147548446289690625\", \"isTapped\": false, \"strength\": 5, \"permanent\": true, \"attributes\": \"\", \"equipped_cards\": [], \"isDeclaredAttacker\": false, \"isDeclaredDefender\": true}, {\"power\": 3, \"cardID\": \"MTG_0153\", \"fieldID\": \"nmiH6lbPG672QH\", \"ownerID\": \"147548446289690625\", \"isTapped\": false, \"strength\": 5, \"permanent\": true, \"attributes\": \"\", \"equipped_cards\": [], \"isDeclaredAttacker\": false, \"isDeclaredDefender\": true}], \"enchantments\": []}',1,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mtg_user`
--

LOCK TABLES `mtg_user` WRITE;
/*!40000 ALTER TABLE `mtg_user` DISABLE KEYS */;
INSERT INTO `mtg_user` VALUES (89,'80821105685700608',783,17,'{\"rare\": 2, \"common\": 10, \"mythic\": 1, \"uncommon\": 5}',NULL,22,'2019-04-17 14:35:10','2019-04-17 14:35:14',1500,'2019-04-17 14:45:39','2019-04-17 14:34:59',NULL,'2019-03-30 06:51:26','{\"GUILD_253985066290511874\": {\"optedInToServer\": 1}, \"GUILD_347519385398935552\": {\"optedInToServer\": 1}, \"GUILD_510730001251958794\": {\"optedInToServer\": 1}}',NULL,'black',0,0,7,0,0,'BASIC_USER'),(90,'222226372280451072',16,-3,'{\"rare\": 2, \"common\": 10, \"mythic\": 1, \"uncommon\": 5}',NULL,2,'2019-03-31 13:08:24',NULL,50,'2019-04-01 17:07:31',NULL,'2019-04-16 17:45:33','2019-03-24 00:51:17','{\"GUILD_347519385398935552\": {\"optedInToServer\": 1}, \"GUILD_510730001251958794\": {\"optedInToServer\": 1}}',NULL,'white',0,1,0,0,1,'BASIC_USER'),(91,'293836756166377482',94,20,'{\"rare\": 2, \"common\": 10, \"mythic\": 1, \"uncommon\": 5}',NULL,0,'2019-03-24 08:24:27','2019-03-24 08:24:20',325,'2019-03-24 08:20:53',NULL,NULL,'2019-03-24 08:23:53','{\"GUILD_552608199992279041\": {\"optedInToServer\": 1}}',NULL,'black',0,0,0,0,0,'BASIC_USER'),(92,'201841156990959616',0,13,'{\"rare\": 2, \"common\": 10, \"mythic\": 1, \"uncommon\": 5}',NULL,0,NULL,NULL,0,'2019-03-31 08:42:46',NULL,NULL,'2019-03-31 08:11:24','{\"GUILD_510730001251958794\": {\"optedInToServer\": 1}}',NULL,'white',0,0,0,0,0,'BASIC_USER'),(93,'147548446289690625',378,10,'{\"rare\": 2, \"common\": 10, \"mythic\": 1, \"uncommon\": 5}',NULL,0,'2019-04-16 15:52:23','2019-04-01 21:01:05',706,'2019-04-17 20:32:28','2019-04-16 17:45:33',NULL,'2019-03-31 16:05:08','{\"GUILD_347519385398935552\": {\"optedInToServer\": 1}}',NULL,'red',1,0,6,0,0,'BASIC_USER');
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

-- Dump completed on 2019-05-27 15:15:25
