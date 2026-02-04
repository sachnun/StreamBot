import { Message } from "discord.js-selfbot-v13";
import { CommandManager } from "../commands/manager.js";
import { CommandContext, Video, StreamStatus } from "../types/index.js";
import { StreamingService } from "../services/streaming.js";
import config from "../config.js";

export async function handleMessageCreate(
	message: Message,
	videos: Video[],
	streamStatus: StreamStatus,
	streamingService: StreamingService,
	commandManager: CommandManager
): Promise<void> {
	// Ignore bots, self, non-command channels, and non-commands
	if (
		message.author.bot ||
		message.author.id === message.client.user?.id ||
		!message.content.startsWith(config.prefix)
	) return;

	// Split command and arguments
	const args = message.content.slice(config.prefix!.length).trim().split(/ +/);

	// If no command provided, ignore
	if (args.length === 0) {
		return;
	}

	const commandName = args.shift()!.toLowerCase();

	const context: CommandContext = {
		message,
		args,
		videos,
		streamStatus,
		streamingService
	};

	const executed = await commandManager.executeCommand(commandName, context);

	if (!executed) {
		await message.reply(`**Error**: Unknown command. Use \`${config.prefix}help\` to see available commands.`);
	}
}
