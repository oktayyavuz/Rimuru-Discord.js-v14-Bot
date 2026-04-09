const { PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, UserSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const db = require("croxydb");

function cleanupPrivateRoom(userId, channelId) {
  db.delete(`privateRoom_${userId}`);
  db.delete(`privateRoom_${channelId}`);
}

module.exports = {
  name: "interactionCreate",
  run: async (client, interaction) => {
    try {
      if (interaction.isButton()) {
        if (interaction.customId === "private_room_create") {
          await createPrivateRoom(interaction, client);
        } else if (interaction.customId.startsWith("room_")) {
          await handleRoomControl(interaction, client);
        } else if (interaction.customId.startsWith("user_")) {
          await handleUserManage(interaction);
        } else if (interaction.customId === "room_manage") {
          await showManageUsersMenu(interaction);
        } else if (interaction.customId === 'private_room_user_search') {
          await handleUserSearchButton(interaction);
        }
      } else if (interaction.isUserSelectMenu()) {
        if (interaction.customId === 'private_room_server_user_select') {
          await handleUserSelect(interaction);
        }
      } else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'room_limit_modal') {
          await handleRoomLimitChange(interaction);
        } else if (interaction.customId === 'room_name_modal') {
          await handleRoomNameChange(interaction);
        } else if (interaction.customId === 'user_search_modal') {
          await handleUserSearchModal(interaction);
        }
      }
    } catch (error) {
      console.error("Özel Oda etkileşim hatası:", error);
    }
  }
};

async function createPrivateRoom(interaction, client) {
  const { user, guild } = interaction;
  const existingRoomId = db.get(`privateRoom_${user.id}`);
  
  if (existingRoomId) {
    const existingRoom = guild.channels.cache.get(existingRoomId);
    if (!existingRoom) {
      db.delete(`privateRoom_${user.id}`);
      db.delete(`privateRoom_${existingRoomId}`);
    } else {
      return interaction.reply({ content: "Zaten bir özel odanız var!", ephemeral: true });
    }
  }

  const categoryId = db.get(`privateRoomCategory_${guild.id}`);
  const category = guild.channels.cache.get(categoryId);
  if (!category) return interaction.reply({ content: "Özel oda kategorisi bulunamadı!", ephemeral: true });

  const permissionOverwrites = category.permissionOverwrites.cache.map(overwrite => ({
    id: overwrite.id,
    allow: overwrite.allow,
    deny: overwrite.deny,
    type: overwrite.type
  }));

  permissionOverwrites.push({
    id: user.id,
    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream],
  });

  const channel = await guild.channels.create({
    name: `🔒 ${user.username}'nin Odası`,
    type: ChannelType.GuildVoice,
    parent: category,
    permissionOverwrites: permissionOverwrites,
  });

  db.set(`privateRoom_${user.id}`, channel.id);
  db.set(`privateRoom_${channel.id}`, user.id);

  setTimeout(async () => {
    const currentChannel = interaction.guild.channels.cache.get(channel.id);
    if (currentChannel && currentChannel.members.size === 0) {
      try { await currentChannel.delete(); } catch (error) {}
      cleanupPrivateRoom(user.id, channel.id);
    }
  }, 10000);

  await interaction.reply({ content: `Özel odanız oluşturuldu! <#${channel.id}>`, ephemeral: true });
  await sendControlPanel(channel, user, client);
}

async function sendControlPanel(channel, user, client) {
  const controlPanel = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("🎛️ Kontrol Paneli")
    .setDescription("Odanızı yönetmek için aşağıdaki butonları kullanın.")
    .setFooter({ text: "Özel odanızı dilediğiniz gibi özelleştirin!" });

  const buttons1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("room_lock").setStyle(ButtonStyle.Success).setEmoji("🔒"),
    new ButtonBuilder().setCustomId("room_eyes").setStyle(ButtonStyle.Success).setEmoji("👁️"),
    new ButtonBuilder().setCustomId("room_mute").setStyle(ButtonStyle.Success).setEmoji("🎙️"),
    new ButtonBuilder().setCustomId("room_video").setStyle(ButtonStyle.Success).setEmoji("📷"),
    new ButtonBuilder().setCustomId("room_events").setStyle(ButtonStyle.Success).setEmoji("🚀")
  );

  const buttons2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("room_name").setStyle(ButtonStyle.Secondary).setEmoji("✒"),
    new ButtonBuilder().setCustomId("room_limit").setStyle(ButtonStyle.Secondary).setEmoji("🔢"),
    new ButtonBuilder().setCustomId("room_manage").setStyle(ButtonStyle.Primary).setEmoji("👥"),
    new ButtonBuilder().setCustomId("room_time").setStyle(ButtonStyle.Secondary).setEmoji("⏰")
  );

  await channel.send({ content: `<@${user.id}>, özel odanızın kontrol paneli:`, embeds: [controlPanel], components: [buttons1, buttons2] });
}

