import { Message } from "discord.js-selfbot-v13";
import { Command, CommandContext } from "../types/index.js";
import { DiscordUtils } from "../utils/shared.js";
import { CommandManager } from "./manager.js";

export abstract class BaseCommand implements Command {
	abstract name: string;
	abstract description: string;
	abstract usage: string;
	aliases?: string[];

	constructor(_commandManager?: CommandManager) {
	}

	abstract execute(context: CommandContext): Promise<void>;

	protected async sendError(message: Message, error: string): Promise<void> {
		await DiscordUtils.sendError(message, error);
	}

	protected async sendSuccess(message: Message, description: string): Promise<void> {
		await DiscordUtils.sendSuccess(message, description);
	}

	protected async sendInfo(message: Message, title: string, description: string): Promise<void> {
		await DiscordUtils.sendInfo(message, title, description);
	}

	protected async sendList(message: Message, items: string[], type?: string): Promise<void> {
		await DiscordUtils.sendList(message, items, type);
	}

	protected async sendPlaying(message: Message, title: string): Promise<void> {
		await DiscordUtils.sendPlaying(message, title);
	}

	protected async sendFinishMessage(message: Message): Promise<void> {
		await DiscordUtils.sendFinishMessage(message);
	}
}