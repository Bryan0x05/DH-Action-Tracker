

# How to setup
## Dependencies 
* Node.js, found here: https://nodejs.org/en
* Using NPM(a package manager included in Node.js) run "npm installl" in the same dictory as the included "package.json". This will install all required packages.
* All dependencies should now be set-up
## Configuring the Bot
* Change name the "data_template" folder to "data".
* You can follow Discord.js guide here on how to create a bot, and add to your server: https://discordjs.guide/
* Note: Make sure you give it slash command privilleges.
* Once you've created your bot, and invited it to your server. Add your bot's secret token(DO NOT SHARE IT) to the config.json. For help see: https://discordjs.guide/creating-your-bot/
* Fill in your application ID in the client id field to the "config.json" file. For help see: https://discordjs.guide/creating-your-bot/command-deployment.html#command-registration
* If you want to run a test server for the commands. Also fill out the guildID field in "config.json". For help see see the above link again.

# Registering / Deploying Commands
* "node deploy-commands-test.js" will only deploy the slash commands to the test server(The one who's id you filled in the guildid). It will automatically add the prefix "test-" to commands to make them easy to tell apart from the globally deployed commmands. 
* "node deploy-commands-global.js" will deploy slash commands to all servers where this bot is present.

# Running The Bot
* "node index.js" will bot up the bot, and it'll login in to discord.
* With the bot now online, it'll start listening for slash commands.

# Slash commands
* By typing a slash command and selecting an option all choices can be see on discord. For completion a secondary list will be included here, but the slash command list should be seen as the final authority if there is any discrepancies.
* /act  => total amount of action tokens
* /act (+ or -) => assumes +1 or -1, to update the total number of action tokens by adding or subtracting the provided number
* /act (+ or -) number => update total number of action tokens
* /act (activeplayers) => Prints the username of the players for the last 5 addition operations, and their total tokens. This is so you can see how has been most active at the table.
* /act (convert_to_fear) => convert all remaining action tokens to fear tokens at a 2:1 ration, any excess get's dropped.
* /fear => total amount of fear tokens
* /fear (+ or -) number => update total maount of fear tokens by adding or subtracting the provided number.
* /ping => replies with pong, a good way to test if the bot is working.