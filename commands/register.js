const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Registers your birthday in my brain!')
    .addIntegerOption(option => option.setName('day').setDescription('The day you were born in.').setRequired(true))
    .addIntegerOption(option => option.setName('month').setDescription('The month you were born in.').setRequired(true))
    .addIntegerOption(option => option.setName('year').setDescription('The year you were born in.').setRequired(false)),
  async execute(interaction) {
    const month = interaction.options.getInteger('month');
    const day = interaction.options.getInteger('day');
    const year = interaction.options.getInteger('year');
    let message = `Your birthday is set to \`${month}/${day}`;
    if (year) {
      message += `/${year}`;
    }

    // Calculate how many days until the next birthday
    const today = new Date();
    const nextBirthday = new Date(today.getFullYear(), month - 1, day);
    if (today > nextBirthday) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    const daysUntil = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));

    if (month > 12 || month < 1 || day > 31 || day < 1 || year > today.getFullYear() || year < 1900 && year != null) {
      await interaction.reply({ content: 'That is not a valid date!', ephemeral: true });
      return;
    }

    message += "` (";
    if (year) {
      // Calculate how old the user is this now
      const age = today.getFullYear() - year;
      if (age > 29) {
        message += `You are ${age}? Jeez you are old. `;
      }
    }

    message += `It's \`${daysUntil}\` days until your next birthday! 🎉)`;

    // Require simpl.db to save the birthday
    const { Database } = require('simpl.db');
    const config = {
      autoSave: true,
      tabSize: 2,
    }
    const db = new Database(config);
    db.set(`database.${interaction.guild.id}.birthdays.${interaction.user.id}`, {
      "month": month,
      "day": day,
      "year": year,
      "name": interaction.user.tag,
      "id": interaction.user.id
    });

    await interaction.reply({ content: message, ephemeral: true });
  },
};
