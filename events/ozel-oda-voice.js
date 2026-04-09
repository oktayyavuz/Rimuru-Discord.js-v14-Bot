const db = require("croxydb");

function cleanupPrivateRoom(userId, channelId) {
  db.delete(`privateRoom_${userId}`);
  db.delete(`privateRoom_${channelId}`);
}

module.exports = {
  name: "voiceStateUpdate",
  run: async (client, oldState, newState) => {
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    if (oldChannel && !newChannel) {
      const roomOwnerId = db.get(`privateRoom_${oldChannel.id}`);

      if (roomOwnerId && oldChannel.members.size === 0) {
        try {
          await oldChannel.delete();
        } catch (error) {}
        cleanupPrivateRoom(roomOwnerId, oldChannel.id);
      }
    }

    if (oldChannel && newChannel && oldChannel.id !== newChannel.id) {
      const oldRoomOwnerId = db.get(`privateRoom_${oldChannel.id}`);
      
      if (oldRoomOwnerId === oldState.member.id && oldChannel.members.size === 0) {
        try {
          await oldChannel.delete();
        } catch (error) {}
        cleanupPrivateRoom(oldRoomOwnerId, oldChannel.id);
      }
      
      if (oldRoomOwnerId === oldState.member.id && oldChannel.members.size > 0) {
        const newOwner = oldChannel.members.random();
        
        db.set(`privateRoom_${oldChannel.id}`, newOwner.id);
        db.set(`privateRoom_${newOwner.id}`, oldChannel.id);
        
        db.delete(`privateRoom_${oldRoomOwnerId}`);

        oldChannel.send(`<@${newOwner.id}>, bu odanın yeni sahibi oldunuz!`).catch(() => {});
      }
    }
  }
};
