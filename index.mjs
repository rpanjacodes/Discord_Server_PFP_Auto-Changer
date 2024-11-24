import { readdirSync, statSync } from "node:fs";
import * as Discord from "discord.js";

process.loadEnvFile();

const client = new Discord.Client({
  intents: [Discord.GatewayIntentBits.Guilds]
});

const supportedIconExts = ["png", "jpg", "jpeg", "gif"];

const icons = readdirSync("./icons").reduce((total, current) => {
  const icon = `./icons/${current}`;
  if (supportedIconExts.some(ext => icon.endsWith(ext)) && statSync(icon).isFile()) {
    total.push(icon);
  } else {
    console.log(`${current}: invalid icon. supported extensions: ${supportedIconExts}`);
  }
  return total;
}, []);

if (icons.length === 0) {
  console.log("No valid icons found, terminating process..");
  process.exit(0);
}

const randomIcon = () => icons[Math.trunc(Math.random() * icons.length)];

const changeGuildIcon = async () => {
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) {
    console.log("bot is not present in said guild");
    return;
  }
  if (!guild.members.me.permissions.has(Discord.PermissionFlagsBits.ManageGuild, true)) {
    console.log("insufficient perms in said guild");
    return;
  }
  await guild.setIcon(randomIcon());
};

client.once(Discord.Events.ClientReady, async () => {
  console.log(`${client.user.displayName} is ready`);
  await changeGuildIcon();
  setInterval(changeGuildIcon, parseInt(process.env.UPDATE_INTERVAL) * 60 * 1000);
});

client.login(process.env.DISCORD_TOKEN);
