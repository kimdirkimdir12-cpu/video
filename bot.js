import { Telegraf } from "telegraf";
import fetch from "node-fetch";
import fs from "fs";

const BOT_TOKEN = "8354616635:AAGXy1KffmJkFEV1mGr3M_IqDA2AH5IYcG0";
const ADMIN_ID = 5728779626; // o'zingizni telegram ID

const bot = new Telegraf(BOT_TOKEN);
let db = JSON.parse(fs.readFileSync("db.json"));

function save() {
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
}

// START
bot.start(ctx => {
  if (!db.users.find(u => u.id === ctx.from.id)) {
    db.users.push({
      id: ctx.from.id,
      username: ctx.from.username || "",
      name: ctx.from.first_name,
      phone: ""
    });
    save();
  }
  ctx.reply("Instagram linkini yuboring 👇");
});

// ADMIN PANEL
bot.command("admin", ctx => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply("Kirish taqiqlangan");

  let msg = `👑 ADMIN PANEL\n\nJami foydalanuvchilar: ${db.users.length}\n\n`;
  db.users.forEach((u,i)=>{
    msg += `${i+1}) ${u.name}\n@${u.username}\nID: ${u.id}\n\n`;
  });
  ctx.reply(msg.substring(0, 4000));
});

// LINK QABUL QILISH
bot.on("text", async ctx => {
  if (!ctx.message.text.includes("instagram.com")) return;

  const api = `https://ddinstagram.com/api/ig?url=${encodeURIComponent(ctx.message.text)}`;
  const res = await fetch(api);
  const data = await res.json();

  if (!data.video) return ctx.reply("Video topilmadi.");

  await ctx.replyWithVideo(data.video);
  if (data.audio) await ctx.replyWithAudio(data.audio);
});

bot.launch();
