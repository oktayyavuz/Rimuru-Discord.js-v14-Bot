module.exports = {
  name: "level-ekle",
  description: "Seviyenizi arttırın.",
  type: 1,
  options: [
    {
      type: 6,
      name: "kullanıcı",
      description: "Hangi kullanıcıyı etkileyecek?",
      required: true
    },
    {
      type: 10,
      name: "miktar",
      description: "Kaç level eklenecek?",
      required: true
    }
  ],

  run: async (client, interaction) => {
    const { options } = interaction;
    const member = options.getUser("kullanıcı");
    const levelToAdd = options.getNumber("miktar");

    if (!interaction.member.permissions.has("MANAGE_MESSAGES")) {
      return interaction.reply({ content: "❌ | Mesajları Yönet Yetkin Yok!" });
    }

    // Örnek olarak kullanıcıya eklenen seviyeyi burada işleyebilirsiniz
    // Bu örnekte veritabanı kullanılmıyor, sadece mesaj ile bildiriliyor
    interaction.reply({ content: `${levelToAdd} seviye ${member} adlı kullanıcıya eklendi.` });
  }
};
