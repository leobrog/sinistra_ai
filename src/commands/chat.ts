import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { embedDocuments } from '../core/embed-documents';
import path from 'path';
import fs from 'fs/promises';
import { smartChunk } from '../utils/smart-chunk';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const data = new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Chat with Sinistra')
    .addStringOption(option =>
        option.setName('message')
            .setDescription('The message to send to Sinistra')
            .setRequired(true));

async function analyzeIntent(message: string): Promise<string> {
    const systemInstruction = await fs.readFile('./prompt/intent-instructions.txt', 'utf-8');
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        systemInstruction
    });

    const result = await model.generateContent(message);
    const response = result.response;
    const intent = response.text().trim().toLowerCase();

    if (intent.includes('question')) {
        return 'question';
    } else {
        return 'conversation';
    }
}

export async function execute(interaction: ChatInputCommandInteraction) {
    const message = interaction.options.getString('message');

    if (!message) {
        return interaction.reply({ content: 'You must provide a message.', ephemeral: true });
    }

    await interaction.deferReply();

    const systemPrompt = await fs.readFile('./prompt/system-prompt.txt', 'utf-8');

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        systemInstruction: systemPrompt,
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
        ],
    });

    try {
        const intent = await analyzeIntent(message);

        console.log("Intent: ", intent)

        if (intent === 'question') {
            const docsPath = path.join(__dirname, '..', '..', 'docs');
            const vectorStore = await embedDocuments(docsPath);

            const retriever = vectorStore.asRetriever();
            const relevantDocs = await retriever.invoke(message);

            const context = relevantDocs.map(doc => doc.pageContent).join('\n\n');

            const chat = model.startChat();

            const result = await chat.sendMessage([
                {
                    text: `Information Obtained from sources:\n${context}\n\nQuestion: ${message}`
                },
            ]);

            const response = result.response;
            const text = response.text();
            const chunks = smartChunk(text);

            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i] || 'Empty chunk received'; // Provide fallback
                if (i === 0) {
                    await interaction.editReply(chunk);
                } else {
                    await interaction.followUp(chunk);
                }
            }
        } else {
            const chat = model.startChat();
            const result = await chat.sendMessage(message);
            const response = result.response;
            const text = response.text();
            const chunks = smartChunk(text);

            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i] || 'Empty chunk received'; // Provide fallback
                if (i === 0) {
                    await interaction.editReply(chunk);
                } else {
                    await interaction.followUp(chunk);
                }
            }
        }
    } catch (error) {
        console.error(error);
        await interaction.editReply('There was an error while processing your request.');
    }
};
