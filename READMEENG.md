
# Rimuru Discord.js v14 Bot v3.0

<p align="center">
  <a href="https://api.weblutions.com/discord/invite/dvCKjxHn35">
    <img src="https://api.weblutions.com/discord/invite/dvCKjxHn35" alt="Rimuru Shop Discord" />
  </a>
</p>
 
General Discord Bot

[Türkçe versiyonu için tıkla](README.md)


# Changes Made:

   * Suggestion system
   * Server Banner
   * Snipe (Shows the last deleted message in the channel)
   * Button Role
   * Private Room system

## Table of Contents

* [Requirements](#requirements)
* [Getting Started](#getting-started)
* [Author](#author)
* [Setup](#setup)

## Requirements

- [Node](https://nodejs.org/en/) 

## Getting Started

First, make sure all the necessary tools are installed on your local machine, and then follow these steps.

## Setup

* [VDS Setup](#vds)

## VDS
``` bash
# Clone the repository
git clone https://github.com/oktayyavuz/Rimuru-Discord.js-v14-Bot.git

# Enter the directory
cd Rimuru-Discord.js-v14-Bot/

# Install npm
npm install

# Configure the Discord Bot Token
  echo "token='Paste your token here.'" > config.json
```

### Required Permissions

Ensure that the "applications.commands" application scope is enabled in your bot, which can be found under the "OAuth2" tab in the [developer portal](https://discord.com/developers/applications/).

Enable "Server Member Intents" and "Message Intents" which can be found under the "Bot" tab in the [developer portal](https://discord.com/developers/applications/).

### Configuration

After cloning the project and installing all dependencies, you need to add your Discord API token to the 'config.token' file.

### Changing the Status

You can change the status of your Discord bot by editing the `activities` variables in the `/events/ready.js` file. You can modify `ActivityType.Watching` to `Playing`, `Watching`, etc.

### Starting the Application

```bash
node index.js
```
or 

```bash
npm run start
```
or 

```bash
# Run the start.bat file.
```

## Author

[Oktay Yavuz](https://oktaydev.com.tr/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details.
