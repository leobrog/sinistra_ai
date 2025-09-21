
import { Client, GatewayIntentBits } from 'discord.js';
import { CommandHandler } from './src/core/command-handler';
import path from 'path';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const commandHandler = new CommandHandler(client);

client.once('clientReady', async () => {
    console.log('Sinistra is online!');
    await commandHandler.loadCommands(path.resolve(__dirname, './src/commands'));
    client.application?.commands.set(commandHandler.commands.map(c => c.data.toJSON()));
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    await commandHandler.handle(interaction);
});

console.log(process.env.DISCORD_TOKEN as string)
client.login(process.env.DISCORD_TOKEN as string);
