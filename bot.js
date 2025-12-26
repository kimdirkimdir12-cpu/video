import { Telegraf } from "telegraf";
import fetch from "node-fetch";
import express from "express";
import fs from "fs";

const BOT_TOKEN = "8354616635:AAGXy1KffmJkFEV1mGr3M_IqDA2AH5IYcG0";
const ADMIN_ID = 5728779626;

const bot = new Telegraf(BOT_TOKEN);
const app = express();

let db = fs.existsSync("db.json") ? JSON.parse(fs.readFileSync("db.json")) : { users: [] };

function save() {
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
}

// START
bot.start(ctx => {
  if (!db.users.find(u => u.id === ctx.from.id)) {
    db.users.push({ id: ctx.from.id, username: ctx.from.username || "", name: ctx.from.first_name || "" });
    save();
  }
  ctx.reply("Instagram post yoki reel linkini yuboring 👇");
});

// ADMIN
bot.command("admin", ctx => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply("❌ Kirish taqiqlangan");
  let msg = `👑 ADMIN PANEL\nJami: ${db.users.length}\n\n`;
  db.users.forEach((u, i) => {
    msg += `${i+1}) ${u.name}\n@${u.username}\nID: ${u.id}\n\n`;
  });
  ctx.reply(msg.slice(0,4000));
});

// VIDEO OLIB BERISH
async function getIGVideo(url) {
  try {
    const clean = url.split("?")[0];
    const res = await fetch(clean + "?__a=1&__d=dis", { headers:{ "user-agent":"Mozilla/5.0"}});
    const j = await res.json();
    return j.items?.[0]?.video_versions?.[0]?.url || null;
  } catch {
    return null;
  }
}

bot.on("text", async ctx => {
  if (!ctx.message.text.includes("instagram.com")) return;
  const v = await getIGVideo(ctx.message.text);
  if (!v) return ctx.reply("❌ Video topilmadi");
  await ctx.replyWithVideo(v);
});

// WEBHOOK SETUP
app.use(bot.webhookCallback("/bot"));
app.listen(3000, async () => {
 await bot.telegram.setWebhook("https://srv-d5776oogjchc739dupf0.onrender.com/bot");

  console.log("BOT LIVE WEBHOOK");
});
