    var playerCount = `${Constants.client.guilds.cache.map((guild) => guild.memberCount).reduce((p, c) => p + c)}`;

    Constants.client.user.setActivity(`over ${Constants.client.guilds.cache.size} servers / ${playerCount} players`, {
      type: "WATCHING",
    });