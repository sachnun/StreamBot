import { Message, ActivityOptions } from 'discord.js-selfbot-v13';
import { VideoProgress, StreamStatus } from '../types/index.js';
import logger from '../utils/logger.js';

export class ProgressManager {
	private streamStatus: StreamStatus;
	private lastPresenceUpdate: number = 0;
	private lastMessageUpdate: number = 0;
	private progressMessage: Message | null = null;
	private progressInterval: NodeJS.Timeout | null = null;
	private readonly PRESENCE_INTERVAL = 10000; // 10 seconds
	private readonly MESSAGE_INTERVAL = 10000; // 10 seconds
	private currentVideoTitle: string = '';
	private isLive: boolean = false;

	constructor(streamStatus: StreamStatus) {
		this.streamStatus = streamStatus;
	}

	/**
	 * Start progress tracking
	 */
	startTracking(
		videoTitle: string,
		duration: number,
		isLive: boolean,
		message?: Message
	): void {
		this.currentVideoTitle = videoTitle;
		this.isLive = isLive;
		
		logger.info(`Starting progress tracking for: ${videoTitle} (Live: ${isLive})`);

		// Create initial progress
		this.streamStatus.currentProgress = {
			currentTime: 0,
			duration: duration,
			progressPercent: 0,
			isLive: isLive,
			lastUpdated: Date.now(),
			videoTitle: videoTitle
		};

		// Send initial progress message if provided
		if (message) {
			this.sendInitialProgressMessage(message);
		}

		// Start periodic updates
		this.progressInterval = setInterval(() => {
			this.updateDisplay();
		}, this.PRESENCE_INTERVAL);
	}

	/**
	 * Update progress data from FFmpeg parser
	 */
	updateProgress(progress: VideoProgress): void {
		this.streamStatus.currentProgress = progress;
		
		// Update display if significant change (>5% progress)
		const lastProgress = this.streamStatus.currentProgress;
		const significantChange = 
			!lastProgress ||
			Math.abs(progress.progressPercent - lastProgress.progressPercent) >= 5;
		
		if (significantChange) {
			this.updateDisplay();
		}
	}

	/**
	 * Stop progress tracking
	 */
	stopTracking(): void {
		if (this.progressInterval) {
			clearInterval(this.progressInterval);
			this.progressInterval = null;
		}

		// Clean up progress message
		if (this.progressMessage) {
			this.progressMessage.delete().catch(() => {
				// Message might already be deleted
			});
			this.progressMessage = null;
		}

		this.streamStatus.currentProgress = undefined;
		this.streamStatus.progressMessageId = undefined;
		this.currentVideoTitle = '';
		
		logger.info('Progress tracking stopped');
	}

	/**
	 * Format time as HH:MM:SS
	 */
	private formatTime(seconds: number): string {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		
		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		}
		return `${minutes}:${secs.toString().padStart(2, '0')}`;
	}

	/**
	 * Create progress bar string (10 blocks)
	 */
	private createProgressBar(percent: number): string {
		const filled = Math.floor(percent / 10);
		const empty = 10 - filled;
		return '▓'.repeat(filled) + '░'.repeat(empty);
	}

	/**
	 * Get formatted progress text for Discord display
	 */
	private getProgressText(): string {
		const progress = this.streamStatus.currentProgress;
		if (!progress) {
			return this.currentVideoTitle;
		}

		if (this.isLive) {
			// Live stream format: 🔴 LIVE [02:15:30] - Video Title
			const elapsed = this.formatTime(progress.currentTime);
			return `🔴 LIVE [${elapsed}] - ${this.currentVideoTitle}`;
		}

		// VOD format: ▓▓▓░░░░░░░ 35% [02:15/06:30] - Video Title
		const bar = this.createProgressBar(progress.progressPercent);
		const current = this.formatTime(progress.currentTime);
		const duration = this.formatTime(progress.duration);
		
		return `${bar} ${progress.progressPercent}% [${current}/${duration}] - ${this.currentVideoTitle}`;
	}

	/**
	 * Update Discord presence/activity (rate limited to 10s)
	 */
	private updatePresence(): void {
		const now = Date.now();
		if (now - this.lastPresenceUpdate < this.PRESENCE_INTERVAL) {
			return;
		}

		const text = this.getProgressText();
		
		// Update bot activity status
		if (this.streamStatus.channelInfo?.guildId) {
			// This will be set from the streaming service
			// We'll emit an event or callback to update the activity
			logger.debug(`Updating presence: ${text}`);
		}

		this.lastPresenceUpdate = now;
	}

	/**
	 * Update channel message (rate limited to 10s)
	 */
	private async updateMessage(): Promise<void> {
		if (!this.progressMessage) {
			return;
		}

		const now = Date.now();
		if (now - this.lastMessageUpdate < this.MESSAGE_INTERVAL) {
			return;
		}

		try {
			const text = this.getProgressText();
			await this.progressMessage.edit(text);
			this.lastMessageUpdate = now;
			logger.debug(`Updated progress message: ${text}`);
		} catch (error) {
			logger.warn('Failed to update progress message:', error);
		}
	}

	/**
	 * Update both presence and message
	 */
	private updateDisplay(): void {
		this.updatePresence();
		this.updateMessage();
	}

	/**
	 * Send initial progress message
	 */
	private async sendInitialProgressMessage(message: Message): Promise<void> {
		try {
			const text = this.getProgressText();
			this.progressMessage = await message.channel.send(text);
			this.streamStatus.progressMessageId = this.progressMessage.id;
			this.lastMessageUpdate = Date.now();
			logger.info('Sent initial progress message');
		} catch (error) {
			logger.error('Failed to send initial progress message:', error);
		}
	}

	/**
	 * Get current progress status for Discord activity
	 */
	getActivityOptions(): ActivityOptions {
		const text = this.getProgressText();
		return {
			name: text,
			type: 'WATCHING'
		};
	}

	/**
	 * Check if tracking is active
	 */
	isTracking(): boolean {
		return this.progressInterval !== null;
	}
}
