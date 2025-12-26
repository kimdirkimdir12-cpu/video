import { Telegraf } from "telegraf";
import fetch from "node-fetch";
import fs from "fs";

const BOT_TOKEN = "8354616635:AAGXy1KffmJkFEV1mGr3M_IqDA2AH5IYcG0"; // BOT TOKEN
const ADMIN_ID = 5728779626; // ADMIN TELEGRAM ID

const bot = new Telegraf(BOT_TOKEN);

let db = fs.existsSync("db.json")
  ? JSON.parse(fs.readFileSync("db.json"))
  : { users: [] };

function save() {
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
}

// ============ START ============
bot.start(ctx => {
  if (!db.users.find(u => u.id === ctx.from.id)) {
    db.users.push({
      id: ctx.from.id,
      username: ctx.from.username || "",
      name: ctx.from.first_name || "",
    });
    save();
  }
  ctx.reply("Instagram post yoki reel linkini yuboring 👇");
});

// ============ ADMIN ============
bot.command("admin", ctx => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply("❌ Kirish taqiqlangan");

  let msg = `👑 ADMIN PANEL\nJami foydalanuvchilar: ${db.users.length}\n\n`;
  db.users.forEach((u, i) => {
    msg += `${i + 1}) ${u.name}\n@${u.username}\nID: ${u.id}\n\n`;
  });

  ctx.reply(msg.slice(0, 4000));
});

// ============ VIDEO OLISH ============
async function getIGVideo(url) {
  try {
    const clean = url.split("?")[0];
    const api = `${clean}?__a=1&__d=dis`;
    const res = await fetch(api, {
      headers: { "user-agent": "Mozilla/5.0" }
    });
    const json = await res.json();
    return json.items?.[0]?.video_versions?.[0]?.url || null;
  } catch {
    return null;
  }
}

// ============ LINK QABUL ============
bot.on("text", async ctx => {
  const text = ctx.message.text;
  if (!text.includes("instagram.com")) return;

  const video = await getIGVideo(text);
  if (!video) return ctx.reply("❌ Video topilmadi.");

  await ctx.replyWithVideo(video);
});

bot.launch();
console.log("BOT LIVE");
