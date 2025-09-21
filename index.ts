
import { Client, GatewayIntentBits, Events, TextChannel, GuildMember } from 'discord.js';
import { CommandHandler } from './src/core/command-handler';
import { getWelcomeMessage } from './src/utils/welcome-message';
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

client.on('guildMemberAdd', async (member: GuildMember) => {
    const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID as string) as TextChannel;
    if (!channel) return;

    const welcomeMessage = getWelcomeMessage(member.id)

    try {
        await channel.send(welcomeMessage);
    } catch (error) {
        console.error('Error sending welcome message:', error);
    }
})

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    console.log("---- Interaction Log ----")
    console.log("User Name: @" + interaction.member?.user.username)
    console.log("User ID:", interaction.member?.user.id)
    console.log("Command:", interaction.commandName)
    console.log("Timestamp:", interaction.createdAt.toISOString())
    console.log("-------------------------")
    await commandHandler.handle(interaction);
});

client.login(process.env.DISCORD_TOKEN as string);
