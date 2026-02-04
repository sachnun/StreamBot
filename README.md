<div align="center">

<img src="src/server/public/favicon.svg" alt="StreamBot" width="400"/>

# StreamBot

[![GitHub release](https://img.shields.io/github/v/release/ysdragon/StreamBot?style=flat-square&color=blue)](https://github.com/ysdragon/StreamBot/releases)

Quick way to stream video to Discord voice channels.

</div>

---

## Quick Start

```bash
npm install
npm run build && npm start
```

## How to Use

### 1. Setup

Copy `.env.example` to `.env` and fill in:

```bash
TOKEN="your_token_here"           # Discord token (required)
GUILD_ID="server_id"              # Server ID
COMMAND_CHANNEL_ID="channel_id"   # Command channel ID
VIDEO_CHANNEL_ID="channel_id"     # Voice channel ID
PREFIX="$"                         # Command prefix
```

### 2. Get Discord Token

1. Open Discord in browser
2. Press `Ctrl+Shift+I` → Console tab
3. Paste the script below and press Enter
4. Token will be automatically copied to clipboard

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

### 3. Stream Video

```
$play https://youtube.com/watch?v=xxx   # Stream YouTube
$play nama_file.mp4                      # Play local file
$play search term                        # Search YouTube
```

## Commands

| Command | Description |
|---------|-------------|
| $play   | Play video |
| $stop   | Stop streaming |
| $skip   | Skip to next video |
| $queue  | Show queue |
| $list   | Show local files |

## Web Interface

Open `http://localhost:8080` to upload and manage videos from browser.

## Requirements

- Node.js v21+
- FFmpeg
- yt-dlp

## License

Distributed under the MIT License. See [LICENSE](LICENSE) file for details.

---

<div align="center">

**[ Back to Top ](#streambot)**

</div>
