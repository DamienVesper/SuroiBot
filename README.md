<div align="center">
    <img src=".github/assets/img/logos/suroi.svg" width="750" alt="Suroi logo">
    <hr />
</div>

<div align="center">
    <img src="https://img.shields.io/badge/node.js%20-%23339933.svg?style=for-the-badge&logo=nodedotjs&logoColor=white" />
    <img src="https://img.shields.io/badge/typescript-%233178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/mongodb-%2347A248?style=for-the-badge&logo=mongodb&logoColor=white" />
    <img src="https://img.shields.io/badge/discord.js%20-%235865F2.svg?style=for-the-badge" />
    <img src="https://img.shields.io/badge/ytdl--core%20-%23E82020.svg?style=for-the-badge" />
    <img src="https://img.shields.io/badge/axios%20-%235A29E4.svg?style=for-the-badge&logo=axios" />
    <img src="https://img.shields.io/badge/ffmpeg%20-%23007808.svg?style=for-the-badge&logo=ffmpeg" />
</div>

## Prerequisites
 * [Node.js](https://nodejs.org)
 * [pnpm](https://pnpm.io)
 * [MongoDB](https://www.mongodb.com)

## Installation
This project utilizes [pnpm](https://pnpm.io). No other package manager is supported for this project.

To install dependencies for this project, open a command line interface at the directory of the cloned repository, and run:
```sh
pnpm install
```

This will create a `node_modules` directory in that of your project and link the packages there.

## Setup
Testing the application using a database on your own machine will require a localhost database setup:

1. Copy the contents of `.env.example` to `.env` in the root directory of the repository.
2. Replace the contents of each key with personalized values.
```
# Discord
DISCORD_TOKEN="<discord_application_token>"
DISCORD_ID="<discord_application_id>"
GUILD_ID="<guild_id>"

# Database
MONGODB_URI="<uri>"

# Development mode?
NODE_ENV="production"
```

## Development
To run the bot locally in development, execute
```
pnpm run dev
```


## Production
To build for production, open up a terminal window in the root directory of the project and run
```sh
pnpm build
```

To execute a production build, run
```
pnpm start
```
