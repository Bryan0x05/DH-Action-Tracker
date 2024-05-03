/*+++++++++++++++++++++++++++++++

Description:  Updates/register commands
on all servers this bot is on.

+++++++++++++++++++++++++++++++*/


// file used to register and update the slash commands
const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./data/config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
    try {
        // clear slate
        await deleteExistingCommands();

        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();

// clear the slate by deleteing existing commands
async function deleteExistingCommands() {
    try {
        console.log('Deleting existing commands...');

        const existingCommands = await rest.get(
            Routes.applicationGuildCommands(clientId, guildId)
        );

        if (existingCommands.length > 0) {
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: [] } // Empty array to delete all commands
            );

            console.log('Existing commands deleted successfully.');
        } else {
            console.log('No existing commands found. Skipping deletion.');
        }
    } catch (error) {
        console.error('Error deleting existing commands:', error);
    }
}