async function handleRoomControl(interaction, client) {
  const roomOwnerId = db.get(`privateRoom_${interaction.channel.id}`);
  const isAdmin = db.get(`admin_${interaction.channel.id}_${interaction.user.id}`);
  
  if (interaction.user.id !== roomOwnerId && !isAdmin) {
    return interaction.reply({ content: "Bu odanın sahibi değilsiniz veya yönetici yetkiniz yok!", ephemeral: true });
  }

  const action = interaction.customId.split("_")[1];
  switch (action) {
    case "lock": await toggleRoomLock(interaction); break;
    case "mute": await toggleMuteForAll(interaction); break;
    case "video": await toggleVideoForAll(interaction); break;
    case "manage": await showManageUsersMenu(interaction); break;
    case "name": await showRoomNameModal(interaction); break;
    case "limit": await showRoomLimitModal(interaction); break;
    case "events": await toggleEventsKey(interaction); break;
    case "eyes": await toggleEyesKey(interaction); break;
    case "time": await showChannelTime(interaction); break;
  }
}

async function toggleButton(interaction, customId, enabledState) {
  const components = interaction.message.components.map(row => {
    const newRow = ActionRowBuilder.from(row);
    newRow.components.forEach(c => {
      if (c.data.custom_id === customId) {
        c.setStyle(enabledState ? ButtonStyle.Success : ButtonStyle.Danger);
      }
    });
    return newRow;
  });
  await interaction.update({ components });
}

async function toggleRoomLock(interaction) {
  const channel = interaction.channel;
  const isLocked = channel.permissionsFor(channel.guild.roles.everyone).has(PermissionsBitField.Flags.Connect);
  await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { Connect: !isLocked });
  await toggleButton(interaction, "room_lock", !isLocked);
}

async function toggleMuteForAll(interaction) {
  const channel = interaction.channel;
  const currentState = channel.permissionsFor(channel.guild.roles.everyone).has(PermissionsBitField.Flags.Speak);
  await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { Speak: !currentState });
  await toggleButton(interaction, "room_mute", !currentState);
}

async function toggleVideoForAll(interaction) {
  const channel = interaction.channel;
  const currentState = channel.permissionsFor(channel.guild.roles.everyone).has(PermissionsBitField.Flags.Stream);
  await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { Stream: !currentState });
  await toggleButton(interaction, "room_video", !currentState);
}

async function toggleEventsKey(interaction) {
  const channel = interaction.channel;
  const currentState = channel.permissionsFor(channel.guild.roles.everyone).has(PermissionsBitField.Flags.CreateEvents);
  await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { CreateEvents: !currentState });
  await toggleButton(interaction, "room_events", !currentState);
}

async function toggleEyesKey(interaction) {
  const channel = interaction.channel;
  const currentState = channel.permissionsFor(channel.guild.roles.everyone).has(PermissionsBitField.Flags.ViewChannel);
  await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { ViewChannel: !currentState });
  await toggleButton(interaction, "room_eyes", !currentState);
}

async function showManageUsersMenu(interaction) {
  const selectMenu = new UserSelectMenuBuilder().setCustomId('private_room_server_user_select').setPlaceholder('Bir kullanıcı seçin').setMaxValues(1);
  const row = new ActionRowBuilder().addComponents(selectMenu);
  const searchButton = new ButtonBuilder().setCustomId('private_room_user_search').setLabel('Kullanıcı ID ile Ara').setStyle(ButtonStyle.Primary).setEmoji('🔍');
  const buttonRow = new ActionRowBuilder().addComponents(searchButton);
  await interaction.reply({ content: 'Yönetmek istediğiniz kullanıcıyı seçin:', components: [row, buttonRow], ephemeral: true });
}

