const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('birthdays')
    .setDescription('See who\'s birthday is up next!'),
  async execute(interaction) {
    const { Database } = require('simpl.db');
    const config = {
      autoSave: true,
      tabSize: 2,
    }
    const db = new Database(config);

    const birthdays = db.get(`${database.interaction.guild.id}.birthdays`);
    // If there are no birthdays
    if (!birthdays) {
      const embed = new EmbedBuilder()
        .setTitle('No birthdays found!')
        .setDescription('There are no birthdays registered in this server.')
        .setColor('#5865f2')
      await interaction.reply({ embeds: [embed] });
      return;
    } else {
      // Loop through all birthdays and calculate the days until the next birthday
      const birthdaysArray = [];
      for (user in birthdays) {
        const person = db.get(`${database.interaction.guild.id}.birthdays.${user}`)

        const year = person.year
        const month = person.month
        const day = person.day
        const tag = person.name
        const id = person.id

        const today = new Date();
        const nextBirthday = new Date(today.getFullYear(), month - 1, day);
        if (today > nextBirthday) {
          nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
        }
        const daysUntilBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
        let age = null;
        if (year !== null) {
          age = today.getFullYear() - year;
        }
        birthdaysArray.push({
          name: tag,
          daysUntilBirthday: daysUntilBirthday,
          age: age,
          id: id,
          day: day,
          month: month,
          year: year
        });
      }
      // Sort the birthdays by days until the next birthday
      birthdaysArray.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);
      let sortedBirthdayArray = [];
      for (person in birthdaysArray) {
        person = birthdaysArray[person];
        let description = `<@${person.id}>`;
        if (person.age !== null) {
          description += `(**${person.age}**)`;
        }
        description += ` **${person.daysUntilBirthday}** Days`;
        const date = new Date(person.year, person.month - 1, person.day);
        if (sortedBirthdayArray.length < 8) {
          sortedBirthdayArray.push({
            name: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            value: description
          });
        }
      }
      // Create the embed
      const embed = new EmbedBuilder()
        .setTitle('Birthdays')
        .setDescription('Here are the birthdays in this server!')
        .setColor('#5865f2')
        .addFields(sortedBirthdayArray)
      await interaction.reply({ embeds: [embed] });
    }
  },
};
