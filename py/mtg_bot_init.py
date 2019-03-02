import discord
import sys
import os
import mysql.connector
from mysql.connector.connection import MySQLConnection
from mysql.connector import pooling
from mysql.connector.constants import ClientFlag
from mysql.connector import errorcode
import asyncio
from discord.ext import commands
from discord.ext.commands import Bot
from discord.ext.commands import Context
from enum import Enum
import platform

# Here you can modify the bot's prefix and description and wether it sends help in direct messages or not.
#  
client = commands.Bot(description="Magic the Gathering Bot by suff0cati0n", command_prefix="m!", pm_help = False)

#from ptd_bot_init import runDBCheck
#import ptd_bot_database_handling
#import ptd_bot_functions

TOKEN = 'NTEwOTcyNzAzOTEwNjU4MDY4.DskJgw.ns75DAB9n0fFzzijiuD44x-ame8'

config = {
    'database': 'mtg_db',
    'user': 'mtg_bot',
    'password': '',
    'host': '127.0.0.1'
    #'client_flags': [ClientFlag.SSL],
    #'ssl_ca': 'W:/PtD Bot/ssl/server-ca.pem',
    #'ssl_cert': 'W:/PtD Bot/ssl/client-cert.pem',
    #'ssl_key': 'W:/PtD Bot/ssl/client-key.pem',
}

############GAME FUNCTIONS/VARIABLES#########################
list_cards = {
    'Ajani\'s Welcome': {
        'name': 'Ajani\'s Welcome',
        'type': 'enchantment',
        'rarity': 'uncommon',
        'legendary': 0,
        'set': 'M19',
        'power': 0,
        'toughness': 0,
        'mana_cost': {
        	'black': 0,
        	'white': 1,
        	'red': 0,
        	'green': 0,
        	'blue': 0,
        	'colorless': 0
        },
        'attributes': {},
        'card_id': 'MTG_0001'
    }
}
    
wildcard_chance = {
    #list_weapons['pocket']: 35,
    #list_weapons['blunt']: 25,
    #list_weapons['rifle']: 10,
    #list_weapons['explosive']: 2,
    #list_ammunition: 8,
    #list_junk: 20
}
##################################################################

#client = discord.Client()
status = False
#InitConnection = ''
#MYSQLConnection = ''
test_connection_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name = "mysql_connection_thread_pool", pool_size = 5, pool_reset_session=True, **config)


def runDBCheck():
    global status
    try:
        print ("Printing connection pool properties ")
        print("Connection Pool Name - ", test_connection_pool.pool_name)
        print("Connection Pool Size - ", test_connection_pool.pool_size)
        # Get connection object from a pool

        connection_object = test_connection_pool.get_connection()
        if connection_object.is_connected():
            db_Info = connection_object.get_server_info()
            print("Connected to MySQL database using connection pool ... MySQL Server version on ",db_Info)

            cursor = connection_object.cursor()
            #cursor.execute("SHOW STATUS LIKE 'Ssl_cipher';")
            #record = cursor.fetchone()
            cursor.execute("select database();")
            record = cursor.fetchone()
            print ("You're connected to - ", record)
            status = True
    except Error as e :
        print ("Error while connecting to MySQL using Connection pool ", e)
        status = False
    finally:
        #closing database connection.
        status = False
        if(connection_object.is_connected()):
            status = True
            cursor.close()
            connection_object.close()
            print("MySQL connection is closed")
    return

################MYSQL FUNCTIONS####################
async def MAKE_DB_CALL_NO_RESULT(query):
    return

async def MAKE_DB_CALL_ARRAY_RESULT(query):
    return

async def MAKE_DB_CALL_SINGLE_RESULT(query):
    global status
    if status == False:
        return print("Database connection not initialized")

    MYSQLConnection = test_connection_pool.get_connection()
    #query = "SELECT * FROM ptd_user"
    #query = "SELECT * FROM '%s' WHERE index = %s" % (table, str(_index))
    if (MYSQLConnection.is_connected()):
        cursor = MYSQLConnection.cursor()
        cursor.execute("USE mtg_db")
        result = cursor.execute(query)
        record = cursor.fetchone()
        cursor.fetchone()
        print(record)
        cursor.close()
        MYSQLConnection.close()
    return record
###################################################

@client.event
async def on_message(message):
    # we do not want the bot to reply to itself
    if message.author == client.user:
        return

    if message.content.startswith('p!'):
        if message.content == "m!open":
            await openDBConnection()
        elif message.content == "m!close":
            await closeDBConnection()
        elif message.content == "m!test":
            msg = '{0.author.mention}->'.format(message)
            await client.send_message(message.channel, msg + str(await MAKE_DB_CALL_SINGLE_RESULT("SELECT * FROM mtg_user WHERE discord_server_id = 'GG01'")))

    await client.process_commands(message)
    return
    #if message.content.startswith('!hello'):
        #msg = 'Hello {0.author.mention}'.format(message)
        #await client.send_message(message.channel, msg)

##################BOT COMMANDS######################
@client.command(pass_context=True)
async def begin(ctx: commands.Context, *args):
    print("command: " + str(ctx.message))
    await client.send_message(ctx.message.channel, '{} arguments: {}'.format(len(args), ', '.join(args)))
    pass

@client.command(pass_context=True)
async def purge(ctx: commands.Context, *args):
    print("command: " + str(ctx.message))
    await client.purge_from(channel=ctx.message.channel, limit=int(args[0]))
    await client.send_message(ctx.message.channel, "[SYSTEM] The last " + args[0] + " messages have been purged.")
    pass

@client.command(pass_context=True)
async def info(ctx: commands.Context, *args):
    print("command: " + str(ctx.message))
    msg = '{0.author.mention}->'.format(ctx.message)
    try:
        print("info")
    except Error as e :
            print(e)
    finally:
        return

####################################################

################ERROR HANDLING######################
class ERROR_CODES(Enum):
    DB_CONNECTION_FAILED = "The connection to the database has failed. Please check the network, user, and/or pass."
    MISSING_PERMISSIONS_403 = "Whoops! We ran into a very serious permissions error. No need to panic! The server admins are already aware with a log report being submitted automatically!"
    COMMAND_NOT_REGISTERED = "Whoops! This command is not registered to do anything. No need to panic! The server admins are already aware with a log report being submitted automatically!"
    UNKNOWN_COMMAND = "Whoops! That's not a recognized command format. Please check your command arguments."


async def handle_error(error):
    pass
####################################################


####################################################
@client.event
async def on_ready():
    await client.change_presence(game=discord.Game(name='Magic the Gathering Bot'))
    print('Logged in as')
    print(client.user.name)
    print(client.user.id)
    print('Discord.py Version ' + discord.__version__)
    print('------')
    print('TESTING DATABASE CONNECTION...')
    print(runDBCheck())
    if status == 1:
        print('DB Connection Successful')
    if status == 0:
        print('DB Connection Failed')

#client.add_command(begin)
client.run(TOKEN)
