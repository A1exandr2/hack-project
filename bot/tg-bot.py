import logging
import requests
from telegram import Update, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import (Application, CommandHandler, MessageHandler, ContextTypes, filters)

BOT_TOKEN = "8064562632:AAGPT4HLzz39rjjU0uxYahSZY9O3lzd1rNw"
BACKEND_URL = "http://backend:8000/api/plan"

logging.basicConfig(level=logging.INFO)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [[KeyboardButton("Отправить геопозицию", request_location=True)]]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True, one_time_keyboard=True)
    await update.message.reply_text(
        "Привет!\n"
        "1. Напишите, что хотите посетить (например: музеи, парки).\n"
        "2. Отправьте время в часах (например: 3).\n"
        "3. Нажмите кнопку ниже, чтобы отправить свою геопозицию.",
        reply_markup=reply_markup
    )

user_data = {}

async def handle_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    text = update.message.text.strip()

    if user_id not in user_data:
        user_data[user_id] = {}

    if "interests" not in user_data[user_id]:
        user_data[user_id]["interests"] = text
        await update.message.reply_text("Отлично! Теперь введите время в часах (например: 2 или 3.5):")
    elif "time_hours" not in user_data[user_id]:
        try:
            time_hours = float(text)
            if time_hours <= 0 or time_hours > 8:
                raise ValueError
            user_data[user_id]["time_hours"] = time_hours
            await update.message.reply_text(
                "Теперь отправьте свою геопозицию (нажмите скрепку → Геопозиция)."
            )
        except ValueError:
            await update.message.reply_text("Пожалуйста, введите число от 1 до 8.")
    else:
        await update.message.reply_text("Вы уже ввели все данные. Отправьте геопозицию!")

async def handle_location(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    location = update.message.location
    if user_id not in user_data or "interests" not in user_data[user_id] or "time_hours" not in user_data[user_id]:
        await update.message.reply_text("Сначала введите интересы и время!")
        return

    data = {
        "interests": user_data[user_id]["interests"],
        "time_hours": user_data[user_id]["time_hours"],
        "user_lat": location.latitude,
        "user_lon": location.longitude
    }

    try:
        await update.message.reply_text("Генерирую маршрут...")
        response = requests.post(BACKEND_URL, json=data, timeout=180)
        if response.status_code == 200:
            plan = response.json()
            summary = plan["summary"]
            msg = (
                f"Маршрут готов!\n\n"
                f"Мест: {summary['total_places']}\n"
                f"Пешком: {summary['total_walking_time_min']} мин\n"
                f"Всего: {summary['total_duration_hours']} ч\n\n"
                f"План:\n"
            )
            for i, p in enumerate(plan["plan"], 1):
                msg += f"{i}. {p['title']}\n   — {p['why']}\n   {p['walking_time_min']} мин - {p['visit_duration_min']} мин\n\n"

            await update.message.reply_text(msg, disable_web_page_preview=True)
        else:
            err = response.json().get("detail", "Ошибка сервера")
            await update.message.reply_text(f"Не удалось построить маршрут:\n{err}")

    except Exception as e:
        logging.error(f"Bot error: {e}")
        await update.message.reply_text("Произошла ошибка. Попробуйте позже.")

    user_data.pop(user_id, None)

if __name__ == "__main__":
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT, handle_text))
    app.add_handler(MessageHandler(filters.LOCATION, handle_location))
    app.run_polling()