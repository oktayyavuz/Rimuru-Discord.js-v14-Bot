module.exports = {
  name: "messageDelete",
  run: async (client, message) => {
    if (message.partial) return;
    if (message.author?.bot) return; 
    
    const snipes = client.snipes.get(message.channel.id) || [];
    if (snipes.length > 10) snipes.length = 10; 

    snipes.unshift({
      content: message.content,
      author: message.author,
      timestamp: message.createdTimestamp
    });

    client.snipes.set(message.channel.id, snipes);
  }
};
