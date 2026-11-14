---
title: Melee bots are getting really good
summary: "Putting ten years of Super Smash Bros. Melee bots, and a few LLMs, on one Elo scale, plus a bot of my own."
date: 2026-11-14
draft: true
tags:
  - ai
  - computers
soundtrack:
  artist: "Hirokazu Ando & Shogo Sakai"
  title: "Final Destination"
  file: hirokazu-ando-shogo-sakai-final-destination.webm
---
[Super Smash Bros Melee](https://en.wikipedia.org/wiki/Super_Smash_Bros._Melee) came out in 2001, and it's one of the videogames with the highest skill ceiling (and floor xd), proof of that is that there is a lot of playing still playing it competitively. I'm not good at all, SSB4 was the only one where I put in the hours, but I know enough to understand some of the complexity, and it's extremely impressive. [^1]

It runs at 50-60 fps and competitive Melee players average 7 actions per second 


The community around it has built absurdly good open tooling: [Slippi](https://slippi.gg) for online play and replays, [libmelee](https://github.com/vladfi1/libmelee) to read the game and press buttons from Python, and even a decompilation of the game's own code.

I started with a question about LLMs. Most game benchmarks for them are turn-based (chess, Pokémon, Slay the Spire), where the game politely waits while the model thinks. I wanted one that doesn't. The LLMs ended up being the smaller part of the story... so this post starts with the bots.

All of this was built over two days and shown as a 5-minute talk at [1hack](https://1hack.eu/) on 14 November ([slides](https://melee.m19182.dev/writeup/slides.html)). Most of the code was written by coding agents running in parallel on my home server. The project site, with the boards, replays, live games and a longer [write-up](https://melee.m19182.dev/writeup/), is at [melee.m19182.dev](https://melee.m19182.dev), and the code is on [GitHub](https://github.com/mateo19182/melee-llm).

![A bench game redrawn from its replay file: Faynt (blue) takes a stock from Phillip (red), both playing Fox on Final Destination](/data/melee/replay-2d.webp)

*14 seconds of a bench game, redrawn from the replay file: Faynt (blue) takes a stock off Phillip (red), both playing Fox.*

If you have never played: two characters fight on a small floating stage, every hit raises the other player's damage percentage, and the higher it is the further they fly. Knock them off the screen and they lose a stock. Four stocks, eight minutes. Simple on paper, but at a high level it's about reactions measured in single frames and reading what the other person will do next.

---

## Ten years of bots, and why now

- **2001**, the built-in CPUs, levels 1 to 9. Level 9 jabs and grabs on the exact frame, but almost never shields, always recovers the same way and loses to one move repeated.
- **2015**, [SmashBot](https://www.youtube.com/watch?v=_0Z_oN_CZyA). Dan "altf4" Petro wrote a Fox bot by hand, frame-perfect and with zero reaction time. Its plumbing became libmelee, which almost every bot since is built on.
- **2017**, [Phillip](https://arxiv.org/abs/1702.06230). Vlad Firoiu trained a network with reinforcement learning alone and it beat professional players, reacting in about 2 frames where a human needs 12 to 15.
- **2018-2022**, Slippi: replay files, rollback netplay, a ranked ladder. Suddenly there were hundreds of thousands of recorded human games to learn from.
- **2024**, Phillip again, now with [slippi-ai](https://github.com/vladfi1/slippi-ai): copy humans from replays first, then improve by self-play, with a human-like reaction delay built in. Zain [beat it 5-3](https://www.youtube.com/watch?v=c8nRFAGvr2c); Moky [lost 3-10](https://www.youtube.com/watch?v=1kviVflqXc4).
- **2025**, Eric Gu's [HAL](https://ericyuegu.com/behavior-cloning-melee/) cloned pro Fox games into a 20M-parameter transformer for about $5 of compute and beat the level 9 CPU 95% of the time. [MIMIC](https://github.com/erickfm/MIMIC) followed with one model per character.

And then the last six weeks:

- Top players took on a crew of Phillips on stream, twice, and barely won both times.
- Frisson Labs released [Faynt](https://www.frisson-labs.com/faynt), one 10M-parameter model that plays all 26 characters and won 240 of 244 games against Phillip's public releases.
- A scaled-up HAL (247M parameters) [reached about 2200 Elo](https://ericyuegu.com/hillclimbing-melee/), the top 1% of the human ladder.
- [stomped.dev](https://stomped.dev) opened, a ranked ladder for bots only.
- [melee-sim-light](https://github.com/kyhavlov/melee-sim-light) runs the decompiled game without an emulator, about 100 times faster.
- Three days before the talk, Frisson released [Reyn](https://www.frisson-labs.com/reyn), a bot you steer with English commands.

So: the strongest bots can be downloaded and run on one home GPU, one of them takes language, the game can be simulated far faster than real time, cloning a decent bot costs a few dollars, and there is a public ladder to test it on. Nobody had put them all on one scale, or asked where an LLM fits among them.

None of these bots look at the screen. They read the game's memory every frame (positions, speeds, animation, damage) and answer with a whole controller state. And almost all of them share a recipe: copy humans from replays, then get better by playing themselves. It's AlphaGo minus the search, since there's no looking ahead in 16 milliseconds and no way to rewind. They are tiny next to an LLM (10M to 247M parameters) and answer in a few milliseconds per frame. Reyn, despite the language, has no LLM inside: it was trained on replays labelled with commands, and a small router maps whatever you type onto a fixed menu of about 100 of them. That detail matters later.

---

## The bench

Everything runs on my home server: the real game in Slippi's Dolphin emulator, a dozen games side by side, Python driving virtual controllers. Every game is Fox against Fox on two tournament stages. The entrants are the built-in CPUs, three small scripted bots, the five published learned bots (Phillip at several skill tiers, HAL, MIMIC, Faynt and Reyn), and LLMs.

LLMs are far too slow to press buttons every frame (a frame is 16.7 ms, a reply takes 1-3 seconds), so each setup gives them a higher-level job and lets something faster handle the frames. They read about 150 words of text describing the moment and:

1. **Play, untimed**: pick a move (`laser`, `shine`, `wavedash`, `recover`...) and the game pauses while they think. This measures only how good their choices are.
2. **Play, live**: the same at full speed, with a safe default while the model thinks. Replies older than 2 seconds are thrown away.
3. **Jev plays**: [TypeSafe's Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev), a fast decision model that answers multiple-choice questions in about 0.15 seconds.
4. **Coach Reyn**: Reyn plays every frame, and every 5 seconds the coach picks one of its commands.
5. **Write a bot**: a coding agent gets 30 minutes, a sandbox and a practice tool to write a Python bot that then plays like any other entrant.

Everything goes into one Elo fit with the level 9 CPU pinned at 1500 (400 points of difference means the stronger side wins about 10 games out of 11). Nobody picked the games by hand: a scheduler chose the next one every few seconds, favouring the games that would tighten the widest intervals for the fewest tokens. Overnight it played 1,573 games in 9 hours.

![Real-time board: every entrant's Elo with its 95% interval, coloured by kind](/data/melee/leaderboard-realtime.svg "wide")

The learned bots are far ahead. **Faynt never lost**: 390-0, most of it against Phillip gm, so its 3358 is really a floor. Then Phillip gm (2488) and HAL (2234). A fun one: CPU levels barely matter in a Fox mirror. Level 1 (1250) sits above level 5 (1194), because the CPU Fox keeps jumping off the stage by itself, and that matters more than its level.

---

## Where the LLMs landed

### Playing: speed beats smarts

![Untimed vs real-time Elo for each model, with the share of live replies thrown away for arriving too late](/data/melee/latency-tax.svg "wide")

Given time to think, GPT-6.1 Sol beats the level 9 CPU (1692) and the other models land between 1327 and 1438. Live, all of that disappears: every model drops 272 to 578 points and ends up around a level 4 CPU (1055 to 1114), level with each other and with Jev. Sol's replies take 2-3 seconds, so 95% of them arrive too late and get thrown away. Live Sol is basically my fallback behaviour with an LLM occasionally getting a word in. Even Haiku, fast enough that only 5% of its replies are dropped, is acting on a game state about 70 frames old, which in Melee is several exchanges ago.

[LLM Colosseum](https://github.com/OpenGenerativeAI/llm-colosseum) saw the same in Street Fighter (GPT-3.5 beat GPT-4 by being faster); here it is on a scale with error bars.

Screenshots don't help either: given an image instead of the text, Haiku mostly didn't notice it was hanging off the ledge. Every model read the damage numbers almost perfectly and got left/right at about chance.

### Coaching: two words win

![Reyn's rating with no command, with random commands, with each LLM and Jev as coach, and holding "Don't die." all game](/data/melee/coaching.svg "wide")

This was the surprise. Reyn with no orders rates 1746, and with any coach it jumps by about 300 points to HAL's level. But a "coach" that picks a random command every 5 seconds without looking at the game gets most of that jump (2068), and the four LLM coaches don't separate from it. So I dug in:

- Reyn mostly needs *any* command. One random command held all game already gets it to 2018.
- **Holding "Don't die." all game, with no coach at all, rates 2398**, above every LLM coach.
- Jev is the only coach clearly better than random (2346), and by accident: its favourite pick is "kill now", which Reyn's router maps every single time to... "Don't die."

The LLMs pick sensible-sounding plans (edgeguard, play aggressive) that turn out to be worth less than the boring one. The lesson is less about LLMs than about the bot, and about how a language interface can quietly turn your words into something else.

### Coding: a CPU 9 in 30 minutes

The first wave was one 30-minute Claude Code session per model, and the bots landed around the level 9 CPU, with two runs of the same model differing more than different models did. So then I ran a proper round: nine sessions, three each of Opus, Sonnet and Haiku 5.5 at medium effort, every bot playing about 28 games on a separate ladder (its own fit, again with CPU 9 = 1500).

Opus came out clearly on top this time, with a mean of 1813 and a best of 1929. Two of its bots won all 24 of their games against CPUs 7 to 9 and took games off MIMIC. Sonnet averaged 1186 and Haiku 1116, and the spread within a model is still large (Haiku's bots go from 804 to 1423). One caveat: these nine ran at once on a busy machine at medium effort, unlike the first wave, so I wouldn't compare the two directly.

---

## What else came out of it

**A website** to watch it all, dressed like Melee's own menus: the boards with a page per entrant, every game on the server drawn live in 2D, a launcher for any matchup, every replay with the AI's decisions on a timeline, and a Live page streaming the real game.

**An AI commentary booth** on that Live page. Two casters, Charlie on play-by-play ("loud, fast, loses his mind on big moments") and Laura on colour ("dry wit, teases Charlie"). A fast LLM watches the game's events and writes a line every few seconds, ElevenLabs voices them, only while someone is listening. A real exchange:

> **Charlie:** HAL MASTER's Fox is in the air and Faynt's Marth is waiting for him!
> **Laura:** Waiting is the right word. Faynt doesn't chase, Charlie, he collects.

**A simulator.** I hooked every player, learned bots included, into melee-sim-light and checked it against 300 replays: 287 matched frame for frame (the other 13 were unfinished files), about 100 times faster than the emulator. The catch is that it has no built-in CPUs.

**A bot of my own, m19182-yoshi.** A small transformer that copies human play, the way HAL did: it reads the last 4 seconds of the game and predicts the next controller input. The first version (6M parameters) lost all 12 games against the level 9 CPU; a 20M one won 1 of 12. The current one, `bc-20m-amsa`, is 20M parameters trained on aMSa's 21,896 Yoshi games from HAL's public dataset, and it won 3 of 12. Still below the hardest CPU, but getting there. It now plays on the stomped.dev bot ladder from my home server.

**Playing them yourself.** You can play any of these bots with a controller on your own machine with `play.py`; playing them over netplay from the website is next. The board has a slot waiting for human results.

---

## What I learned

- In real time, latency is the whole game. A frontier model that makes good decisions is worth nothing if they arrive two seconds (120 frames) late.
- The interesting place for an LLM is above a fast policy, not instead of it, and even there it has to be checked against the dumbest possible baseline. "Random command" and "Don't die." were the most useful controls I ran.
- The bots got strong from human replays plus self-play, not from reasoning, and they do it with tens of millions of parameters on one home GPU.
- One run per model ranks nothing. The bot-writer numbers only started meaning something with three runs each, and even those spread over hundreds of points.

## What's next

I'm giving it one or two more weeks, with LLMs no longer at the centre. A bigger run of m19182-yoshi (`bc-20m-v3`: 44,805 Yoshi games, 444M frames, with aMSa labelled "pro") is training right now, and after that comes self-play in the simulator, which is where the published bots got strong. The goal is to see how far it can climb on stomped.dev, and to learn how these bots are actually trained along the way. Also on the list: putting m19182-yoshi and myself on the bench, and getting people to play the bots.

![Me presenting the project at 1hack, in front of the slide on ten years of Melee bots](/data/melee/talk-1hack.webp)

*Presenting it at [1hack](https://1hack.eu/) on 14 November.*

---

Built on [Slippi](https://slippi.gg), [libmelee](https://github.com/vladfi1/libmelee), [Slippi Lab](https://github.com/frankborden/slippilab) and [melee-sim-light](https://github.com/kyhavlov/melee-sim-light), with the bots of vladfi1 (Phillip), Eric Gu (HAL), erickfm (MIMIC) and Frisson Labs (Faynt, Reyn), TypeSafe's Jev and ElevenLabs voices.

[^1]: highly recommend [AsumSaus](https://www.youtube.com/@AsumSaus/videos) if interested in learning more!