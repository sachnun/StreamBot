import { Message, ActivityOptions } from "discord.js-selfbot-v13";
import config from "../config.js";
import logger from "./logger.js";
import fs from 'fs';

/**
 * Send a message with optional auto-delete
 */
async function sendWithAutoDelete(
  sendFn: () => Promise<Message>,
  shouldDelete: boolean,
  delayMs: number
): Promise<Message> {
  const msg = await sendFn();
  
  if (shouldDelete && delayMs > 0) {
    setTimeout(async () => {
      try {
        await msg.delete();
      } catch (err) {
        // Message might already be deleted
      }
    }, delayMs);
  }
  
  return msg;
}

/**
 * Shared utility functions for Discord bot operations
 */
export const DiscordUtils = {
  /**
   * Create idle status for Discord bot
   */
  status_idle(): ActivityOptions {
    return {
      name: config.prefix + "help",
      type: 'WATCHING'
    };
  },

  /**
   * Create watching status for Discord bot
   */
  status_watch(name: string): ActivityOptions {
    return {
      name: `${name}`,
      type: 'WATCHING'
    };
  },

  /**
   * Send error message
   */
  async sendError(message: Message, error: string): Promise<Message> {
    return sendWithAutoDelete(
      () => message.reply(`**Error**: ${error}`),
      config.auto_delete_error,
      config.auto_delete_delay * 1000
    );
  },

  /**
   * Send success message
   */
  async sendSuccess(message: Message, description: string): Promise<Message> {
    return sendWithAutoDelete(
      () => message.channel.send(`**Success**: ${description}`),
      config.auto_delete_success,
      config.auto_delete_delay * 1000
    );
  },

  /**
   * Send info message
   */
  async sendInfo(message: Message, title: string, description: string): Promise<Message> {
    return sendWithAutoDelete(
      () => message.channel.send(`**${title}**: ${description}`),
      config.auto_delete_info,
      config.auto_delete_delay * 1000
    );
  },

  /**
   * Send playing message
   */
  async sendPlaying(message: Message, title: string): Promise<Message> {
    const content = `**Now Playing**: \`${title}\``;
    return message.reply(content);
  },

  /**
   * Send finish message
   */
  async sendFinishMessage(message: Message): Promise<Message> {
    return sendWithAutoDelete(
      () => message.channel.send('**Finished**: Finished playing video.'),
      config.auto_delete_finished,
      config.auto_delete_delay * 1000
    );
  },

  /**
   * Send list message
   */
  async sendList(message: Message, items: string[], type?: string): Promise<Message> {
    let content: string;
    if (type == "ytsearch") {
      content = `**Search Results**:\n${items.join('\n')}`;
    } else if (type == "refresh") {
      content = `**Video list refreshed**:\n${items.join('\n')}`;
    } else {
      content = `**Local Videos List**:\n${items.join('\n')}`;
    }
    
    return sendWithAutoDelete(
      () => type === "ytsearch" || type === "refresh" 
        ? message.reply(content) 
        : message.channel.send(content),
      config.auto_delete_info,
      config.auto_delete_delay * 1000
    );
  }
};

/**
 * Error handling utilities
 */
export const ErrorUtils = {
  /**
   * Handle and log errors consistently
   */
  async handleError(error: any, context: string, message?: Message): Promise<void> {
    logger.error(`Error in ${context}:`, error);

    if (message) {
      await DiscordUtils.sendError(message, `An error occurred: ${error.message || 'Unknown error'}`);
    }
  },

  /**
   * Handle async operation errors
   */
  async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
    message?: Message
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      await this.handleError(error, context, message);
      return null;
    }
  }
};

/**
 * General utility functions
 */
export const GeneralUtils = {
  /**
   * Check if input is a valid streaming URL
   */
  isValidUrl(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    // Check for common streaming platforms
    return input.includes('youtube.com/') ||
         input.includes('youtu.be/') ||
         input.includes('twitch.tv/') ||
         input.startsWith('http://') ||
         input.startsWith('https://');
  },

  /**
   * Check if a path is a local file
   */
  isLocalFile(filePath: string): boolean {
    try {
      return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
    } catch (error) {
      return false;
    }
  }
};

/**
 * Time formatting utilities for progress display
 */
export const TimeUtils = {
  /**
   * Format seconds to HH:MM:SS or MM:SS
   */
  formatDuration(seconds: number): string {
    if (seconds < 0 || !isFinite(seconds)) {
      return '00:00';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Format duration range [current/total]
   */
  formatDurationRange(current: number, total: number): string {
    return `${this.formatDuration(current)}/${this.formatDuration(total)}`;
  },

  /**
   * Create progress bar string (10 blocks)
   */
  createProgressBar(percent: number, length: number = 10): string {
    const clampedPercent = Math.max(0, Math.min(100, percent));
    const filled = Math.floor((clampedPercent / 100) * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  },

  /**
   * Create progress bar with percentage
   */
  createProgressDisplay(percent: number, current: number, total: number): string {
    const bar = this.createProgressBar(percent);
    const timeRange = this.formatDurationRange(current, total);
    return `${bar} ${percent}% [${timeRange}]`;
  }
};
