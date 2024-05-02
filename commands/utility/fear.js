// Fear tracker command

const { SlashCommandBuilder } = require('discord.js');
const fs = require("fs")
// Path to the JSON file
const filePath = './data/fear_tokens.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fear')
        .setDescription('Updates & tracks the amount of fear tokens!')
        .addStringOption(option =>
            option
                .setName("op")
                .setDescription("add or subtract operator")
                .addChoices({ name: "+", value: '+' }, { name: "-", value: "-" })
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
        const mod = interaction.options.getNumber('mod');

        // If malformed command
        if ((op && !mod) || (!op && mod)) {
            // ephemeral means only the comander sees the reply
            await interaction.reply({ content: 'Malformed Fear command, include both optional arguments, or neither.', ephemeral: true });
        } else {
            // read data from the file, error catching incase file cannot be opened
            const data = (() => {
                try {
                    return fs.readFileSync(filePath, 'utf8');
                } catch (error) {
                    console.error("Error reading file:", error)
                }
            })();

            const tokens = JSON.parse(data);
            let total = tokens.total;
            const old = total

            switch (op) {
                case '+':
                    total += mod;
                    // maximum cap of 20
                    if (total > 20) total = 20
                    tokens.total = total;
                    updateTokens(tokens, old, interaction);
                    break;
                case '-':
                    total -= mod
                    // negative prevention
                    if (total < 0) total = 0
                    tokens.total = total;
                    updateTokens(tokens, old, interaction);
                    break;
                default:
                    await interaction.reply(`Total Fear: ${total}`);
                    break;
            }
        }
    },
};

async function updateTokens(tokens, old, interaction) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(tokens, null, 4));
        // forward updated status
        await interaction.reply(`Fear tokens updated. Total: ${tokens.total}, old total: ${old}`);
    } catch (error) {
        console.error("Error updating fear tokens:", error)
    }
};