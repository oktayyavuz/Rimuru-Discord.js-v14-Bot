const anime = require("../database/anime.json");
const nsfw = require("../database/nsfw.json");

const animeRandom = () => {
  return {
    anime: () => anime[mathRandom(anime.length)],
    nsfw: () => nsfw[mathRandom(nsfw.length)],
  };
};

const mathRandom = (number) => ~~(Math.random() * number);

module.exports = animeRandom();