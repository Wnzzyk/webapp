# Faceit Arena — Web App

Telegram Mini App для Faceit Arena Standoff 2.  
Стек: **Next.js 14** · **PostgreSQL** · **Prisma** · **Framer Motion** · **Railway**

---

## Деплой (Railway)

### 1. Создай PostgreSQL сервис на Railway

1. [railway.app](https://railway.app) → New Project → PostgreSQL
2. Скопируй `DATABASE_URL` из Variables

### 2. Создай веб-сервис

1. New Service → GitHub (или Deploy from GitHub)
2. Выбери этот репозиторий, корень `webapp/`
3. Добавь переменные окружения:
   ```
   DATABASE_URL=<из шага 1>
   BOT_TOKEN=<твой токен бота>
   NODE_ENV=production
   ```

### 3. Мигрируй данные из SQLite → PostgreSQL

```bash
cd webapp

# Установи зависимости (если не установлены)
npm install

# Сгенерируй Prisma клиент
npx prisma generate

# Применяй схему на PostgreSQL
DATABASE_URL="..." npx prisma db push

# Запусти миграцию данных
DATABASE_URL="..." SQLITE_PATH="../python_backend/faceit.db" node scripts/migrate-sqlite.js
```

### 4. Настрой Mini App в BotFather

1. `/mybots` → твой бот → Bot Settings → Menu Button
2. Вставь URL вашего Railway деплоя: `https://faceit-arena.up.railway.app`
3. Или через `/newapp` для полноценного Mini App

### 5. Обнови бота (Пункт 2)

Смотри инструкции в `../python_backend/README_MIGRATION.md`

---

## Локальная разработка

```bash
# 1. Установи зависимости
npm install

# 2. Создай .env из примера
cp .env.example .env
# Заполни DATABASE_URL и BOT_TOKEN

# 3. Примени схему БД
npx prisma db push

# 4. Запусти dev сервер
npm run dev
```

Открой http://localhost:3000 — в браузере без Telegram initData  
профиль не подгрузится, но лидерборд и поиск работают.

---

## Структура

```
src/
├── app/
│   ├── layout.tsx          # Root layout + Telegram WebApp script
│   ├── page.tsx            # Main page с табами
│   ├── providers.tsx       # Auth context (Telegram initData)
│   └── api/
│       ├── me/             # GET own profile
│       ├── leaderboard/    # GET top players
│       ├── player/[nick]/  # GET player by nickname
│       ├── search/         # GET search results
│       └── telegram-file/  # Proxy Telegram file (banner)
├── components/
│   ├── Navigation.tsx      # Нижняя навигация
│   ├── PlayerView.tsx      # Профиль (Default + Pro League tabs)
│   ├── LeaderboardPage.tsx # Топ с подиумом
│   ├── SearchPage.tsx      # Поиск по нику
│   ├── MapStats.tsx        # Статистика по картам
│   └── ui/
│       ├── AnimatedNumber  # Счётчик с анимацией
│       ├── RingChart       # SVG кольцо win rate
│       └── LevelBadge      # Бейдж уровня 1–10
└── lib/
    ├── db.ts               # Prisma + запросы
    ├── telegram.ts         # initData validation + file proxy
    └── types.ts            # Общие типы
```
