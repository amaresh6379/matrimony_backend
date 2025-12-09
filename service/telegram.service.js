const TelegramBot = require('node-telegram-bot-api');
require('../config');
const authService = require('../service/auth.service');

const token = CONFIG.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const adminChatId = CONFIG.TELEGRAM_USER_ID;

async function sendNewUserMessage(user) {
  const message = `
  <b>New User Registered</b>
  id: ${user.id}
  Name: ${user.name}
  MatrimonyId: ${user.matrimonyId}
  Gender: ${user.gender}
  Dob: ${user.dob}
  Age:  ${user.age}
  mobileNumber: ${user.mobileNumber}
  martialStatus: ${user.martialStatus}
  religion: ${user.religion}
  nativePlace: ${user.nativePlace}
  districtName: ${user.districtName}
`;
  console.log("message", message);
  bot.sendMessage(adminChatId, message, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Activate ✅', callback_data: `activate_${user.id}` },
          { text: 'Reject ❌', callback_data: `reject_${user.id}` }
        ]
      ]
    }
  });
}

module.exports.sendNewUserMessage = sendNewUserMessage;

bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;
  const messageId = msg.message_id;
  const chatId = msg.chat.id;

  try {
    if (data.startsWith('activate_')) {
      const userId = data.split('_')[1];
      const [updateUserErr, updateUserData] = await to(authService.activeUser(userId));
      if (updateUserErr) {
        return bot.answerCallbackQuery(callbackQuery.id, { text: `Error: ${updateUserErr.message}`, show_alert: true });
      }

      await bot.answerCallbackQuery(callbackQuery.id, { text: `User ${userId} Activated ✅` });

      await bot.editMessageReplyMarkup({
        inline_keyboard: [
          [{ text: 'Activated ✅', callback_data: 'none' }]
        ]
      }, { chat_id: chatId, message_id: messageId });

      return updateUserData;
    }

    if (data.startsWith('reject_')) {
      const userId = data.split('_')[1];
      const [updateUserErr, updateUserData] = await to(authService.deleteUser(userId));
      if (updateUserErr) {
        return bot.answerCallbackQuery(callbackQuery.id, { text: `Error: ${updateUserErr.message}`, show_alert: true });
      }

      await bot.answerCallbackQuery(callbackQuery.id, { text: `User ${userId} Rejected ❌` });

      await bot.editMessageReplyMarkup({
        inline_keyboard: [
          [{ text: 'Rejected ❌', callback_data: 'none' }]
        ]
      }, { chat_id: chatId, message_id: messageId });

      return updateUserData;
    }
  } catch (err) {
    console.error('Callback error:', err);
    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Something went wrong!', show_alert: true });
  }
});

