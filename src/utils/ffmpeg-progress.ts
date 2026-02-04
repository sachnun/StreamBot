import { VideoProgress } from '../types/index.js';

export interface FFmpegProgressData {
	frame?: number;
	fps?: number;
	stream0?: number;
	stream1?: number;
	q?: number;
	size?: string;
	time?: string;
	bitrate?: string;
	speed?: string;
	progress?: 'continue' | 'end';
	outTimeMs?: number;
	outTimeUs?: number;
}

export class FFmpegProgressParser {
	private duration: number = 0;
	private isLive: boolean = false;
	private videoTitle?: string;
	private onProgressCallback?: (progress: VideoProgress) => void;

	constructor(duration: number = 0, isLive: boolean = false, videoTitle?: string) {
		this.duration = duration;
		this.isLive = isLive;
		this.videoTitle = videoTitle;
	}

	setOnProgress(callback: (progress: VideoProgress) => void) {
		this.onProgressCallback = callback;
	}

	parseLine(line: string): FFmpegProgressData | null {
		const data: FFmpegProgressData = {};

		// Parse out_time_ms (microseconds)
		const outTimeMsMatch = line.match(/out_time_ms=(\d+)/);
		if (outTimeMsMatch) {
			data.outTimeMs = parseInt(outTimeMsMatch[1], 10);
		}

		// Parse out_time_us (microseconds, alternative)
		const outTimeUsMatch = line.match(/out_time_us=(\d+)/);
		if (outTimeUsMatch) {
			data.outTimeUs = parseInt(outTimeUsMatch[1], 10);
		}

		// Parse frame count
		const frameMatch = line.match(/frame=\s*(\d+)/);
		if (frameMatch) {
			data.frame = parseInt(frameMatch[1], 10);
		}

		// Parse fps
		const fpsMatch = line.match(/fps=\s*([\d.]+)/);
		if (fpsMatch) {
			data.fps = parseFloat(fpsMatch[1]);
		}

		// Parse stream counts
		const stream0Match = line.match(/stream_0_0_q=\s*(-?[\d.]+)/);
		if (stream0Match) {
			data.stream0 = parseFloat(stream0Match[1]);
		}

		const stream1Match = line.match(/stream_0_1_q=\s*(-?[\d.]+)/);
		if (stream1Match) {
			data.stream1 = parseFloat(stream1Match[1]);
		}

		// Parse quality
		const qMatch = line.match(/q=\s*(-?[\d.]+)/);
		if (qMatch) {
			data.q = parseFloat(qMatch[1]);
		}

		// Parse size
		const sizeMatch = line.match(/size=\s*(\S+)/);
		if (sizeMatch) {
			data.size = sizeMatch[1];
		}

		// Parse time (HH:MM:SS.ms format)
		const timeMatch = line.match(/time=\s*(\d{2}):(\d{2}):(\d{2}\.\d+)/);
		if (timeMatch) {
			const hours = parseInt(timeMatch[1], 10);
			const minutes = parseInt(timeMatch[2], 10);
			const seconds = parseFloat(timeMatch[3]);
			data.time = `${hours}:${minutes}:${seconds}`;
		}

		// Parse bitrate
		const bitrateMatch = line.match(/bitrate=\s*(\S+)/);
		if (bitrateMatch) {
			data.bitrate = bitrateMatch[1];
		}

		// Parse speed
		const speedMatch = line.match(/speed=\s*([\d.]+)x/);
		if (speedMatch) {
			data.speed = speedMatch[1] + 'x';
		}

		// Parse progress status
		const progressMatch = line.match(/progress=(\w+)/);
		if (progressMatch) {
			data.progress = progressMatch[1] as 'continue' | 'end';
		}

		// Check if we got any meaningful data
		const hasData = Object.values(data).some(v => v !== undefined);
		return hasData ? data : null;
	}

	processProgress(data: FFmpegProgressData): VideoProgress | null {
		let currentTimeMs = 0;

		// Prioritize out_time_ms or out_time_us
		if (data.outTimeMs !== undefined) {
			currentTimeMs = data.outTimeMs;
		} else if (data.outTimeUs !== undefined) {
			currentTimeMs = data.outTimeUs / 1000;
		} else if (data.time) {
			// Parse HH:MM:SS.ms format
			const parts = data.time.split(':');
			if (parts.length === 3) {
				const hours = parseInt(parts[0], 10);
				const minutes = parseInt(parts[1], 10);
				const seconds = parseFloat(parts[2]);
				currentTimeMs = (hours * 3600 + minutes * 60 + seconds) * 1000000;
			}
		}

		if (currentTimeMs === 0) {
			return null;
		}

		// Convert microseconds to seconds
		const currentTime = Math.floor(currentTimeMs / 1000000);

		return {
			currentTime,
			duration: this.duration,
			progressPercent: this.calculateProgress(currentTime),
			isLive: this.isLive,
			lastUpdated: Date.now(),
			videoTitle: this.videoTitle
		};
	}

	private calculateProgress(currentTime: number): number {
		if (this.isLive || this.duration === 0) {
			return 0;
		}
		return Math.min(Math.round((currentTime / this.duration) * 100), 100);
	}

	cleanup(): void {
		// Nothing to cleanup without pause detection
	}
}

/**
 * Create progress line parser for FFmpeg stderr
 */
export function createProgressLineParser(
	duration: number,
	isLive: boolean,
	videoTitle?: string,
	onProgress?: (progress: VideoProgress) => void
): FFmpegProgressParser {
	const parser = new FFmpegProgressParser(duration, isLive, videoTitle);
	if (onProgress) {
		parser.setOnProgress(onProgress);
	}
	return parser;
}
