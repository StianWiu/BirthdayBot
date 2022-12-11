const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unregister')
    .setDescription('Delete your birthday!')
    .addBooleanOption(option => option.setName('confirm').setDescription('Are you sure?').setRequired(true)),
  async execute(interaction) {
    const confirm = interaction.options.getBoolean('confirm');
    if (confirm) {
      const { Database } = require('simpl.db');
      const config = {
        autoSave: true,
        tabSize: 2,
      }
      const db = new Database(config);
      db.delete(`database.${interaction.guild.id}.birthdays.${interaction.user.id}`);
      await interaction.reply({ content: `You have been wiped from the birthday registry.`, ephemeral: true });
    } else {
      await interaction.reply({ content: `Nothing was changed`, ephemeral: true });
    }
  },
};