async function handleUserSearchButton(interaction) {
  const modal = new ModalBuilder().setCustomId('user_search_modal').setTitle('Kullanıcı ID ile Ara');
  const userIdInput = new TextInputBuilder().setCustomId('user_id_input').setLabel('Kullanıcı ID').setStyle(TextInputStyle.Short).setRequired(true);
  modal.addComponents(new ActionRowBuilder().addComponents(userIdInput));
  await interaction.showModal(modal);
}

async function handleUserSearchModal(interaction) {
  const userId = interaction.fields.getTextInputValue('user_id_input');
  try {
    const member = await interaction.guild.members.fetch(userId);
    if (!member) return interaction.reply({ content: "Kullanıcı bulunamadı.", ephemeral: true });
    await showUserManagementMenu(interaction, member);
  } catch (error) { await interaction.reply({ content: "Kullanıcı bulunamadı.", ephemeral: true }); }
}

async function showUserManagementMenu(interaction, member) {
  const currentPermissions = interaction.channel.permissionOverwrites.resolve(member.id);
  const isAdmin = currentPermissions && currentPermissions.allow.has(PermissionsBitField.Flags.ManageChannels);
  const canView = currentPermissions && currentPermissions.allow.has(PermissionsBitField.Flags.ViewChannel);
  const canSendMessages = currentPermissions && currentPermissions.allow.has(PermissionsBitField.Flags.SendMessages);
  const canConnect = currentPermissions && currentPermissions.allow.has(PermissionsBitField.Flags.Connect);

  const manageButtons1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`user_manage_${member.id}_${isAdmin ? 'removeAdmin' : 'makeAdmin'}`).setLabel(isAdmin ? 'Yetkileri Kaldır' : 'Yönetici Yap').setStyle(isAdmin ? ButtonStyle.Danger : ButtonStyle.Success).setEmoji(isAdmin ? '🚫' : '🛡️'),
    new ButtonBuilder().setCustomId(`user_manage_${member.id}_${canView ? 'denyView' : 'allowView'}`).setLabel(canView ? 'Görmeyi Kaldır' : 'Görme İzni Ver').setStyle(canView ? ButtonStyle.Danger : ButtonStyle.Success).setEmoji(canView ? '🚫' : '👀'),
    new ButtonBuilder().setCustomId(`user_manage_${member.id}_${canSendMessages ? 'denySendMessages' : 'allowSendMessages'}`).setLabel(canSendMessages ? 'Mesaj Gönderme İzni Kaldır' : 'Mesaj Gönderme İzni Ver').setStyle(canSendMessages ? ButtonStyle.Danger : ButtonStyle.Success).setEmoji(canSendMessages ? '🚫' : '✉️')
  );

  const manageButtons2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`user_manage_${member.id}_${canConnect ? 'denyConnect' : 'allowConnect'}`).setLabel(canConnect ? 'Bağlanma İzni Kaldır' : 'Bağlanma İzni Ver').setStyle(canConnect ? ButtonStyle.Danger : ButtonStyle.Success).setEmoji(canConnect ? '🚫' : '🔗'),
    new ButtonBuilder().setCustomId(`user_manage_${member.id}_transfer`).setLabel('Oda Sahipliğini Devret').setStyle(ButtonStyle.Primary).setEmoji('👑'),
    new ButtonBuilder().setCustomId(`user_manage_${member.id}_kick`).setLabel('Sesten At').setStyle(ButtonStyle.Danger).setEmoji('👢')
  );

  if (interaction.isModalSubmit()) { await interaction.reply({ content: `${member.user.tag} için işlem:`, components: [manageButtons1, manageButtons2], ephemeral: true }); }
  else { await interaction.update({ content: `${member.user.tag} için işlem:`, components: [manageButtons1, manageButtons2], ephemeral: true }); }
}

async function handleUserSelect(interaction) {
  const selectedUserId = interaction.values[0];
  const member = await interaction.guild.members.fetch(selectedUserId).catch(() => null);
  if (!member) return interaction.reply({ content: "Seçilen kullanıcı bulunamadı.", ephemeral: true });
  await showUserManagementMenu(interaction, member);
}

