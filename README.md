# Sinistra AI

Sinistra is a Discord bot for Elite Dangerous, created to serve Communism Interstellar and its allies.

## Setup

1. Clone the repository.
2. Create a `.env` file in the root of the project and add the following environment variables:

```
DISCORD_TOKEN=
GEMINI_API_KEY=
```

3. Install the dependencies:

```
bun install
```

## Running the bot

To start the bot, run the following command:

```
bun start
```

## Docker

To build the Docker image, run:

```
docker build -t sinistra-ai .
```

To run the Docker container:

```
docker run -d --env-file .env sinistra-ai
```