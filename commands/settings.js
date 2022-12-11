const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Configure how I behave!')
    .addBooleanOption(option => option.setName('enabled').setDescription('Enable or disable the birthday system.').setRequired(true))
    .addRoleOption(option => option.setName('birthday-role').setDescription('The role to give to users on their birthday.').setRequired(true))
    .addChannelOption(option => option.setName('birthday-channel').setDescription('The channel to send the birthday message in.').setRequired(true))
    .addBooleanOption(option => option.setName('birthday-ping').setDescription('Ping the user on their birthday.').setRequired(true)),

  async execute(interaction) {
    const { Database } = require('simpl.db');
    const config = {
      autoSave: true,
      tabSize: 2,
    }
    const db = new Database(config);
    db.set(`database.${interaction.guild.id}.settings`, {
      enabled: interaction.options.getBoolean('enabled'),
      birthdayRole: interaction.options.getRole('birthday-role').id,
      birthdayChannel: interaction.options.getChannel('birthday-channel').id,
      birthdayPing: interaction.options.getBoolean('birthday-ping'),
    });

    await interaction.reply({ content: `Settings saved!\n\nEnabled: \`${interaction.options.getBoolean('enabled')}\`\nBirthdayRole: \`${interaction.options.getRole('birthday-role').name}\`\nBirthdayChannel: \`${interaction.options.getChannel('birthday-channel').name}\`\nBirthdayPing: \`${interaction.options.getBoolean('birthday-ping')}\``, ephemeral: true });
  },
};