async function handleUserManage(interaction) {
  const parts = interaction.customId.split('_');
  const userId = parts[2];
  const operation = parts[3];
  const channel = interaction.channel;
  const member = await channel.guild.members.fetch(userId).catch(() => null);

  if (!member) return interaction.reply({ content: "Seçilen kullanıcı bulunamadı.", ephemeral: true });

  if (operation === 'transfer') {
    const roomOwnerId = db.get(`privateRoom_${channel.id}`);
    if (interaction.user.id !== roomOwnerId) return interaction.reply({ content: "Bu odanın sahibi değilsiniz!", ephemeral: true });
    await channel.permissionOverwrites.edit(interaction.user, { ManageChannels: null, Connect: null, Speak: null, Stream: null });
    await channel.permissionOverwrites.edit(member, { ManageChannels: true, Connect: true, Speak: true, Stream: true });
    db.set(`privateRoom_${channel.id}`, member.id);
    db.set(`privateRoom_${member.id}`, channel.id);
    db.delete(`privateRoom_${interaction.user.id}`);
    await channel.send(`<@${member.id}>, bu odanın yeni sahibi oldunuz!`);
    await interaction.update({ content: `Oda devredildi.`, components: [], ephemeral: true });
  } else if (operation === 'kick') {
    if (member.voice.channel?.id === channel.id) { await member.voice.disconnect(); await interaction.update({ content: "Kullanıcı atıldı.", components: [], ephemeral: true }); }
    else { await interaction.reply({ content: "Kullanıcı seste değil.", ephemeral: true }); }
  } else {
    if (operation === 'makeAdmin') { db.set(`admin_${channel.id}_${member.id}`, true); await channel.permissionOverwrites.edit(member, { ManageChannels: true }); }
    else if (operation === 'removeAdmin') { db.delete(`admin_${channel.id}_${member.id}`); await channel.permissionOverwrites.edit(member, { ManageChannels: false }); }
    else {
      const changes = { allowView: { ViewChannel: true }, denyView: { ViewChannel: false }, allowSendMessages: { SendMessages: true }, denySendMessages: { SendMessages: false }, allowConnect: { Connect: true }, denyConnect: { Connect: false } };
      await channel.permissionOverwrites.edit(member, changes[operation]);
    }
    await interaction.update({ content: "İşlem başarılı.", components: [], ephemeral: true });
  }
}

async function showChannelTime(interaction) {
  const diff = new Date() - interaction.channel.createdAt;
  const minutes = Math.floor(diff / 60000);
  await interaction.reply({ embeds: [new EmbedBuilder().setColor('#0099ff').setTitle('⏱️ Oda Süresi').setDescription(`Bu oda ${minutes} dakikadır açık.`)], ephemeral: true });
}

async function showRoomNameModal(interaction) {
  const modal = new ModalBuilder().setCustomId('room_name_modal').setTitle('Oda İsmini Değiştir');
  modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name_input').setLabel('Yeni oda ismi').setStyle(TextInputStyle.Short).setRequired(true)));
  await interaction.showModal(modal);
}

async function showRoomLimitModal(interaction) {
  const modal = new ModalBuilder().setCustomId('room_limit_modal').setTitle('Oda Limiti Ayarla');
  modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('limit_input').setLabel('Yeni limit (0-99)').setStyle(TextInputStyle.Short).setRequired(true)));
  await interaction.showModal(modal);
}

async function handleRoomNameChange(interaction) {
  const newName = interaction.fields.getTextInputValue('name_input');
  await interaction.channel.setName(newName);
  await interaction.reply({ content: `Oda ismi değiştirildi.`, ephemeral: true });
}

async function handleRoomLimitChange(interaction) {
  const newLimit = parseInt(interaction.fields.getTextInputValue('limit_input'));
  if (isNaN(newLimit) || newLimit < 0 || newLimit > 99) return interaction.reply({ content: 'Geçersiz limit.', ephemeral: true });
  await interaction.channel.setUserLimit(newLimit);
  await interaction.reply({ content: `Limit ayarlandı.`, ephemeral: true });
}
