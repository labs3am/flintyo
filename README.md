# 🫏 Flintyo

### The Donkey Card Game

Flintyo is a free, browser-based multiplayer version of the classic **Donkey card game**.

Play with friends, play against AI, or pass one phone around and play together.

The goal is simple:

**Match your cards. Get rid of your pairs. Don't be the one left holding the Donkey. 🫏**

## 🎮 Play Flintyo

**[Play Now](https://flintyo.com)**

No download. No account required.

---

## ✨ Features

* 🃏 **Donkey card game** with simple, fast gameplay
* 👥 **Play with friends** using private room codes
* 🤖 **Play against AI** when you don't have enough players
* 📱 **One-phone mode** for playing together in person
* 🎭 **Choose your character** before playing
* 🎮 **Multiple AI difficulties**
* 💬 **Quick reactions** for interacting with other players
* 🫏 **Funny character reactions** during the game
* 📱 **Mobile-first design**
* 🔗 **Easy room sharing**

---

## 🌐 Game Modes

### Quick Play

Find random players and start a game without needing to create a private room.

### With Friends

Create a room, share the room code, and play with your friends online.

### Play with AI

Play against AI opponents when you don't have enough people for a full game.

### One Phone

Pass the phone around and play together in the same room.

---

## 🧠 Why Flintyo?

The idea came from a simple problem.

I wanted to play Donkey with friends, but playing cards at a tea shop wasn't always practical.

Later, a friend from Ireland and I wanted to play Donkey online, but the game we found required more players than we had.

So I built Flintyo.

The idea is simple:

> **If you want to play Donkey, you should be able to just start a game.**

Friends unavailable? Add AI.

Only two people online? Start anyway.

No cards around? Open the browser.

---

## 🛠️ Built With

* React
* TypeScript
* Tailwind CSS
* Supabase
* Real-time multiplayer
* AI opponents

---

## 💻 Local development

Flintyo is built with Vite + npm. To run or preview it yourself:

```bash
# install dependencies (npm)
npm install

# local dev server with hot reload  ->  http://localhost:8080
npm run dev

# the production build exactly as Cloudflare serves  ->  http://localhost:4173
npm run build
npm run preview
```

Route map to test the game:
- `http://localhost:8080/` — landing
- `http://localhost:8080/start` — set up a game (AI / online / pass & play)
- `http://localhost:8080/rules` — rules explainer
- `http://localhost:8080/play?mode=ai&players=4&char=donny&level=normal` — vs bots
- `http://localhost:8080/room/ABCDE` — join/spectate an online room

### Pre-push check

There is a git pre-push hook that runs the full gate automatically before **any** `git push`:

```
npm run check        # lint → test → build
```

If any step fails, the push is aborted so broken code never leaves your machine. The hook is enabled for this clone already. On a fresh clone, activate it once:

```bash
git config core.hooksPath .githooks
```

> 🛡️ Heads-up before merging to `main`: `npm run check` must be green. The lint rule has a few harmless React-refresh warnings in the shadcn UI files, but **0 errors**.

---

## 🚧 Project Status

Flintyo is an active experiment from **Labs3AM**.

The current version focuses on the core game experience. More multiplayer and social features are being developed, including:

* 🌎 Random matchmaking
* 👤 Player profiles
* 🎭 More characters and animations
* 😂 More reactions and emotes
* 🏆 Stats and leaderboards
* 🎨 Character cosmetics
* 🔄 Better reconnect and matchmaking systems

---

## 🏠 From Labs3AM

Flintyo is a project from **Labs3AM**, an experimental software studio building and testing digital products by actually putting them in people's hands.

**Build. Experiment. Evolve.**

---

## 📄 License

This project is currently not open source for redistribution.

© Labs3AM
