const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildCreate,
  async execute(interaction, client) {
    const { Database } = require('simpl.db');
    const config = {
      autoSave: true,
      tabSize: 2,
    }
    const db = new Database(config);
    db.set(`database.${interaction.id}.settings`, {
      enabled: false,
      birthdayRole: false,
      birthdayChannel: false,
      birthdayMessage: false,
      birthdayPing: false,
    });

    // Send message to the server owner
    const owner = await client.users.fetch(interaction.ownerId);

    const embed = new EmbedBuilder()
      .setTitle('Thanks for adding me!')
      .setDescription(`**I am happy to be here!**\n\n Before I can work someone needs to configure the \`/settings\`.`)
      .setColor('#5865f2')
    await owner.send({ embeds: [embed] });
  },
};