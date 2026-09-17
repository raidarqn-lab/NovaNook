const applicationId = process.env.DISCORD_APPLICATION_ID;
const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;
if (!applicationId || !token) throw new Error("DISCORD_APPLICATION_ID and DISCORD_BOT_TOKEN are required");

const sections = [["bulletin","Top scrolling bulletin"],["tasks","Today's shiny tasks"],["captures","Upcoming city captures"],["strategy","Weekly VS strategy"],["train","Train assignments"],["hammer","Golden Hammer"],["spotlight","Recognition and upgrades"],["meme","Meme of the week"],["battle","Next battle day"]];
const choices = sections.map(([name]) => ({ name, value: name }));
const command = {
  name: "nova", description: "Update The Nova Nook alliance board", default_member_permissions: "32",
  options: [
    { type: 1, name: "publish", description: "Publish or replace a dashboard section", options: [
      { type: 3, name: "section", description: "Where this update appears", required: true, choices },
      { type: 3, name: "title", description: "Main heading or player name", required: true, max_length: 100 },
      { type: 3, name: "details", description: "Instructions or schedule; use | for new lines", required: true, max_length: 1000 },
      { type: 3, name: "language", description: "Language used for title and details", required: false, choices: [["English","en"],["العربية","ar"],["Français","fr"],["Deutsch","de"],["한국어","ko"],["Português","pt"],["Español","es"],["Tiếng Việt","vi"]].map(([name,value]) => ({ name, value })) },
      { type: 3, name: "meta", description: "Optional date, time, level, or short label", required: false, max_length: 100 },
      { type: 3, name: "translations", description: "Optional JSON translations generated from your prompt", required: false, max_length: 4000 },
      { type: 4, name: "expires", description: "Hours before it disappears; 0 means no expiry", required: false, min_value: 0, max_value: 8760 },
      { type: 11, name: "image", description: "Optional image or meme", required: false }
    ]},
    { type: 1, name: "clear", description: "Remove a section from the live board", options: [
      { type: 3, name: "section", description: "Section to clear", required: true, choices }
    ]}
  ]
};

const endpoint = guildId
  ? `https://discord.com/api/v10/applications/${applicationId}/guilds/${guildId}/commands`
  : `https://discord.com/api/v10/applications/${applicationId}/commands`;
const response = await fetch(endpoint, { method: "PUT", headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" }, body: JSON.stringify([command]) });
if (!response.ok) throw new Error(`Discord returned ${response.status}: ${await response.text()}`);
console.log("Nova commands registered.");
