
# Rimuru Discord.js v14 Bot v3.1

<p align="center">
  <a href="https://api.weblutions.com/discord/invite/dvCKjxHn35">
    <img src="https://api.weblutions.com/discord/invite/dvCKjxHn35" alt="Rimuru Shop Discord" />
  </a>
</p>
 
General Discord Bot

[Türkçe versiyonu için tıkla](README.md)


# Changes Made:

   * Bug Fix.


## Table of Contents

* [Features](#features)
* [Requirements](#requirements)
* [Getting Started](#getting-started)
* [Author](#author)
* [Setup](#setup)

## Features

<details>
<summary>Features</summary>

<details>
<summary>Registration System</summary>

- Allows users to register.
- Supports enabling and disabling the registration system.

</details>

<details>
<summary>AFK System</summary>

- Users can set themselves as AFK (Away From Keyboard).
- Automatically removes AFK status when they return.

</details>

<details>
<summary>Love Calculator</summary>

- Fun tool to measure the love percentage between two users.

</details>

<details>
<summary>Ban Management</summary>

- Ban users from the server and view the ban list.
- Forceban allows banning users even if they're not on the server.

</details>

<details>
<summary>Giveaway System</summary>

- Create, manage, and reroll giveaway winners.
- Enhanced giveaway messages with emojis and timers.

</details>

<details>
<summary>Emoji Management</summary>

- Add emojis to the server and view existing emojis.

</details>

<details>
<summary>Join/Leave Messages</summary>

- Customize messages for users joining or leaving the server.
- Supports enabling and disabling the feature.

</details>

<details>
<summary>Swear and Advertisement Protection</summary>

- Automatically blocks swearing and advertisements.

</details>

<details>
<summary>Level System</summary>

- Tracks user levels and gives rewards.
- Add or remove custom XP.
- View level rankings.

</details>

<details>
<summary>Mod Log</summary>

- Tracks important events happening in the server.

</details>

<details>
<summary>Mute Management</summary>

- Temporarily mute users for a specific time.
- Manage mute settings.

</details>

<details>
<summary>Voting System</summary>

- Start votes in the server and view results.

</details>

<details>
<summary>Auto Role and Auto Tag</summary>

- Automatically assign roles and tags to new users.
- Supports disabling the feature.

</details>

<details>
<summary>Ping and Statistics</summary>

- View the bot's ping and other statistics.

</details>

<details>
<summary>Role Management</summary>

- Assign and remove roles for users.
- Create new roles.

</details>

<details>
<summary>Delete and Clean</summary>

- Quickly clear a specified number of messages.

</details>

<details>
<summary>Banned Words System</summary>

- Block specific words and remove them from the list.

</details>

<details>
<summary>Private Room System</summary>

- Allows users to create their own private voice channels.

</details>

<details>
<summary>Suggestion System</summary>

- Collect suggestions from users and view weekly suggestions.

</details>

</details>


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
