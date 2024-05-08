# Rimuru Discord.js v14 Bot v2.0

General Discord Bot


## Table of content

* [Requirements](#requirements)
* [Getting started](#getting-started)
* [Author](#author)

## Requirements

- [Node](https://nodejs.org/en/) - Version 16 or higher
- [NPM](https://www.npmjs.com/)

## Getting started

First, make sure you have all the required tools installed on your local machine then continue with these steps.

### Installation

```bash
# Clone the repository
git clone https://github.com/oktayyavuz/Rimuru-Discord.js-v14-Bot.git

# Enter into the directory
cd Rimuru-Discord.js-v14-Bot/

# Install the dependencies
npm install

# Configure Discord Bot Token
 echo "token='INSERT_YOUR_TOKEN_HERE'" > config.json
```

### Required permissions

Make sure that your bot has the `applications.commands` application scope enabled, which can be found under the `OAuth2` tab on the [developer portal](https://discord.com/developers/applications/)

Enable the `Server Members Intent` and `Message Content Intent` which can be found under the `Bot` tab on the [developer portal](https://discord.com/developers/applications/)

### Configuration

After cloning the project and installing all dependencies, you need to add your Discord API token in the `config.token` file.

### Changing the status

You can change the status of your discord bot by editing the `activity` and `activityType` variables inside the `/events/ready.js` file. `activityType` needs to be set to an integer with the following [options](https://discord-api-types.dev/api/discord-api-types-v10/enum/ActivityType).


### Starting the application

```bash
node index.js
```


## Author

[Oktay Yavuz](https://oktaydev.com.tr/)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details
