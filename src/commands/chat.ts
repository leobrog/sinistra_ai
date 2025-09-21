
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const data = new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Chat with Sinistra')
    .addStringOption(option =>
        option.setName('message')
            .setDescription('The message to send to Sinistra')
            .setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
    const message = interaction.options.getString('message');

    if (!message) {
        return interaction.reply({ content: 'You must provide a message.', ephemeral: true });
    }

    await interaction.deferReply();

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const result = await model.generateContent(message as string);
        const response = result.response;
        const text = response.text();
        await interaction.editReply(text);
    } catch (error) {
        console.error(error);
        await interaction.editReply('There was an error while processing your request.');
    }
};
