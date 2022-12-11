const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    // Set the bot's activity
    client.user.setPresence({
      activity: {
        name: 'out for birthdays!',
        type: 'WATCHING'
      },
      status: 'dnd'
    });

    const { Database } = require('simpl.db');
    const config = {
      autoSave: true,
      tabSize: 2,
    }
    const db = new Database(config);

    // Every day at 8:00 PM (GMT+1) check for birthdays
    const schedule = require('node-schedule');
    const rule = new schedule.RecurrenceRule();
    rule.hour = 21;
    rule.minute = 51;
    rule.tz = 'Europe/Berlin';
    schedule.scheduleJob(rule, async () => {
      // Get all guilds from the database
      const guilds = db.get('database');
      // Loop through all guilds
      for (guild in guilds) {
        const guildId = guild;
        const birthdays = db.get(`database.${guildId}.birthdays`);
        guild = guilds[guild];
        // Get all birthdays from the database
        // If there are no birthdays
        if (birthdays) {
          // Loop through all birthdays and see if it's their birthday today
          for (user in birthdays) {
            user = birthdays[user];
            const year = user.year
            const month = user.month
            const day = user.day
            const id = user.id

            // Make sure their birthday has not been announced today
            const lastAnnounced = db.get(`database.${guildId}.birthdays.${id}.lastAnnounced`);
            const today = new Date();
            // Make sure lastAnnounced is not today
            let currentDay = `${today.getDate()} ${today.getMonth() + 1} ${today.getFullYear()}`
            if (lastAnnounced !== currentDay) {
              const nextBirthday = new Date(today.getFullYear(), month - 1, day);
              if (today > nextBirthday) {
                nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
              }
              const daysUntilBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
              let age = null;
              if (year !== null) {
                age = today.getFullYear() - year;
              }
              if (daysUntilBirthday === 365) {
                // If it's their birthday today, send a message in the birthday channel
                const birthdayChannel = db.get(`database.${guildId}.settings.birthdayChannel`);
                if (birthdayChannel) {
                  const channel = client.channels.cache.get(birthdayChannel);
                  if (channel) {
                    if (age !== null) {
                      if (db.get(`database.${guildId}.settings.birthdayPing`)) {
                        channel.send(`Happy birthday to <@${id}>! You are now ${age} years old!`);
                      } else {
                        channel.send(`Happy birthday to ${user.name} ! You are now ${age} years old!`);
                      }
                    } else {
                      if (db.get(`database.${guildId}.settings.birthdayPing`)) {
                        channel.send(`Happy birthday to <@${id}>!`);
                      } else {
                        channel.send(`Happy birthday to ${user.name}!`);
                      }
                    }
                  }
                  // If there is a birthday role, give it to them
                  const birthdayRole = db.get(`database.${guildId}.settings.birthdayRole`);
                  if (birthdayRole) {
                    // Add the birthday role to the user
                    // Guilds and roles aren't cached when the bot starts, so we need to fetch them
                    const role = await client.guilds.cache.get(guildId).roles.fetch(birthdayRole);
                    if (role) {
                      // Make this not crash if it does not have permissions
                      const member = await client.guilds.cache.get(guildId).members.fetch(id);
                      member.roles.add(role).catch((e) => {
                        console.log(e)
                      })
                      // Save that they have the birthday role
                      db.set(`database.${guildId}.birthdays.${id}.birthdayRoleEquipped`, true);
                    }
                  }
                }
                // Save when their birthday was announced last
                db.set(`database.${guildId}.birthdays.${id}.lastAnnounced`, `${today.getDate()} ${today.getMonth() + 1} ${today.getFullYear()}`);
              }
            } else {
              const birthdayRole = db.get(`database.${guildId}.settings.birthdayRole`);
              // If they have the birthday role, remove it
              if (db.get(`database.${guildId}.birthdays.${id}.birthdayRoleEquipped`)) {
                const role = client.guilds.cache.get(guildId).roles.cache.get(birthdayRole);
                if (role) {
                  // fetch guild and role
                  const guild = await client.guilds.fetch(guildId);
                  const role = await guild.roles.fetch(birthdayRole);
                  const member = await guild.members.fetch(id);
                  member.roles.remove(role).catch((e) => {
                    console.log(e)
                  })
                  // Save that they don't have the birthday role
                  db.set(`database.${guildId}.birthdays.${id}.birthdayRoleEquipped`, false);
                }
              }
            }
          }
        }
      }
    });
  },
};
