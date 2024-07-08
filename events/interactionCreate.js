const { Collection, ButtonStyle, EmbedBuilder } = require("discord.js");
const db = require("croxydb");
const config = require("../config.json"); 
const Discord = require("discord.js");
const edb = require("croxydb")
const { readdirSync } = require("fs");
const { createButton, deleteMessageButton } = require("../function/functions");
const { ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionsBitField } = require('discord.js');
const moment = require("moment");
  require("moment-duration-format");
  const os = require("os");
  const fs = require("fs");

  module.exports =  {
      name: Discord.Events.InteractionCreate,
  
      run: async(client, interaction) => {
  
          const guildId = interaction.guild.id;
          const selectedPlayerId = db.get(`selectedPlayer_${guildId}`);
  
          if (interaction.customId === 'truth' || interaction.customId === 'dare') {
              if (interaction.user.id !== selectedPlayerId) {
                  return interaction.reply({ content: "Bu seçim sana ait değil!", ephemeral: true });
              }
  
              let content;
              if (interaction.customId === 'truth') {
                  const truthQuestions = JSON.parse(fs.readFileSync('./daretruthgame/truth.json', 'utf-8'));
                  const truthQuestion = truthQuestions[Math.floor(Math.random() * truthQuestions.length)];
                  content = `Doğruluk sorusu: ${truthQuestion}`;
              } else if (interaction.customId === 'dare') {
                  const dareTasks = JSON.parse(fs.readFileSync('./daretruthgame/dare.json', 'utf-8'));
                  const dareTask = dareTasks[Math.floor(Math.random() * dareTasks.length)];
                  content = `Cesaret görevi: ${dareTask}`;
              }
  
              await interaction.reply({ content, ephemeral: false });
  
              setTimeout(async () => {
                  const replayButton = new Discord.ButtonBuilder()
                      .setCustomId('replay')
                      .setLabel('Oyunu Tekrar Başlat')
                      .setEmoji("🔄")
                      .setStyle(Discord.ButtonStyle.Success);
  
                  const replayEmbed = new Discord.EmbedBuilder()
                      .setTitle("Oyun Bitti!")
                      .setDescription("Oyunu tekrar başlatmak için aşağıdaki butona tıklayın.")
                      .setColor("Random")
                      .setTimestamp();
  
                  const replayRow = new Discord.ActionRowBuilder()
                      .addComponents(replayButton);
  
                  await interaction.followUp({ embeds: [replayEmbed], components: [replayRow] });
              }, 10000);
          } else if (interaction.customId === 'replay') {
              await interaction.reply({ content: "Oyun yeniden başlatılıyor...", ephemeral: true });
  
              if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                  return interaction.followUp({ content: "❌ | Bu komutu kullanma yetkiniz yok!", ephemeral: true });
              }
  
              const startEmbed = new EmbedBuilder()
                  .setTitle("🎉 Doğruluk Cesaret Oyunu 🎉")
                  .setDescription("Oyun 10 Saniye İçinde Başlıyor...\n\nNasıl Oynanır?\n• Bu oyunu bilmeyen bence Discord'u kapatıp hava almaya çıksın.\n• Her neyse, katılımcılar aşağıdaki :bell: tepkisine tıklasın.\n\n**Not: Oyunun başlaması için en az iki oyuncu gereklidir.**")
                  .setColor("Random")
                  .setTimestamp();
  
              const startMessage = await interaction.followUp({ embeds: [startEmbed], fetchReply: true });
  
              await startMessage.react('🔔');
  
              const filter = (reaction, user) => reaction.emoji.name === '🔔' && !user.bot;
              const collector = startMessage.createReactionCollector({ filter, time: 10000 });
  
              collector.on('end', async collected => {
                  const players = collected.first() ? collected.first().users.cache.filter(user => !user.bot) : new Collection();
                  if (players.size === 0) {
                      const zeroPlayer = new EmbedBuilder()
                          .setTitle("ÇOK YALNIZIM :(")
                          .setDescription("Kimse basmadı:(")
                          .setColor("Random")
                          .setTimestamp();
                      return interaction.followUp({ embeds: [zeroPlayer] });
                  }
                  if (players.size < 2) {
                      const notEnoughPlayersEmbed = new EmbedBuilder()
                          .setTitle("❌ Yetersiz Katılımcı")
                          .setDescription("Bu oyun en az 2 kişi ile oynanabilir.")
                          .setColor("Random")
                          .setTimestamp();
                      return interaction.followUp({ embeds: [notEnoughPlayersEmbed] });
                  }
  
                  const playerIds = players.map(user => user.id);
  
                  const spinningEmbed = new EmbedBuilder()
                      .setTitle("Şişe Çevriliyor...")
                      .setImage("https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif")
                      .setColor("Random")
                      .setTimestamp();
                  await interaction.followUp({ embeds: [spinningEmbed] });
  
                  setTimeout(async () => {
                      const randomPlayerIndex = Math.floor(Math.random() * playerIds.length);
                      const selectedPlayer = playerIds[randomPlayerIndex];
  
                      db.set(`selectedPlayer_${interaction.guild.id}`, selectedPlayer);
  
                      const truthOrDareEmbed = new Discord.EmbedBuilder()
                          .setTitle("Doğruluk mu Cesaret mi?")
                          .setDescription(`<@${selectedPlayer}>, seçimini yap!`)
                          .setColor("Random")
                          .setTimestamp();
  
                      const truthButton = new Discord.ButtonBuilder()
                          .setCustomId('truth')
                          .setLabel('Doğruluk')
                          .setStyle(ButtonStyle.Primary);
  
                      const dareButton = new Discord.ButtonBuilder()
                          .setCustomId('dare')
                          .setLabel('Cesaret')
                          .setStyle(ButtonStyle.Danger);
  
                      const row = new ActionRowBuilder()
                          .addComponents(truthButton, dareButton);
  
                      await interaction.followUp({ embeds: [truthOrDareEmbed], components: [row] });
                  }, 10000);
              });
          }
  if(interaction.isChatInputCommand()) {

    if (!interaction.guildId) return;

    readdirSync('./commands').forEach(f => {

      const cmd = require(`../commands/${f}`);

      if(interaction.commandName.toLowerCase() === cmd.name.toLowerCase()) {

		console.log(`Komut kullandı: ${interaction.user.tag} (${interaction.user.id}) (${interaction.guild.name}) `)

       return cmd.run(client, interaction, db);

      }


    });



  }


  if(interaction.isModalSubmit()) {
    if(interaction.customId === 'ticketforms'){
      const ticketSystem = db.fetch(`ticketSystem_${interaction.guild.id}`)
    
    
      const lvl = db.fetch(`ticketLvl_${interaction.guild.id}`) || 0;
    
      db.add(`ticketLvl_${interaction.guild.id}`, 1)
    
    
      const ticketYetkili = await interaction.guild.roles.cache.find( ch => ch.id === ticketSystem.yetkili );
    
      const ticketCategory = db.fetch(`ticketCategory_${interaction.guild.id}`);
    
      const ticketsebep = interaction.fields.getTextInputValue('ticketInput');
     const channel = await interaction.guild.channels.create({
       name: `talep-${interaction.user.username}-`+lvl,
       type: Discord.ChannelType.GuildText,
       parent: ticketCategory.category,
       permissionOverwrites: [
         {
           id: interaction.guild.id,
           deny: [Discord.PermissionsBitField.Flags.ViewChannel],
         },
          {
           id: interaction.user.id,
           allow: [Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages],
         },
         {
          id: ticketYetkili.id,
          allow: [Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages],
         },
       ],
     });
     const sebepTicket = new Discord.EmbedBuilder()
     .setDescription(`Neden talep açtığını öğrenebilir miyiz?\n> \`${ticketsebep}\``)
     const ticketUserEmbed = new Discord.EmbedBuilder()
     .setAuthor({ name: `${interaction.user.username} | Destek açıldı`, iconURL: `${interaction.user.displayAvatarURL({ dynmaic: true })} ` })
     .setThumbnail(interaction.guild.iconURL({ dynmaic: true }))
     .addFields([ 
      { name: "Destek açan:", value: `${interaction.user}`, inline: true },
      { name: "Açılış zamanı:", value: `<t:${parseInt(channel.createdTimestamp / 1000)}:R>`, inline: true }
     ])
     .setColor('Green')
     .setFooter({ text: `Oluşturan: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynmaic: true })}` })
     .setTimestamp()
     
     const row = new Discord.ActionRowBuilder()
     .addComponents(
       new Discord.ButtonBuilder()
         .setCustomId(`ticketClose_everyone`)
         .setLabel('Destek kapatılsın.')
         .setEmoji("🔒")
         .setStyle(Discord.ButtonStyle.Secondary),
     );
     
      interaction.reply({ content: `:white_check_mark: **|** Senin için bir tane destek kanalı ${channel} oluşturldu.`, ephemeral: true })
    
      db.set(`ticketChannelUser_${interaction.guild.id}${channel.id}`, { user: interaction.user.id })
      db.set(`ticketUser_${interaction.user.id}${interaction.guild.id}`, { whOpen: interaction.user.id, date: Date.now() })
    
      channel.send({ content: `<@${interaction.user.id}> | ${ticketYetkili}`, embeds: [ticketUserEmbed] })
      return channel.send({ embeds: [sebepTicket], components: [row]  })
    
    }

if(interaction.customId === 'giriscikis'){
  const joinMsg = interaction.fields.getTextInputValue('girismesaj')
  .replaceAll("{guild.memberCount}", `${interaction.guild.memberCount}`)
  .replaceAll("{guild.name}", `${interaction.guild.name}`)
  .replaceAll("{owner.name}", `<@${interaction.guild.ownerId}>`)
  .replaceAll("{member}", `<@${client.user.id}>`)
  const leaveMsg = interaction.fields.getTextInputValue('cikismesaj')
  .replaceAll("{guild.memberCount}", `${interaction.guild.memberCount}`)
  .replaceAll("{guild.name}", `${interaction.guild.name}`)
  .replaceAll("{owner.name}", `<@${interaction.guild.ownerId}>`)
  .replaceAll("{member}", `<@${client.user.id}>`)

  const reLeaveMsg = interaction.fields.getTextInputValue('cikismesaj')
  const reJoinMsg = interaction.fields.getTextInputValue('girismesaj')

  const sayacmessage = db.fetch(`sayacmessage_${interaction.guild.id}`)
  const sayacmessageDate = db.fetch(`sayacmessageDate_${interaction.guild.id}`)
  
  if (sayacmessage && sayacmessageDate) {
      const date = new EmbedBuilder()
      .setDescription(`:x: | Bu sistem <t:${parseInt(sayacmessageDate.date / 1000)}:R> önce açılmış!`)
  
  return interaction.reply({ embeds: [date], ephemeral: true })
  }

  const row1 = new Discord.ActionRowBuilder()

  .addComponents(
      new Discord.ButtonBuilder()
          .setLabel("Giriş Çıkış Mesajını Ayarla!")
          .setStyle(Discord.ButtonStyle.Primary)
          .setCustomId("giriscikismesaj_"+interaction.user.id)
          .setDisabled(true)
  )

  .addComponents(
      new Discord.ButtonBuilder()
          .setLabel("Giriş Çıkış Mesajını Sıfırla!")
          .setStyle(Discord.ButtonStyle.Danger)
          .setCustomId("giriscikismesajsifirla_"+interaction.user.id)
  )
  const embed = new EmbedBuilder()
  .setColor(0x2F3136)
  .setAuthor({ name: `${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL()} ` })
  .setDescription(":white_check_mark: **|** Giriş çıkış mesajı aktif edildi!")
  .addFields([
    {
      name: "Karşılama mesajı:",
      value: "`"+joinMsg+"`",
      inline: false
    },
    {
      name: "Ayrılış mesajı:",
      value: "`"+leaveMsg+"`",
      inline: false
    },
  ]);
  db.set(`sayacmessageDate_${interaction.guild.id}`, { date: Date.now() })
  db.set(`sayacmessage_${interaction.guild.id}`, { joinMsg: reJoinMsg,  leaveMsg: reLeaveMsg })

  return interaction.update({ embeds: [embed], components: [row1] })


  }
	
  }

    const butonrol = db.fetch(`buton_rol${interaction.guild.id}`)
    if(butonrol)
    if (!interaction.isButton()) return;
    if(interaction.customId === "rol_everyone") {
        if(!interaction.member.roles.cache.has(butonrol)) { 
        interaction.member.roles.add(butonrol)
      interaction.reply({content: ":white_check_mark: | Rol Başarıyla Verildi!", ephemeral: true})
       } else {
         
        interaction.member.roles.remove(butonrol)
      interaction.reply({content: ":x: | Rol Başarıyla Alındı!", ephemeral: true})
    }
      }



        if (!interaction.isButton()) return;
        if (interaction.customId === "moderasyon_"+interaction.user.id) {
          const kayıt = new Discord.ActionRowBuilder()
          .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji("🛡")
              .setLabel("Moderasyon")
              .setDisabled(true)
              .setCustomId("moderasyon_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Kayıt")
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji('🧾')
              .setCustomId("kayıt_"+interaction.user.id),
        
            new Discord.ButtonBuilder()
            .setLabel("Kullanıcı")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('👨‍⚖️')
            .setCustomId("kullanıcı_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Sistemler")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('⚙')
            .setCustomId("sistemler_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
      .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Koruma")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("🔐")
            .setCustomId("korumasystem_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("Geri")
        .setEmoji('🔙')
        .setDisabled(true)
        .setCustomId("geri_"),
        new Discord.ButtonBuilder()
        .setLabel("Ana Sayfa")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji('🏠')
        .setCustomId("anasayfa_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("İleri")
        .setEmoji('⏩')
        .setCustomId("ileri_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger  )
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
          const embed = new EmbedBuilder()
          .setTitle("> Moderasyon Menüsü!")
          .addFields(
        { name: "**> /ban-list**", value: `>  **Banlı kullanıcıları gösterir!**`, inline: true },
        { name: "**> /ban**", value: `>  **Bir üyeyi yasaklarsın!**`, inline: true  },
        { name: "**> /unban**", value: `>  **Bir üyenin yasağını kaldırırsın!**`, inline: true  },
        { name: "**> /forceban**", value: `>  **ID ile kullanıcı banlarsın!**`, inline: true  },
        { name: "**> /giriş-çıkış | </giriş-çıkış-kapat**", value: `>  **Giriş çıkış kanalını ayarlarsın!**`, inline: true  },
		    { name: "**> /giriş-çıkış-mesaj**", value: `>  **Giriş çıkış mesajını ayarlarsınız!**`, inline: true  },
        { name: "**> /kanal-açıklama**", value: `>  **Kanal açıklamasını değiştirirsin!**`, inline: true  },
        { name: "**> /kick**", value: `>  **Bir üyeyi atarsın!**`, inline: true  },
        { name: "**> /küfür-engel**", value: `>  **Küfür engel sistemini açıp kapatırsın!**`, inline: true  },
        { name: "**> /medya-kanalı**", value: `>  **Medya kanalı sistemini açıp kapatırsın!**`, inline: true  },
        { name: "**> /oto-rol | /oto-rol-kapat**", value: `>  **OtoRol'ü ayarlarsın!!**`, inline: true  },
        { name: "**> /oto-tag | /oto-tag-kapat**", value: `>  **OtoTag'ı ayarlarsın!**`, inline: true  },
        { name: "**> /oylama**", value: `>  **Oylama başlatırsın!**`, inline: true  },
        { name: "**> /reklam-engel**", value: `>  **Reklam engellemeyi açarsın!**`, inline: true  },
        { name: "**> /rol-al**", value: `>  **Rol alırsın!**`, inline: true  },
        { name: "**> /timeout-sistemi**", value: `>  **Timeout sistemini ayarlarsın!**`, inline: true  },
        { name: "**> /timeout-sistemi-sıfırla**", value: `>  **Timeout sistemini sıfırlarsın!**`, inline: true  },
        { name: "**> /timeout**", value: `>  **Belirlenen kullanıcıya timeout atar.**`, inline: true  },
        { name: "**> /untimeout**", value: `>  **Belirlenen kullanıcının timeoutunu kaldırır.**`, inline: true  },
                  )
          .setColor("Random")
            interaction.update({embeds: [embed], components: [kayıt, row2]})
        }
      
        if (!interaction.isButton()) return;
        if (interaction.customId == "ileri_"+interaction.user.id) {
          const kayıt23 = new Discord.ActionRowBuilder()
          .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji("🛡")
              .setLabel("Moderasyon")
              .setDisabled(false)
              .setCustomId("moderasyon_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Kayıt")
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji('🧾')
              .setCustomId("kayıt_"+interaction.user.id),
        
            new Discord.ButtonBuilder()
            .setLabel("Kullanıcı")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('👨‍⚖️')
            .setCustomId("kullanıcı_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Sistemler")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('⚙')
            .setCustomId("sistemler_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
      .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Koruma")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("🔐")
            .setCustomId("korumasystem_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("Geri")
        .setEmoji('🔙')
        .setDisabled(false)
        .setCustomId("geri_"),
        new Discord.ButtonBuilder()
        .setLabel("Ana Sayfa")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji('🏠')
        .setCustomId("anasayfa_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("İleri")
        .setEmoji('⏩')
        .setDisabled(true)
        .setCustomId("ileri_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
      const embed = new Discord.EmbedBuilder()
      .setTitle("> Moderasyon 2 Menüsü!")
      .addFields(
        { name: "**>  /rol-oluştur**", value: `>  **Rol oluşturursun!**`, inline: true  },
        { name: "**>  /rol-ver**", value: `>  **Rol verirsin!**`, inline: true  },
        { name: "**>  /sil**", value: `>  **Mesaj silersin!**`, inline: true  },
        { name: "**>  /buton-rol**", value: `>  **Buton rol sistemini ayarlarsın!**`, inline: true  },
        { name: "**>  /custom-command**", value: `>  **Özel Komutları oluşturup silersiniz!**`, inline: true  },
        { name: "**>  /kanal-açıklama**", value: `>  **Kanal Açıklamasını Değiştirsin!**`, inline: true  },
        { name: "**>  /kilitle**", value: `>  **Kanalı mesaj gönderimine  açıp kapatırsın!**`, inline: true  },
        { name: "**>  /capslock-koruma**", value: `>  **CapsLock koruma sistemini ayarlarsın!**`, inline: true  },
        { name: "**>  /xp-ekle**", value: `>  **Belirtilen kullanıcıya belirtilen miktarda XP ekler!**`, inline: true  },
        { name: "**>  /xp-kaldır**", value: `>  **Belirtilen kullanıcıdan belirtilen miktarda XP alır!**`, inline: true  },
        { name: "**>  /level-ekle**", value: `>  **Belirtilen kullanıcıya belirtilen miktarda level ekler!**`, inline: true  },
        { name: "**>  /level-kaldır**", value: `>  **Belirtilen kullanıcıdan belirtilen miktarda level alır!**`, inline: true  },
        { name: "**>  /yavaş-mod**", value: `>  **Yavaş modu ayarlarsın!**`, inline: true  },
        { name: "**>  /sunucu-kur**", value: `>  **Otomatik sunucu kurar!**`, inline: true  },
        { name: "**>  /mod-log**", value: `>  **Moderasyon Logunu ayarlarsın!**`, inline: true  },
        { name: "**>  /mute**", value: `>  **Kullanıcıyı susturusun!**`, inline: true  },
        { name: "**>  /uyarı**", value: `>  **Kullanıcıyı uyarırsın!**`, inline: true  },
        { name: "**>  /yasaklı-kelime | /yasaklı-kelime-kapat**", value: `>  **Yasaklı Kelimeyi ayarlarsın!**`, inline: true  },
        { name: "**>  /yavaş-mod**", value: `>  **Yavaş mod!**`, inline: true  },    
        { name: "**>  /yaz**", value: `>  **Bir modal ekranı ile yazılan şey mesaj olarak yazılır!**`, inline: true  },    
      )
      .setColor("Random")
            interaction.update({embeds: [embed], components: [kayıt23, row2]})
        }
      
        if (!interaction.isButton()) return;
        if (interaction.customId == "geri_"+interaction.user.id) {
          const kayıt23 = new Discord.ActionRowBuilder()
          .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji("🛡")
              .setLabel("Moderasyon")
              .setDisabled(true)
              .setCustomId("moderasyon_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Kayıt")
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji('🧾')
              .setCustomId("kayıt_"+interaction.user.id),
        
            new Discord.ButtonBuilder()
            .setLabel("Kullanıcı")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('👨‍⚖️')
            .setCustomId("kullanıcı_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Sistemler")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('⚙')
            .setCustomId("sistemler_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
      .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Koruma")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("🔐")
            .setCustomId("korumasystem_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("Geri")
        .setEmoji('🔙')
        .setDisabled(true)
        .setCustomId("geri_"),
        new Discord.ButtonBuilder()
        .setLabel("Ana Sayfa")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji('🏠')
        .setCustomId("anasayfa_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("İleri")
        .setEmoji('⏩')
        .setCustomId("ileri_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
      const embed = new Discord.EmbedBuilder()
      .setTitle("> Moderasyon Menüsü!")
      .addFields(
        { name: "**> /ban-list**", value: `>  **Banlı kullanıcıları gösterir!**`, inline: true },
        { name: "**> /ban**", value: `>  **Bir üyeyi yasaklarsın!**`, inline: true  },
        { name: "**> /unban**", value: `>  **Bir üyenin yasağını kaldırırsın!**`, inline: true  },
        { name: "**> /forceban**", value: `>  **ID ile kullanıcı banlarsın!**`, inline: true  },
        { name: "**> /giriş-çıkış | </giriş-çıkış-kapat**", value: `>  **Giriş çıkış kanalını ayarlarsın!**`, inline: true  },
		    { name: "**> /giriş-çıkış-mesaj**", value: `>  **Giriş çıkış mesajını ayarlarsınız!**`, inline: true  },
        { name: "**> /kanal-açıklama**", value: `>  **Kanal açıklamasını değiştirirsin!**`, inline: true  },
        { name: "**> /kick**", value: `>  **Bir üyeyi atarsın!**`, inline: true  },
        { name: "**> /küfür-engel**", value: `>  **Küfür engel sistemini açıp kapatırsın!**`, inline: true  },
        { name: "**> /medya-kanalı**", value: `>  **Medya kanalı sistemini açıp kapatırsın!**`, inline: true  },
        { name: "**> /oto-rol | /oto-rol-kapat**", value: `>  **OtoRol'ü ayarlarsın!!**`, inline: true  },
        { name: "**> /oto-tag | /oto-tag-kapat**", value: `>  **OtoTag'ı ayarlarsın!**`, inline: true  },
        { name: "**> /oylama**", value: `>  **Oylama başlatırsın!**`, inline: true  },
        { name: "**> /reklam-engel**", value: `>  **Reklam engellemeyi açarsın!**`, inline: true  },
        { name: "**> /rol-al**", value: `>  **Rol alırsın!**`, inline: true  },
        { name: "**> /timeout-sistemi**", value: `>  **Timeout sistemini ayarlarsın!**`, inline: true  },
        { name: "**> /timeout-sistemi-sıfırla**", value: `>  **Timeout sistemini sıfırlarsın!**`, inline: true  },
        { name: "**> /timeout**", value: `>  **Belirlenen kullanıcıya timeout atar.**`, inline: true  },
        { name: "**> /untimeout**", value: `>  **Belirlenen kullanıcının timeoutunu kaldırır.**`, inline: true  },
              )
      .setColor("Random")
            interaction.update({embeds: [embed], components: [kayıt23, row2]})
        }
      
        if (!interaction.isButton()) return;
        if (interaction.customId == "kayıt_"+interaction.user.id) {
          const kayıt23 = new Discord.ActionRowBuilder()
          .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji("🛡")
              .setLabel("Moderasyon")
              .setDisabled(false)
              .setCustomId("moderasyon_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Kayıt")
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji('🧾')
              .setDisabled(true)
              .setCustomId("kayıt_"+interaction.user.id),
        
            new Discord.ButtonBuilder()
            .setLabel("Kullanıcı")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('👨‍⚖️')
            .setCustomId("kullanıcı_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Sistemler")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('⚙')
            .setCustomId("sistemler_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
      .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Koruma")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("🔐")
            .setCustomId("korumasystem_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("Geri")
        .setEmoji('🔙')
        .setDisabled(true)
        .setCustomId("geri_"),
        new Discord.ButtonBuilder()
        .setLabel("Ana Sayfa")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji('🏠')
        .setCustomId("anasayfa_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("İleri")
        .setEmoji('⏩')
        .setCustomId("ileri_"+interaction.user.id),
        new Discord.ButtonBuilder()
            .setEmoji("1039607063443161158")
            .setLabel(" ")
            .setStyle(Discord.ButtonStyle.Danger)
            .setCustomId("clearMessageButton_"+interaction.user.id)
          )
          const embed = new EmbedBuilder()
          .setTitle("> Kayıt Menüsü!")
          .addFields(
        { name: "**>  /kayıt-sistemi**", value: `>  **Kayıt sistemini ayarlarsın!**`, inline: true },
        { name: "**>  /kayıt-sistemi-kapat**", value: `>  **Kayıt sistemini devre dışı bırakırsın!**`, inline: true },
			  { name: "**>  /kayıt**", value: `>  **Kullanıcıyı kaydeder!**`, inline: true }
                  )
          .setColor("Random")
            interaction.update({embeds: [embed], components: [kayıt23, row2]})
        }
        if (!interaction.isButton()) return;
        if (interaction.customId == "kullanıcı_"+interaction.user.id) {
          const kayıt23 = new Discord.ActionRowBuilder()
          .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji("🛡")
              .setLabel("Moderasyon")
              .setDisabled(false)
              .setCustomId("moderasyon_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Kayıt")
              .setStyle(Discord.ButtonStyle.Primary)
              .setEmoji('🧾')
              .setCustomId("kayıt_"+interaction.user.id),
        
            new Discord.ButtonBuilder()
            .setLabel("Kullanıcı")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('👨‍⚖️')
            .setDisabled(true)
            .setCustomId("kullanıcı_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Sistemler")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('⚙')
            .setCustomId("sistemler_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
      .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Koruma")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("🔐")
            .setCustomId("korumasystem_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("Geri")
        .setEmoji('🔙')
        .setDisabled(true)
        .setCustomId("geri_"),
        new Discord.ButtonBuilder()
        .setLabel("Ana Sayfa")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji('🏠')
        .setCustomId("anasayfa_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("İleri")
        .setEmoji('⏩')
        .setCustomId("ileri_"+interaction.user.id),
        new Discord.ButtonBuilder()
            .setEmoji("1039607063443161158")
            .setLabel(" ")
            .setStyle(Discord.ButtonStyle.Danger)
            .setCustomId("clearMessageButton_"+interaction.user.id)
          )
          const embed = new EmbedBuilder()
          .setTitle("> Kullanıcı Menüsü!")
          .addFields(
            { name: "**>  /avatar**", value: `>  **Avatarına bakarsın!**`, inline: true },
            { name: "**>  /afk**", value: `>  **Afk olursun!**`, inline: true  },
            { name: "**>  /aşk-ölçer**", value: `>  **Aşkınız ölçer!**`, inline: true  },
            { name: "**>  /level**", value: `>  **Levelinizi veya birisinin levelini gösterir!**`, inline: true  },
            { name: "**>  /banner**", value: `>  **Bannerlara bakarsın!**`, inline: true  },
            { name: "**>  /özel-oda-aç**", value: `>  **Özel oda sistemini ayarlarsın!**`, inline: true },
            { name: "**>  /özel-oda-sil**", value: `>  **Özel odanı silersin!**`, inline: true },
            { name: "**>  /özel-oda-menü**", value: `>  **Özel oda menüsü!**`, inline: true },
            { name: "**>  /istatistik**", value: `>  **Bot istatistikleri!**`, inline: true  },
            { name: "**>  /kurucu-kim**", value: `>  **Sunucunun kurucusunu gösterir!**`, inline: true  },
            { name: "**>  /ping**", value: `>  **Botun pingini gösterir!**`, inline: true  },
            { name: "**>  /yardım**", value: `>  **Yardım menüsü!**`, inline: true  },
            { name: "**>  /davet**", value: `>  **Botun davet linki!**`, inline: true  },
            { name: "**>  /kullanıcı-bilgi**", value: `>  **Kullanıcı bilgisi!**`, inline: true  },
            { name: "**>  /random-anime**", value: `>  **Random Anime atar.**`, inline: true  },
            { name: "**>  /say**", value: `>  **Sunucuda kaç üye olduğunu gösterir.**`, inline: true  },
            { name: "**>  /sunucupp**", value: `>  **Sunucunun avatarına bakarsın!**`, inline: true  },
            { name: "**>  /sunucu-bilgi**", value: `>  **Sunucu bilgilerini gösterir.**`, inline: true  },
                  )
          .setColor("Random")
            interaction.update({embeds: [embed], components: [kayıt23, row2]})
        }
      
        if (!interaction.isButton()) return;
        if (interaction.customId == "sistemler_"+interaction.user.id) {
          const row = new Discord.ActionRowBuilder()
          .addComponents(
      new Discord.ButtonBuilder()
      .setLabel("Özel Oda")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('💒')
      .setCustomId("ozeloda_"+interaction.user.id),
      new Discord.ButtonBuilder()
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('💒')
      .setLabel("Ticket")
      .setCustomId("yardimticket_"+interaction.user.id),
      new Discord.ButtonBuilder()
      .setLabel("Level Sistemi")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('📈')
      .setCustomId("levelsistemi_"+interaction.user.id))
      const row2 = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel("Sistemler")
        .setEmoji('🧰')
		.setDisabled(true)
        .setCustomId("sistemler_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setLabel("Ana Sayfa")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji('🏠')
        .setCustomId("anasayfa_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
          const embed = new EmbedBuilder()
          .setAuthor({ name: " Sistemler Menüsü", iconURL: client.user.displayAvatarURL({ dynamic: true })})
          .setTitle("・Hangi komutlarım hakkında bilgi almak istiyorsan o butona bas!")
          .setDescription("\n\n**Linkler**\n>・**Botun davet linki: [Tıkla](" + config["bot-davet"] + ")**\n>・**Botun destek sunucusu: [Tıkla](" + config["desteksunucusu"] + ")**")
          .setColor('Blue')
          interaction.update({embeds: [embed], components: [row, row2]})
      
        }
      
              if (!interaction.isButton()) return;
        if (interaction.customId == "korumasystem_"+interaction.user.id) {
          const embed = new Discord.EmbedBuilder()
          .setTitle("> Koruma Menüsü!")
          .addFields(
            { name: "**>  /hesap-koruma**", value: `>  **Hesap koruma sistemini açarsın!**`, inline: true },
          )
          .setColor("Random")
                
          const row = new Discord.ActionRowBuilder()
          .addComponents(
      new Discord.ButtonBuilder()
      .setLabel("Moderasyon")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('🛡')
      .setCustomId("moderasyon_"+interaction.user.id),
      new Discord.ButtonBuilder()
      .setLabel("Kayıt")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('🧾')
      .setCustomId("kayıt_"+interaction.user.id),
      new Discord.ButtonBuilder()
      .setLabel("Kullanıcı")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('🤦‍♀️')
      .setCustomId("kullanıcı_"+interaction.user.id),
      new Discord.ButtonBuilder()
      .setLabel("Sistemler")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('⚙')
      .setCustomId("sistemler_"+interaction.user.id))
      const row2 = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.ButtonBuilder()
        .setLabel("Koruma")
        .setStyle(Discord.ButtonStyle.Primary)
        .setEmoji("🔐")
        .setCustomId("korumasystem_"+interaction.user.id)
        .setDisabled(true),
        new Discord.ButtonBuilder()
        .setLabel("Ana Sayfa")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji('🏠')
        .setCustomId("anasayfa_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
      interaction.update({embeds: [embed], components: [row, row2]})
        }
      
        if (!interaction.isButton()) return;
        if (interaction.customId == "botlist_"+interaction.user.id) {
          const row = new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Özel Oda")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setCustomId("ozeloda_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setLabel("Ticket")
            .setCustomId("yardimticket_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Level Sistemi")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('📈')
            .setCustomId("levelsistemi_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
            .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setLabel("Sistemler")
              .setEmoji('🧰')
          .setDisabled(true)
              .setCustomId("sistemler_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Ana Sayfa")
              .setStyle(Discord.ButtonStyle.Success)
              .setEmoji('🏠')
              .setCustomId("anasayfa_"+interaction.user.id),
              new Discord.ButtonBuilder()
        
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
          const embed = new EmbedBuilder()
          .setTitle("> Botlist Menüsü!")
          .addFields(
            { name: "**>  /botlist-ayarla**", value: `>  **Botlist sistemini ayarlarsın!**`, inline: true }
          )
          .setColor("Random")
            interaction.update({embeds: [embed], components: [row, row2]})
        }
        if (!interaction.isButton()) return;
        if (interaction.customId == "ozeloda_"+interaction.user.id) {
          const row = new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Özel Oda")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setCustomId("ozeloda_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setLabel("Ticket")
            .setCustomId("yardimticket_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Level Sistemi")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('📈')
            .setCustomId("levelsistemi_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
            .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setLabel("Sistemler")
              .setEmoji('🧰')
          .setDisabled(true)
              .setCustomId("sistemler_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Ana Sayfa")
              .setStyle(Discord.ButtonStyle.Success)
              .setEmoji('🏠')
              .setCustomId("anasayfa_"+interaction.user.id),
              new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
      const embed = new Discord.EmbedBuilder()
      .setTitle("> Özel Oda Menüsü!")
      .addFields(
        { name: "**>  /özel-oda-aç**", value: `>  **Özel Oda Sistemini ayarlarsın!**`, inline: true },
        { name: "**>  /özel-oda-sil**", value: `>  **Özel Odanı silersin!**`, inline: true },
        { name: "**>  /özel-oda-menü**", value: `>  **Özel Odana kullanıcı eklersin!**`, inline: true }
      )
      .setColor("Random")
            interaction.update({embeds: [embed], components: [row, row2]})
        }
      
      
        if (!interaction.isButton()) return;
        if (interaction.customId == "anasayfa_"+interaction.user.id) {
          const embed = new EmbedBuilder()
          .setAuthor({ name: "Genel Bot Yardım Menüsü", iconURL: client.user.displayAvatarURL({ dynamic: true })})
          .setTitle("・Hangi komutlarım hakkında bilgi almak istiyorsan o butona bas!")
          .setDescription("\n\n**Linkler**\n> ・**Botun davet linki: [Tıkla](" + config["bot-davet"] + ")**\n> ・**Botun destek sunucusu: [Tıkla](" + config["desteksunucusu"] + ")**")
          .setColor('Blue')
          const row = new Discord.ActionRowBuilder()
          .addComponents(
      new Discord.ButtonBuilder()
      .setLabel("Moderasyon")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('🛡')
      .setCustomId("moderasyon_"+interaction.user.id),
      new Discord.ButtonBuilder()
      .setLabel("Kayıt")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('🧾')
      .setCustomId("kayıt_"+interaction.user.id),
      new Discord.ButtonBuilder()
      .setLabel("Kullanıcı")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('🤦‍♀️')
      .setCustomId("kullanıcı_"+interaction.user.id),
      new Discord.ButtonBuilder()
      .setLabel("Sistemler")
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('⚙')
      .setCustomId("sistemler_"+interaction.user.id))
      const row2 = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.ButtonBuilder()
        .setLabel("Koruma")
        .setStyle(Discord.ButtonStyle.Primary)
        .setEmoji("🔐")
        .setCustomId("korumasystem_"+interaction.user.id)
        .setDisabled(false),
        new Discord.ButtonBuilder()
        .setLabel("Ana Sayfa")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji('🏠')
        .setCustomId("anasayfa_"+interaction.user.id),
        new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158") 
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
            interaction.update({embeds: [embed], components: [row, row2]})
        }
      
        if (!interaction.isButton()) return;
        if (interaction.customId == "yardimticket_"+interaction.user.id) {
          const row = new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Özel Oda")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setCustomId("ozeloda_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setLabel("Ticket")
            .setCustomId("yardimticket_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Level Sistemi")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('📈')
            .setCustomId("levelsistemi_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
            .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setLabel("Sistemler")
              .setEmoji('🧰')
          .setDisabled(true)
              .setCustomId("sistemler_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Ana Sayfa")
              .setStyle(Discord.ButtonStyle.Success)
              .setEmoji('🏠')
              .setCustomId("anasayfa_"+interaction.user.id),
              new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
          const embed = new EmbedBuilder()
          .setTitle("> Ticket Menüsü!")
          .addFields(
            { name: "**>  /destek-sistemi**", value: `>  **Destek sistemini ayarlarsın!**`, inline: true },
            { name: "**>  /destek-sistemi-sıfırla**", value: `>  **Destek sistemini sıfırlarsın!.**`, inline: true  }
                  )
          .setColor("Random")
            interaction.update({embeds: [embed], components: [row, row2]})
        }
      
        if (!interaction.isButton()) return;
        if (interaction.customId == "levelsistemi_"+interaction.user.id) {
          const row = new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Özel Oda")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setCustomId("ozeloda_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setLabel("Ticket")
            .setCustomId("yardimticket_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Level Sistemi")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('📈')
            .setCustomId("levelsistemi_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
            .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setLabel("Sistemler")
              .setEmoji('🧰')
          .setDisabled(true)
              .setCustomId("sistemler_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Ana Sayfa")
              .setStyle(Discord.ButtonStyle.Success)
              .setEmoji('🏠')
              .setCustomId("anasayfa_"+interaction.user.id),
              new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
          const embed = new EmbedBuilder()
          .setTitle("> Level Menüsü!")
          .addFields(
            { name: "**>  /level-sistemi**", value: `>  **Level sistemini açarsın!**`, inline: true },
            { name: "**>  /level**", value: `>  **Levelini görüntülersin!**`, inline: true },
            { name: "**>  /xp-ekle**", value: `>  **Belirtilen kullanıcıya belirtilen miktarda XP ekler!**`, inline: true  },
            { name: "**>  /xp-kaldır**", value: `>  **Belirtilen kullanıcıdan belirtilen miktarda XP alır!**`, inline: true  },
            { name: "**>  /level-ekle**", value: `>  **Belirtilen kullanıcıya belirtilen miktarda level ekler!**`, inline: true  },
            { name: "**>  /level-kaldır**", value: `>  **Belirtilen kullanıcıdan belirtilen miktarda level alır!**`, inline: true  },
            { name: "**>  /level-sıralaması**", value: `>  **Level sıralamasını görüntülersin!**`, inline: true }
          )
          .setColor("Random")
            interaction.update({embeds: [embed], components: [row, row2]})
        }
		
		if (!interaction.isButton()) return;
        if (interaction.customId == "captchasistemi_"+interaction.user.id) {
          const row = new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Özel Oda")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setCustomId("ozeloda_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('💒')
            .setLabel("Ticket")
            .setCustomId("yardimticket_"+interaction.user.id),
            new Discord.ButtonBuilder()
            .setLabel("Level Sistemi")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('📈')
            .setCustomId("levelsistemi_"+interaction.user.id))
            const row2 = new Discord.ActionRowBuilder()
            .addComponents(
              new Discord.ButtonBuilder()
              .setStyle(Discord.ButtonStyle.Primary)
              .setLabel("Sistemler")
              .setEmoji('🧰')
          .setDisabled(true)
              .setCustomId("sistemler_"+interaction.user.id),
              new Discord.ButtonBuilder()
              .setLabel("Ana Sayfa")
              .setStyle(Discord.ButtonStyle.Success)
              .setEmoji('🏠')
              .setCustomId("anasayfa_"+interaction.user.id),
              new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
      )
        }


        if (!interaction.isButton()) return;
        
        let user = edb.get(`oylamaUSER_${interaction.message.id}_${interaction.user.id}`) 
        
        if(interaction.customId == "evetoylama_everyone") {
        if(!user) {
        edb.add(`oylamaEVET_${interaction.message.id}`, 1)
        
        let dataEvet = edb.get(`oylamaEVET_${interaction.message.id}`) || "0"
        let dataHayır = edb.get(`oylamaHAYIR_${interaction.message.id}`) || "0"
        
      
        const row = new Discord.ActionRowBuilder()
        .addComponents(
        new Discord.ButtonBuilder()
        .setStyle("Success")
        .setLabel(`(${dataEvet}) Evet`)
        .setCustomId("evetoylama_everyone"),
        new Discord.ButtonBuilder()
        .setStyle("Danger")
        .setLabel(`(${dataHayır}) Hayır`)
        .setCustomId("hayıroylama_everyone"))
        
        interaction.message.edit({ components: [row] })
        
        edb.set(`oylamaUSER_${interaction.message.id}_${interaction.user.id}`, interaction.user.id) 
        }
        
        interaction.deferUpdate();
        }
        
        if(interaction.customId == "hayıroylama_everyone") {
        if(!user) {
        edb.add(`oylamaHAYIR_${interaction.message.id}`, 1)
        
        let dataEvet = edb.get(`oylamaEVET_${interaction.message.id}`) || "0"
        let dataHayır = edb.get(`oylamaHAYIR_${interaction.message.id}`) || "0"
        
      
        const row = new Discord.ActionRowBuilder()
        .addComponents(
        new Discord.ButtonBuilder()
        .setStyle("Success")
        .setLabel(`(${dataEvet}) Evet`)
        .setCustomId("evetoylama_everyone"),
        new Discord.ButtonBuilder()
        .setStyle("Danger")
        .setLabel(`(${dataHayır}) Hayır`)
        .setCustomId("hayıroylama_everyone"))
      
        interaction.message.edit({ components: [row] })
        
        edb.set(`oylamaUSER_${interaction.message.id}_${interaction.user.id}`, interaction.user.id) 
        }
        
        interaction.deferUpdate();
        }

          const kullanıcı = db.fetch(`muteKullanici_${interaction.user.id}`)
          if (!interaction.isButton()) return;
          if (interaction.customId === "muteonay_"+interaction.user.id) {
        
            const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('muteonay_'+interaction.user.id)
                    .setLabel('Onayla')
                    .setDisabled(true)
                    .setStyle('Success'),
                new Discord.ButtonBuilder()
                    .setCustomId('mutered_'+interaction.user.id)
                    .setLabel('İptal')
                    .setDisabled(true)
                    .setStyle('Danger'),
        
            );
            const dmb = deleteMessageButton(interaction, {
              label: "Mesajı sil.",
              style: Discord.ButtonStyle.Danger,
        });
            let muterol = db.fetch(`rol_${interaction.guild.id}`)
            let ucanEssek = interaction.guild.members.cache.get(kullanıcı)
            if (!ucanEssek) return interaction.reply(":x: | Üyeyi bulamadım.")
            ucanEssek.roles.add(muterol)
            const embed = new EmbedBuilder()
            .setDescription(`:white_check_mark: | Başarılı bir şekilde <@!${kullanıcı}> isimli kişiye mute atıldı.
        `)
            interaction.update({embeds: [embed], components: [row, dmb]})
          }
        
          if (interaction.customId === "mutered_"+interaction.user.id) {
            const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('muteonay_'+interaction.user.id)
                    .setLabel('Onayla')
                    .setDisabled(true)
                    .setStyle('Success'),
                new Discord.ButtonBuilder()
                    .setCustomId('mutered_'+interaction.user.id)
                    .setLabel('İptal')
                    .setDisabled(true)
                    .setStyle('Danger'),
        
            );
            const dmb = deleteMessageButton(interaction, {
              label: "Mesajı sil.",
              style: Discord.ButtonStyle.Danger,
        });
            const embed = new EmbedBuilder()
            .setDescription(`:white_check_mark: | Başarılı bir şekilde mute iptal edildi.
        `)
            interaction.update({embeds: [embed], components: [row, dmb]})
          }

            if (!interaction.isButton()) return;
            if (interaction.customId === "sunucukuronay_"+interaction.user.id) {
        
              interaction.guild.channels.cache.filter(mesajsil => {
                mesajsil.delete()
            })

              interaction.guild.channels.create({name: "admin-chat", type: ChannelType.GuildText}).then(channel => {
                channel.permissionOverwrites.create(channel.guild.roles.everyone, { ViewChannel: false });
                        })

                        interaction.guild.channels.create({name: "▬▬ ÖNEMLİ ▬▬", type: ChannelType.GuildCategory}).then(katagori1 => {
                          katagori1.permissionOverwrites.create(katagori1.guild.roles.everyone, { SendMessages: false });
                            interaction.guild.channels.create({name: "📜・Kurallar", type: ChannelType.GuildText}).then(kurallar => {
                                const embed = new EmbedBuilder()
            .setTitle(':blue_book:  Sunucu Kuralları  :blue_book:')
            .setDescription(`
            **__${interaction.guild.name} Sunucu Kuralları__**                                    
            \`1)\` :blue_book: **・ Yetkililere Etiket Atmak Yasak! ・\`Mute\`・**
            \`2)\` :blue_book: **・ Küfür, Argo Kullanımı Yasak! ・\`Mute\`・**
            \`3)\` :blue_book: **・ Siyaset, Irkçılık ve Dini Konuları Konuşmak Yasak!  ・\`Ban\`・**
            \`4)\` :blue_book: **・ Reklam Yapmak Yasak! ・\`Ban\`・**
            \`5)\` :blue_book: **・ Flood Yapmak Yasak! ・\`Mute\`・**
            \`6)\` :blue_book: **・ Caps Lock ile Yazmak Yasak! ・\`Mute\`・**
            \`7)\` :blue_book: **・ Yetkilileri Dinlememek Yasak! ・\`Mute\`・**
            \`8)\` :blue_book: **・**\`Kurallara Herkes Uymak Zorundadır. Kuralları Okumayanlar, Bilmeyenler Yetkililerimizin Gözünde Okumuş Olarak Kabul Edilecektir.\`
            `)
            kurallar.send({embeds: [embed]})
            kurallar.setParent(katagori1.id)
            })
            interaction.guild.channels.create({name: "📢・Duyurular", type: ChannelType.GuildText}).then(duyuru => {
            duyuru.setParent(katagori1.id)
            })
            interaction.guild.channels.create({name: "🔰・Hoşgeldin", type: ChannelType.GuildText}).then(hg => {
                db.set(`hgbb_${interaction.guild.id}`, hg.id)
                hg.send("Buraya bakmana gerek yok! Senin için giriş çıkış sistemini ayarladım bile!")
                hg.setParent(katagori1.id)
                })
                interaction.guild.channels.create({name: "🔢・Oto Rol", type: ChannelType.GuildText}).then(rol => {
                    rol.send("**/oto-rol** Yazarak otomatik rolü ayarlayabilirsin.")
                    rol.setParent(katagori1.id)
                    })
            interaction.guild.channels.create({name: "📊・Oylama", type: ChannelType.GuildText}).then(oylama => {
                oylama.setParent(katagori1.id)
                })
                interaction.guild.channels.create({name: "🎉・Çekilişler", type: ChannelType.GuildText}).then(giveaway => {
                    giveaway.setParent(katagori1.id)
                    })
            })
            interaction.guild.channels.create({name: "▬▬ SOHBET KANALLARI ▬▬", type: ChannelType.GuildCategory}).then(katagori2 => {
            interaction.guild.channels.create({name: "💬・sohbet", type: ChannelType.GuildText}).then(sohbet => {
                const embed2 = new EmbedBuilder()
                .setTitle(`${config["bot-adi"]} Bot - İyi günler diler.`)
                .setDescription(`Unutma ${interaction.user}, senin için her şeyini ben ayarladım artık başka bir şey yapmana gerek yok.\n\nArtık sunucunu güvenli bir şekilde açabilirsin.`)
                .setColor("Blue")
                sohbet.send({embeds: [embed2]})
                sohbet.send("Hadi ilk mesajınız da benden olsun!")
            sohbet.setParent(katagori2)
            })
            interaction.guild.channels.create({name: "🎀・galeri", type: ChannelType.GuildText}).then(galeri => {
                db.set(`görselengel.${interaction.guild.id}`, galeri.id)
                galeri.send("Buraya bakmana gerek yok! Senin için medya kanalı sistemini ayarladım bile!")
            galeri.setParent(katagori2)
            })
            interaction.guild.channels.create({name: "🚧・bot-komut", type: ChannelType.GuildText}).then(botkomut => {
            botkomut.setParent(katagori2)
            })
            interaction.guild.channels.create({name: "⭐・sunucu-destek", type: ChannelType.GuildText}).then(destek => {
            destek.setParent(katagori2)
            })
            })

            interaction.guild.channels.create({name: "▬▬ SESLİ SOHBET KANALLARI ▬▬", type: ChannelType.GuildCategory}).then(katagori3 => {
                interaction.guild.channels.create({name: "🔊・Sohbet", type: ChannelType.GuildVoice}).then(sohbet1 => {
                sohbet1.setParent(katagori3)
                })
                interaction.guild.channels.create({name: "🔊・Anime", type: ChannelType.GuildVoice}).then(sohbet2 => {
                    sohbet2.setParent(katagori3)
                    })
                    interaction.guild.channels.create({name: "🔊・Yayın", type: ChannelType.GuildVoice}).then(sohbet3 => {
                        sohbet3.setParent(katagori3)
                        })
                        interaction.guild.channels.create({name: "🔊・Oyun", type: ChannelType.GuildVoice}).then(sohbet3 => {
                          sohbet3.setParent(katagori3)
                          })
                          interaction.guild.channels.create({name: "🔊・Cafe", type: ChannelType.GuildVoice}).then(sohbet3 => {
                            sohbet3.setParent(katagori3)
                            })
                            interaction.guild.channels.create({name: "🔊・7/24", type: ChannelType.GuildVoice}).then(sohbet3 => {
                              sohbet3.setParent(katagori3)
                              })
                              interaction.guild.channels.create({name: "🔓・Toplantı 1", type: ChannelType.GuildVoice}).then(toplantı => {
                                  toplantı.setParent(katagori3)
                                  })
                                  interaction.guild.channels.create({name: "🔓・Toplantı 2", type: ChannelType.GuildVoice}).then(toplantı1 => {
                                      toplantı1.setParent(katagori3)
                                      })
            })
          
            const existingRoles = interaction.guild.roles.cache.filter(role => role.name !== '@everyone');

              existingRoles.forEach(role => {
                  role.delete()
                      .then(deletedRole => console.log(`Silinen rol: ${deletedRole.name}`))
                      .catch(error => console.log(`Rol silinirken bir hata oluştu: ${error}`));
              });
            
            interaction.guild.roles.create({ name: 'Kurucu', color: "#0d0101", permissions: [PermissionsBitField.Flags.Administrator]}).then(rol => {
                client.guilds.cache.get(interaction.guild.id).members.cache.get(interaction.guild.ownerId).roles.add(rol)
                })
            interaction.guild.roles.create({ name: 'Admin', color: "#d41313", permissions: [PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.SendMessages]});
            interaction.guild.roles.create({ name: 'Mod', color: "#1367d4", permissions: [PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.SendMessages]});
            interaction.guild.roles.create({ name: 'Destek Ekibi', color: "#d4c713", permissions: [PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.SendMessages]});
            interaction.guild.roles.create({ name: 'Kayıt Yetkilisi', color: "#c28274", permissions: [PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.SendMessages]});
            interaction.guild.roles.create({ name: 'Özel Üye', color: "#d413c4", permissions: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]});
            interaction.guild.roles.create({ name: 'Üye', color: "#ffffff", permissions: [PermissionsBitField.Flags.SendMessages]});
            interaction.guild.roles.create({ name: 'Kız', color: "#ffc0cb", permissions: [PermissionsBitField.Flags.SendMessages]});
            interaction.guild.roles.create({ name: 'Erkek', color: "#00008b", permissions: [PermissionsBitField.Flags.SendMessages]});
            interaction.guild.roles.create({ name: 'Mute', color: "#878383", permissions: [PermissionsBitField.Flags.MuteMembers]});
            }
        
            if (interaction.customId === "sunucukurred_"+interaction.user.id) {
              interaction.update({content: `:white_check_mark: | Başarılı bir şekilde sunucu kurma iptal edildi!`, embeds: [], components: []})
            } 
            
            if (interaction.customId === "yenile_"+interaction.user.id) {
              const Uptime = moment
              .duration(client.uptime)
              .format(" D [gün], H [saat], m [dakika], s [saniye]");
                const row = new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.ButtonBuilder()
                .setEmoji("1039607063443161158")
                .setLabel(" ")
                .setStyle(Discord.ButtonStyle.Danger)
                .setCustomId("clearMessageButton_"+interaction.user.id)
          )
          let zaman = db.get(`botAcilis_`)
          let date = `<t:${Math.floor(zaman / 1000)}:R>`
          let servers = client.guilds.cache.size

         
          
            let members = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()
            const botsahip = `<@${config["sahip"]}>`;
            const website = `${config["website"]}`;


              const embed = new EmbedBuilder()
    .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: '</> Bot Sahibi', value: `${botsahip}`, inline: true },
      { name: '🌐 Websitesi', value: `${website}`, inline: true },
      { name: "👥 Kullanıcılar", value: `${members}`, inline: true },
      { name: "🧩 Sunucular", value: `${servers}`, inline: true },
      { name: "📼 Bellek Kullanımı", value: `${(process.memoryUsage().heapUsed / 1024 / 512).toFixed(2)}MB`, inline: true },
      { name: "⏳ Açılma Süresi", value: `${date}`, inline: true },
      { name: "⏺️ Ping", value: `${client.ws.ping}`, inline: true },
    )
    interaction.reply({embeds: [embed], components: [row] ,ephemeral: true})
              }

              if (interaction.customId === "clearMessageButton_" + interaction.user.id) {
                await interaction.deferUpdate();
                await interaction.message.delete().catch(console.error);
              }
		
        if(interaction.customId === `ticketnasilacilir_everyone`) {
          const embed = new Discord.EmbedBuilder()
          .setAuthor({ name: "Rimuru Destek Menüsü", iconURL: client.user.displayAvatarURL({ dynamic: true })})
          .setTitle("・Destek talebi nasıl oluşturabilirsin.")
          .setDescription("**Destek Talebi Oluştur** butonuna tıkladıktan sonra karşına bir form gelecektir. O formu doldurduktan sonra destek talebin başarılı bir şekilde oluşturulacaktır.")
          .setImage(`https://cdn.discordapp.com/attachments/1235347548873425027/1235523499582296084/image.png?ex=6634ae6d&is=66335ced&hm=c9b678963889765b82be76868f9f40e5dc6a85425e7badb843d91caa85ac07d3&`)
          .setColor('Blue')
            interaction.reply({ embeds: [embed], ephemeral: true })
          }
  
                  if(interaction.customId === `ticketolustur_everyone`) {
            
            const find = db.fetch(`ticketUser_${interaction.user.id}${interaction.guild.id}`)
            if(find) {
              const ticketVar = new Discord.EmbedBuilder()
              .setDescription(`:x: Zaten bir talebin bulunmakta.`)
              return interaction.reply({ embeds: [ticketVar], ephemeral: true })
            }
  
            const ticketmodal = new Discord.ModalBuilder()
            .setCustomId('ticketforms')
            .setTitle('Destek Oluşturma Formu');
      
            const ticketInput = new Discord.TextInputBuilder()
            .setCustomId('ticketInput')
            .setLabel("Destek Oluşturma Sebebiniz Nedir?")
            .setRequired(true)  
            .setStyle(Discord.TextInputStyle.Short);
      
        
            const afirstActionRow = new Discord.ActionRowBuilder().addComponents(ticketInput);
      
            ticketmodal.addComponents(afirstActionRow);
      
            await interaction.showModal(ticketmodal);
            
          }
          
          if(interaction.customId === `ticketClose_everyone`) {
            interaction.channel.permissionOverwrites.set([
              {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
              },        
            ]);
            const row = new Discord.ActionRowBuilder()
            .addComponents(
              new Discord.ButtonBuilder()
                .setCustomId(`ticketDelete_everyone`)
                .setLabel('Destek silinsin.')
                .setEmoji("🗑️")
                .setStyle(Discord.ButtonStyle.Secondary),
            );
            const ticketClose = new Discord.EmbedBuilder()
            .setDescription(`:white_check_mark: | Bu destek talebi kapatılmıştır.`)
            .setColor('Green')
            interaction.reply({ embeds: [ticketClose], components: [row] })
          }
  
          if(interaction.customId === `ticketDelete_everyone`) {
  
           const chnl = db.fetch(`ticketChannelUser_${interaction.guild.id}${interaction.channel.id}`);
           const x = chnl.user;
  
           const adam = await interaction.guild.members.cache.find(user => user.id === x);
           const usr = db.fetch(`ticketUser_${x}${interaction.guild.id}`);
  
            const ticketLog = db.fetch(`ticketKanal_${interaction.guild.id}`)
            const ticketcloseembed = new EmbedBuilder()
            .setTitle(`${adam.user.tag} adlı kişinin destek verileri.`)
            .addFields(
              { name: "Destek Açan: 👤", value: `<@${usr.whOpen}>`, inline: true },
              { name: "Desteğin Kapatılış Tarihi:", value: `<t:${parseInt(Date.now() / 1000)}:R>`, inline: true  },
               { name: '\u200B', value: '\u200B' },
              { name: "Desteği Kapatan:", value: `<@${interaction.user.id}>`, inline: true },
              { name: "Desteğin Açılış Tarihi:", value: `<t:${parseInt(usr.date / 1000)}:R>`, inline: true  },
                    )
            .setColor('Green')
            .setThumbnail(`${adam.user.displayAvatarURL()}`)
            client.channels.cache.get(ticketLog).send({embeds: [ticketcloseembed]})
  
            db.delete(`ticketChannelUser_${interaction.guild.id}${interaction.channel.id}`);
            db.delete(`ticketUser_${x}${interaction.guild.id}`);
  
            return interaction.channel.delete();
          }

		
		        if(interaction.customId === `giriscikismesaj_`+interaction.user.id) {
          const giriscikismodal = new Discord.ModalBuilder()
      .setCustomId('giriscikis')
      .setTitle('Mesaj Ayarlama Formu');

      const girismesaj = new Discord.TextInputBuilder()
      .setCustomId('girismesaj')
      .setLabel("Giriş mesajınızı yazınız!")
      .setMaxLength(100)
      .setMinLength(1)
      .setRequired(true)  
      .setStyle(Discord.TextInputStyle.Short);

      const cikismesaj = new Discord.TextInputBuilder()
      .setCustomId('cikismesaj')
      .setLabel("Çıkış mesajınızı yazınız!")
      .setMaxLength(100)
      .setMinLength(1)
      .setRequired(true)  
      .setStyle(Discord.TextInputStyle.Short);

  
      const firstActionRow = new Discord.ActionRowBuilder().addComponents(girismesaj);
      const twoActionRow = new Discord.ActionRowBuilder().addComponents(cikismesaj);

      giriscikismodal.addComponents(firstActionRow, twoActionRow);

      await interaction.showModal(giriscikismodal);
        }

        if(interaction.customId === `giriscikismesajsifirla_`+interaction.user.id) {
          const sayacmessage = db.fetch(`sayacmessage_${interaction.guild.id}`)
          
          if (!sayacmessage) {
              const date = new EmbedBuilder()
              .setDescription(`:x: | Bu sistem zaten kapalı!`)
          
          return interaction.reply({ embeds: [date], ephemeral: true })
          }
          const row1 = new Discord.ActionRowBuilder()

          .addComponents(
              new Discord.ButtonBuilder()
                  .setLabel("Giriş Çıkış Mesajını Ayarla!")
                  .setStyle(Discord.ButtonStyle.Primary)
                  .setCustomId("giriscikismesaj_"+interaction.user.id)
          )
        
          .addComponents(
              new Discord.ButtonBuilder()
                  .setLabel("Giriş Çıkış Mesajını Sıfırla!")
                  .setDisabled(true)
                  .setStyle(Discord.ButtonStyle.Danger)
                  .setCustomId("giriscikismesajsifirla_"+interaction.user.id)
          )
          const embed = new EmbedBuilder()
          .setColor(0x2F3136)
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL()} ` })
          .setDescription(":white_check_mark: **|** Giriş çıkış mesajı sıfırlandı!")
          db.delete(`sayacmessageDate_${interaction.guild.id}`)
          db.delete(`sayacmessage_${interaction.guild.id}`)

          return interaction.update({ embeds: [embed], components: [row1] })
      
        }

          }

  };

//
