<div align="center">

<img src="src/server/public/favicon.svg" alt="StreamBot" width="400"/>

# StreamBot

[![GitHub release](https://img.shields.io/github/v/release/ysdragon/StreamBot?style=flat-square&color=blue)](https://github.com/ysdragon/StreamBot/releases)
[![CodeFactor](https://www.codefactor.io/repository/github/ysdragon/streambot/badge?style=flat-square)](https://www.codefactor.io/repository/github/ysdragon/streambot)
[![License](https://img.shields.io/github/license/ysdragon/StreamBot?style=flat-square&color=green)](LICENSE)
[![Ceasefire Now](https://badge.techforpalestine.org/default)](https://techforpalestine.org/learn-more)

**Advanced Discord self-bot for multi-source video streaming**

</div>

---

## Overview

StreamBot is a sophisticated Discord self-bot designed for streaming video content from multiple sources directly to voice channels. It features a comprehensive web management interface, intelligent queue management, and extensive configuration options for optimal streaming performance.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Obtaining Discord Token](#obtaining-discord-token)
- [Configuration](#configuration)
- [Usage](#usage)
- [Docker Deployment](#docker-deployment)
- [Commands](#commands)
- [Web Interface](#web-interface)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)
- [License](#license)

---

## Features

### Streaming Capabilities

- **Local Media**: Stream videos from local storage
- **YouTube Integration**: Support for standard videos, live streams, and search functionality
- **Twitch Support**: Live streams and VOD playback
- **Universal URL Support**: Compatible with any source supported by [yt-dlp](https://github.com/yt-dlp/yt-dlp)

### Management Features

- **Queue System**: Intelligent auto-play with skip and reorder functionality
- **Web Dashboard**: Browser-based interface for complete library management
- **Video Previews**: Automatic thumbnail generation and metadata extraction
- **Upload Support**: Direct file upload and remote URL downloading
- **Runtime Configuration**: Adjust streaming parameters without service interruption

### Technical Features

- **Hardware Acceleration**: GPU encoding support for improved performance
- **Multiple Codecs**: H.264, H.265, VP8, VP9, AV1 support
- **Cookie Authentication**: Access private and premium content
- **Docker Support**: Containerized deployment with Cloudflare WARP option

---

## Requirements

### Mandatory Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| [Bun](https://bun.sh/) | v1.1.39+ | Recommended runtime |
| [Node.js](https://nodejs.org/) | v21+ | Alternative runtime |
| [FFmpeg](https://www.ffmpeg.org/) | Latest | Video encoding |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) | Latest | Content extraction |

### Optional Enhancements

- **GPU with hardware acceleration** for improved encoding performance
- **High-speed internet connection** for streaming remote content
- **Adequate storage capacity** for video library and cache

---

## Installation

### Standard Installation

```bash
# Clone repository
git clone https://github.com/ysdragon/StreamBot
cd StreamBot

# Install dependencies (Bun recommended)
bun install
# OR with npm
npm install
```

### Configuration Setup

1. Copy the example configuration:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your settings (see [Configuration](#configuration))

3. Obtain your Discord token (see [Obtaining Discord Token](#obtaining-discord-token))

**Note**: Required directories are created automatically on first execution.

### Obtaining Discord Token

To use this self-bot, you will need to extract your Discord user token. Follow these steps carefully:

1. **Create a dedicated Discord account** for the bot (recommended to avoid risking your primary account)

2. **Log in to Discord** via your web browser at [discord.com](https://discord.com)

3. **Open Developer Tools** by pressing `Ctrl + Shift + I` (Windows/Linux) or `Cmd + Option + I` (macOS)

4. **Navigate to the Console tab** and paste the following code:

   ```javascript
   window.webpackChunkdiscord_app.push([
       [Symbol()],
       {},
       req => {
           if (!req.c) return;
           for (let m of Object.values(req.c)) {
               try {
                   if (!m.exports || m.exports === window) continue;
                   if (m.exports?.getToken) return copy(m.exports.getToken());
                   for (let ex in m.exports) {
                       if (m.exports?.[ex]?.getToken && m.exports[ex][Symbol.toStringTag] !== 'IntlMessagesProxy') return copy(m.exports[ex].getToken());
                   }
               } catch {}
           }
       },
   ]);

   window.webpackChunkdiscord_app.pop();
   console.log('%cWorked!', 'font-size: 50px');
   ```

5. **Press Enter** to execute the code. If successful, you will see "Worked!" displayed in the console

6. **Your token is now copied to your clipboard**. Paste it into the `TOKEN` field in your `.env` file

> **Security Notice**: Your Discord token provides full access to your account. Never share it publicly or commit it to version control. Treat it with the same confidentiality as a password.

---

## Configuration

StreamBot is configured entirely through environment variables in the `.env` file.

### Discord Settings

```bash
# Authentication (Required)
TOKEN="your_discord_token_here"

# Server Configuration
GUILD_ID="your_server_id"
COMMAND_CHANNEL_ID="command_channel_id"
VIDEO_CHANNEL_ID="voice_channel_id"

# Command Settings
PREFIX="$"
ADMIN_IDS=["your_user_id"]  # JSON array or comma-separated
```

### Streaming Configuration

```bash
# Output Resolution
STREAM_WIDTH="1280"
STREAM_HEIGHT="720"
STREAM_FPS="30"

# Quality Settings
STREAM_BITRATE_KBPS="2000"
STREAM_MAX_BITRATE_KBPS="2500"

# Encoding Options
STREAM_VIDEO_CODEC="H264"              # H264 | H265 | VP8 | VP9 | AV1
STREAM_H26X_PRESET="ultrafast"         # ultrafast to veryslow
STREAM_HARDWARE_ACCELERATION="false"
STREAM_RESPECT_VIDEO_PARAMS="false"
```

### File Management

```bash
# Storage Paths
VIDEOS_DIR="./videos"
PREVIEW_CACHE_DIR="./tmp/preview-cache"

# Authentication for Premium Content
YTDLP_COOKIES_PATH=""  # Path to cookies.txt for private videos
```

### Web Interface

```bash
SERVER_ENABLED="true"
SERVER_PORT="8080"
SERVER_USERNAME="admin"
SERVER_PASSWORD="secure_password"  # Supports bcrypt/argon2 hashes
```

---

## Usage

### Starting the Bot

```bash
# With Bun (Recommended)
bun run start

# With Node.js
npm run build
npm run start:node
```

### Running Web Interface Only

```bash
# Bun
bun run server

# Node.js
npm run server:node
```

### Video Playback Workflow

The bot supports multiple content sources through a unified interface:

1. **Local files**: Reference by filename from `VIDEOS_DIR`
2. **YouTube**: Provide URL or use search: `$ytsearch <query>` then `$play <number>`
3. **Twitch**: Provide stream or VOD URL
4. **Other sources**: Any URL supported by yt-dlp

Videos are managed through an intelligent queue system with auto-advance.

---

## Docker Deployment

### Standard Container

```bash
# Setup
mkdir streambot && cd streambot
wget https://raw.githubusercontent.com/ysdragon/StreamBot/main/docker-compose.yml

# Configure docker-compose.yml with your settings
# Launch
docker compose up -d
```

### Cloudflare WARP Deployment

```bash
# Download WARP configuration
wget https://raw.githubusercontent.com/ysdragon/StreamBot/main/docker-compose-warp.yml

# Add WARP license key and configure environment
docker compose -f docker-compose-warp.yml up -d
```

> **Note**: Web interface is unavailable in WARP mode due to network isolation.

---

## Commands

### Playback Control

| Command | Syntax | Description |
|---------|--------|-------------|
| `play` | `play <name\|url\|query>` | Play local, URL, or search YouTube |
| `ytsearch` | `ytsearch <query>` | Search YouTube videos |
| `stop` | `stop` | Stop playback and clear queue (aliases: `leave`, `s`) |
| `skip` | `skip` | Advance to next video (alias: `next`) |
| `queue` | `queue` | Display current queue |
| `list` | `list` | Browse local video library |

### System Commands

| Command | Syntax | Description |
|---------|--------|-------------|
| `status` | `status` | Display streaming status |
| `preview` | `preview <video>` | Generate thumbnail previews |
| `ping` | `ping` | Check bot latency |
| `help` | `help` | Show command reference |
| `config` | `config [param] [value]` | View/modify settings (aliases: `cfg`, `set`) |

---

## Web Interface

When enabled (`SERVER_ENABLED="true"`), access the management dashboard at `http://localhost:8080`.

### Interface Features

- **Library Management**: Browse, upload, and organize video files
- **Remote Downloads**: Import videos directly from URLs
- **Preview System**: View thumbnails and metadata
- **File Operations**: Delete, rename, and manage content

---

## Contributing

We welcome contributions from the community:

- **Bug Reports**: [Open an issue](https://github.com/ysdragon/StreamBot/issues/new)
- **Feature Requests**: [Submit via issues](https://github.com/ysdragon/StreamBot/issues)
- **Code Contributions**: [Create a pull request](https://github.com/ysdragon/StreamBot/pulls)

---

## Disclaimer

**Warning**: This software may violate Discord's Terms of Service. Use at your own risk. The developers assume no liability for any consequences resulting from the use of this software.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) file for details.

---

<div align="center">

**[ Back to Top ](#streambot)**

</div>
