const { Client, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "oylama",
  description: "Oylama yaparsınız!",
  type: 1,
  options: [
    {
        name: "süre",
        description: "Oylama süresini girin (örneğin: 1m, 1h, 1d)",
        type: 3,
        required: true
    }
  ],
  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
      return interaction.reply({ content: "❌ | Yetkiniz yok!", ephemeral: true });
    }

    const süre = interaction.options.getString('süre');
    const süreMs = parseDuration(süre);
    if (!süreMs) {
      return interaction.reply({ content: "❌ | Geçersiz süre formatı! Lütfen doğru bir süre girin (örneğin: 1m, 1h, 1d).", ephemeral: true });
    }

    const modal = new ModalBuilder()
      .setCustomId('oylamaModal')
      .setTitle('Oylama Metnini Girin');

    const oylamaMetni = new TextInputBuilder()
      .setCustomId('oylamaMetni')
      .setLabel('Oylama Metni')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(oylamaMetni);
    modal.addComponents(firstActionRow);
    await interaction.showModal(modal);

    const filter = i => i.customId === 'oylamaModal' && i.user.id === interaction.user.id;
    interaction.awaitModalSubmit({ filter, time: 60000 })
      .then(async modalInteraction => {
        const oylamaMetni = modalInteraction.fields.getTextInputValue('oylamaMetni');

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setStyle(ButtonStyle.Success)
              .setLabel("(0) Evet")
              .setEmoji("✅")
              .setCustomId("evetoylama"),
            new ButtonBuilder()
              .setStyle(ButtonStyle.Danger)
              .setLabel("(0) Hayır")
              .setEmoji("❌")
              .setCustomId("hayıroylama")
          );

        const embed = new EmbedBuilder()
          .setTitle("Oylama!")
          .setDescription(`## ${oylamaMetni}`)
          .addFields(
            { name: 'Evet Oy ver', value: `> Evet oyu vermek için **Evet** butonuna tıklayın.`, inline: false },
            { name: 'Hayır Oy ver', value: `> Hayır oyu vermek için **Hayır** butonuna tıklayın.`, inline: false }
          )
          .setImage("https://c.tenor.com/4BZURP8cynMAAAAC/demon-lord-rimuru.gif")
          .setColor("Random");

        const msg = await modalInteraction.reply({ embeds: [embed], components: [row], fetchReply: true });

        const bitişZamanı = Date.now() + süreMs;
        db.set(`oylama_${msg.id}`, {
          evet: 0,
          hayir: 0,
          mesaj: msg.id,
          kanal: msg.channel.id,
          bitis: bitişZamanı,
          oylar: {} // Kullanıcıların oylarını saklamak için bir obje
        });

        checkOylamaSüresi(client, msg.id);

        const collector = msg.createMessageComponentCollector({ filter: i => i.customId.endsWith('oylama'), time: süreMs });

        collector.on('collect', async i => {
          const oylamaData = db.get(`oylama_${msg.id}`);
          if (!oylamaData) return;

          const userVotes = oylamaData.oylar[i.user.id] || {};

          if (i.customId === 'evetoylama') {
            if (userVotes.evet) {
              oylamaData.evet -= 1;
              delete oylamaData.oylar[i.user.id].evet;
            } else {
              oylamaData.evet += 1;
              oylamaData.oylar[i.user.id] = { evet: true };
              if (userVotes.hayir) {
                oylamaData.hayir -= 1;
                delete oylamaData.oylar[i.user.id].hayir;
              }
            }
          } else if (i.customId === 'hayıroylama') {
            if (userVotes.hayir) {
              oylamaData.hayir -= 1;
              delete oylamaData.oylar[i.user.id].hayir;
            } else {
              oylamaData.hayir += 1;
              oylamaData.oylar[i.user.id] = { hayir: true };
              if (userVotes.evet) {
                oylamaData.evet -= 1;
                delete oylamaData.oylar[i.user.id].evet;
              }
            }
          }

          db.set(`oylama_${msg.id}`, oylamaData);

          const newRow = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Success)
                .setLabel(`(${oylamaData.evet}) Evet`)
                .setEmoji("✅")
                .setCustomId("evetoylama"),
              new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel(`(${oylamaData.hayir}) Hayır`)
                .setEmoji("❌")
                .setCustomId("hayıroylama")
            );

          await i.update({ components: [newRow] });
        });

        collector.on('end', collected => {
          finishOylama(client, msg.id);
        });
      })
      .catch(err => {
        console.error('Modal gönderimi zaman aşımına uğradı veya başarısız oldu:', err);
        interaction.followUp({ content: "❌ | Mesaj yazma işlemi sırasında bir hata oluştu veya işlem zaman aşımına uğradı.", ephemeral: true });
      });
  }
};

function parseDuration(duration) {
  const units = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000
  };
  const match = duration.match(/^(\d+)([smhd])$/);
  return match ? parseInt(match[1]) * units[match[2]] : null;
}

function checkOylamaSüresi(client, msgId) {
  const oylamaData = db.get(`oylama_${msgId}`);
  if (!oylamaData) return;

  const kalanSüre = oylamaData.bitis - Date.now();
  if (kalanSüre <= 0) {
    finishOylama(client, msgId);
  } else {
    setTimeout(() => finishOylama(client, msgId), kalanSüre);
  }
}

async function finishOylama(client, msgId) {
  const oylamaData = db.get(`oylama_${msgId}`);
  if (!oylamaData) return;

  const channel = await client.channels.fetch(oylamaData.kanal);
  const msg = await channel.messages.fetch(oylamaData.mesaj);

  const resultEmbed = new EmbedBuilder()
    .setTitle("Oylama Sona Erdi!")
    .setDescription(`${msg.embeds[0].description}`)
    .addFields(
      { name: 'Evet Oyları', value: `${oylamaData.evet}`, inline: true },
      { name: 'Hayır Oyları', value: `${oylamaData.hayir}`, inline: true }
    )
    .setColor("Random");

  await msg.edit({ embeds: [resultEmbed], components: [] });
  db.delete(`oylama_${msgId}`);
}

client.on('ready', async () => {
  const allData = db.all();
  if (Array.isArray(allData)) {
    const oylamaKeys = allData
      .filter(entry => entry.ID.startsWith('oylama_'))
      .map(entry => entry.ID);
    oylamaKeys.forEach(key => checkOylamaSüresi(client, key.split('_')[1]));
  } else {
    console.error("db.all() did not return an array.");
  }
});