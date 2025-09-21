
import { Client, Collection, type Interaction } from 'discord.js';
import fs from 'fs';
import path from 'path';

export class CommandHandler {
    public commands: Collection<string, any> = new Collection();

    constructor(private client: Client) {}

    async loadCommands(commandsPath: string) {
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

        for (const file of commandFiles) {
            const command = await import(path.resolve(commandsPath, file));
            this.commands.set(command.data.name, command);
        }
    }

    async handle(interaction: Interaction) {
        if (!interaction.isCommand()) return;

        const command = this.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}
