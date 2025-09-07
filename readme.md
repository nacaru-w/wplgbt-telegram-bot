# LGBT Telegram Bot

A Telegram bot built for the **Wikiproyecto LGBT+** community.  
It is written in **TypeScript** and runs on **Node.js**, with optional Docker support for easy deployment.

---

## 🚀 Features
- Connects to Telegram using [`node-telegram-bot-api`](https://github.com/yagop/node-telegram-bot-api).
- Reads configuration (`config.json`) for the bot token.
- Uses `idData.json` to manage groups and chat IDs.
- Supports scheduled tasks with [`node-cron`](https://www.npmjs.com/package/node-cron).
- Runs either locally or inside a Docker container.

---

## ⚙️ Requirements
- [Node.js](https://nodejs.org/) >= 20
- [npm](https://www.npmjs.com/)
- (Optional) [Docker](https://www.docker.com/)

---

## 🛠 Installation & Usage

## 1. Local Development

1. Clone the repo:

```bash
    git clone https://github.com/nacaru-w/wplgbt-telegram-bot.git
    cd wplgbt-telegram-bot
```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Configure config.json and idData.json files with token and group info.

4. Compile TypeScript:

    ```sh
    npm run compile
    ```

5. Run bot

    ```sh
    npm run bot
    ```

### 2. Docker Usage

You can run the bot inside a Docker container:

1. Build the Docker image:

    ```sh
    docker build -t lgbt-telegram-bot .
    ```

2. Run the container:

    ```sh
    docker run --rm -it lgbt-telegram-bot
    ```

> **Note:** Make sure your `config.json` and `idData.json` files are present in the project root before building the Docker image.

## License

MIT