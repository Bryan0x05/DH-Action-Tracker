// Fear tracker command

const { SlashCommandBuilder } = require('discord.js');
const fs = require("fs")
const path = require('path');
// Path to the JSON file
const filePath = './data/act_tokens.json';
// Num of recent contributors to track. This is to use which players are most and least actives
const NUM_RECENT_CON = 5
module.exports = {
    data: new SlashCommandBuilder()
        .setName('act')
        .setDescription('Updates & tracks the amount of action tokens!')
        .addStringOption(option =>
            option
                .setName("op")
                .setDescription("add or subtract operator")
                .addChoices({ name: "+", value: '+' }, { name: "-", value: "-" },{name: 'recentPlayers',value:"contributor"}, 
                {name: 'convert_to_fear',value:"convertToFear"}, {name: 'clearRecent', value: "clearRecent"})
                .setRequired(false)
        )
        .addNumberOption(option =>
            option
                .setName("mod")
                .setDescription("modifier")
                .setRequired(false)
        ),
    async execute(interaction) {
        const op = interaction.options.getString('op');
        // if mod is null, default to 1
        const mod = interaction.options.getNumber('mod') ?? 1;
    
        const data = (() => {
            try {
                return fs.readFileSync(filePath, 'utf8');
            } catch (error) {
                console.error("Error reading file:", error)
            }
        })();

        const tracker = JSON.parse(data);
        let total = tracker.total;
        const old = total
        // get userID for limited user tracking
        const userID = interaction.user.id
        const username = interaction.user.username
        switch(op){
            // add tokens(by default add 1)
            case '+':
                // catch malform input for addition operation
                if( mod < 0){ 
                    await interaction.reply({content: "Malformed addition command, please use a number "});
                    break;
                }
                total += mod;
                // if new user, make an entry starting at 0.
                if (!tracker.users[userID]) {
                    tracker.users[userID] = { "username:": username,"action_tokens": 0 };
                }
                // update user entry with the amt contributed
                tracker.users[userID].action_tokens += mod

                // update recent contributors
                updateRecentContributors(tracker, userID, username, mod)

                // maximum cap of 100 (this really should never be reached)
                if (total > 100) total = 100
                tracker.total = total
                updateTracker(tracker, old, interaction);

                break;
            // remove tokens(by default remove 1)
            case '-':
                total -= mod;
                // negative prevention
                if (total < 0) total = 0
                tracker.total = total
                updateTracker(tracker, old, interaction);

                break;
            // print all recent contributors
            case 'contributor':
                const recent_con = getRecentContributorsList(tracker.recentContributors);
                await interaction.reply(`Most recent contributors to action pool:\n${recent_con}`);               
                break;
            // convert all action tokens to fear at a 2:1 ration
            case 'convertToFear':
                var Fear = Math.floor(total/2)
                var totalFear = updateFear(Fear)
                // drop the rest of the action tokens
                tracker.total = 0
                // update tracker to reflect changes
                await updateTracker(tracker, old, interaction);
                await interaction.followUp(`Created ${Fear} Fear tokens. New Fear total: ${totalFear}, `)
                break;
            // clear recent contributors list
            case 'clearRecent':
                tracker.recentContributors.length = 0
                try {
                    fs.writeFileSync(filePath, JSON.stringify(tracker, null, 4));
                    // forward updated status
                    await interaction.reply(`Clear recent contributors list`);
                } catch (error) {
                    console.error("Error clearing contributors:", error)
                }
                break;
            // print total tokens
            default: 
                await interaction.reply(`Action token total: ${tracker.total}`)
                break;
        }
    },
};

// Function to update the recent contributors using a circular buffer
function updateRecentContributors(tracker, userId, username, mod) {
    // if it doesn't exist, create an empty attribute
    if (!tracker.recentContributors) {
        tracker.recentContributors = [];
    }

    // Add the new contributor to the beginning of the array
    tracker.recentContributors.unshift([userId, username, mod]);

    // Limit the array size to NUM_RECENT_CONTRIBUTORS
    if (tracker.recentContributors.length > NUM_RECENT_CON) {
        tracker.recentContributors.length = NUM_RECENT_CON;
    }
}

// Function to get the list of recent contributors
function getRecentContributorsList(recentContributors) {
    if (!recentContributors || recentContributors.length === 0) {
        return 'No recent contributors.';
    }
    // <@ creates a mention of the user in discord
    return recentContributors.map(([userId, username, tokens]) => `${username} (tokens contributed: ${tokens})`).join('\n');
}

async function updateTracker(tracker, old, interaction){
    try {
        fs.writeFileSync(filePath, JSON.stringify(tracker, null, 4));
        // forward updated status
        await interaction.reply(`Action token pool updated. Total: ${tracker.total}. Old total: ${old}`);
    } catch (error) {
        console.error("Error updating action tokens:", error)
    }
}
function updateFear(amt){
    try{
        const filePath = 'data/fear_tokens.json';
        const data = fs.readFileSync(filePath, 'utf8');
        const tokens = JSON.parse(data);
        tokens.total += amt;
        fs.writeFileSync(filePath, JSON.stringify(tokens, null, 4));
        return tokens.total
    } catch (error) {
        console.error("Error updating fear tokens after action conversion:", error)
        // -1, when fear cannot be below 0 clearly indicates this failed.
        return -1;
    }
}