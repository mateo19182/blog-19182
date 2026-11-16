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
Super Smash Bros Melee came out in 2001 for the [GameCube](https://en.wikipedia.org/wiki/GameCube), and it's one of the videogames with the highest skill ceiling (and floor) that i know of, proof of that is that there is a lot of people still playing it competitively. I'm not good at all, SSB4 was the only one where I put in the hours, but I know enough to understand some of the complexity, and it's extremely impressive. [^1]

Competitive Melee players average 6 actions per second, in a super fast-paced fight with no input buffer and cool tech like Wavedashing, L-Canceling or Dash Dancing. I enjoy it much more than any other fighters as it does not rely as heavily on combos and is much more "free-form". 

![Fox wavedashing, L-cancelling and dash dancing on Final Destination, with the stick and buttons pressed on each frame](/data/melee/tech.webp)

I had seen some activity on twitter on recent advancements on AI bots taking on some top players, which seemed incredible to me, and decided to explore this during [1hack](https://1hack.eu/), an event where we get together for 24hours to build whatever is on our mind, and ended up giving a [short presentation](/data/melee/talk-1hack.webp) at the end!

Started with a vague idea of having LLMs play the game directly. Some of the best ways of measuring the performance of latest models are based on having play [games that it hasn't encountered during training](https://arcprize.org/arc-agi). Most game benchmarks are turn-based ([chess](https://maxim-saplin.github.io/llm_chess/#leaderboard), [Pokémon](https://dl.acm.org/doi/10.1145/3771095), [Slay the Spire](https://arxiv.org/abs/2610.12596)..... lots of these popping up lately). This did not work as expected but got me interested in the topic, my objective with this post is to write what I would have liked to have read when I started learning!

In case you have never played a Smash game: two characters (from the extended Nintendo universe) fight on a small floating stage, hitting your opponent raises his percentage, and the higher it is the further they get knocked. Throw them off the screen and they lose a stock.

* difficult on the low level (fast, precise) and the high level (mindgames, predicitions...)
*more melee history, wombo combo, why its so techically complex details...


## Some history

Melee itself was made in about 13 months (reaaally fast) and was the GameCube's best selling game. The game shipped with built-in CPUs, levels 1-9. They are not great and any experienced player can beat them easily, mostly because they repeat moves and strategies constantly. It wasn't until **2015**, where Dan "altf4" Petro presented, [SmashBot](https://www.youtube.com/watch?v=_0Z_oN_CZyA) (great DEFCON talk!), a Fox bot that he wrote by hand using [GOFAI](https://en.wikipedia.org/wiki/Symbolic_artificial_intelligence). His main advantage was that it acted frame-perfect and with zero reaction time, but players quickly understood it's tactics and exploited them until they were patched by hand. However, the heavy lifting of reverse engineering the game eventually became [libmelee](https://github.com/vladfi1/libmelee), which almost every bot since is built on.

### The optimal melee game

A brief intermission, in one of the questions at the end of the talk Dan shares a thought experiment on what the an optimal melee bot would play against each other. In summary, 

> Every projectile can be reflected within a two-frame window, so throwing them is pointless.
>
> The fastest move in the game is Fox's shine, which hits on its very first frame. So two perfect Foxes walk toward each other until they're exactly in range and shine on the same frame. The shines cancel, and from then on it's a deadlock.
>
> Best play for both is to jump and multishine, frame-perfectly, until the clock runs out. Then the game goes to Sudden Death, where bob-ombs fall from the sky, apparently at random.
>
> But they aren't random, melee RNG is predictable. Real optimal strategy then it's to steer the game so that when the deadlock ends eight minutes later, the generator is in a state that drops the bombs where your opponent has to choose between running into your shine or into a bomb.

Me being a fan of these kind of thought experiments, found some holes in it, and ended up creating a [solver](https://github.com/mateo19182/melee-llm/tree/main/melee_llm/solver) to find out what is actually the optimal play since we now have the decompiled source code, and in theory, Melee checks all the boxes to have an optimal value. I might be missing something so if you have any ideas please reach out to me.

Shine is indeed the superior move once you are in range, but it will loose against attacks with more range, like Fox's short hop N-air. This makes it so the optimal move is not to walk up to your opponent, but the opposite. Defence is stronger in all the situations I could think of, and there is no incentive to commit before seeing the opponent's move, since the bot can read game state memory and always react on time.

The only other frame 1 move is Jigglipuff's rest and it won't ever reach Fox under this conditions. Anything else gives Fox at least one frame to pick the right answer, and Fox always has one: shine, jab, shield or just moving away.

| First move | From how far | What the other Fox does | Result for the attacker |
| --- | --- | --- | --- |
| Laser | Any distance | Up close: runs in and hits during the laser's recovery. Far away: reflects it with shine. | −5% to −12% |
| Grab | Any distance | Short hops over it and lands a nair, or just steps away and punishes the miss | −6% to −12% |
| Dash in | 15–26 units | Jabs or nairs him as he arrives | −4% to −5% |
| Short hop in | 15–26 units | Jabs him out of it | −4% |
| Jab | 26+ units (it misses) | Punishes the recovery, or lasers | −5% to −9% |

The solver runs on the decompiled game and, across 26 characters, no first move got through a Fox reacting on the next frame. Yoshi's double-jump armour and a frame-picked Game & Watch Judge 9 beat the shine itself, but Fox still answers both on reaction. I limited myself to tournament legal moves, but [Ice Climbers' freeze glitch](https://www.ssbwiki.com/Freeze_glitch) or [Ness's yo-yo glitch](https://www.ssbwiki.com/Yo-yo_glitch) also wouldn't be able to reach him.

It would also be basically impossible for the bot to control RNG, as the opponent moves also advance the cycles. But under tournament rules, there is no sudden death, there is another single stock game which the person with the most percentage at the end of 2 minutes loses.

### Back to History

In **2017**, Vlad Firoiu published [Phillip](https://arxiv.org/abs/1702.06230), trained end to end with asynchronous RL. He trained a network per character and used a naive reward (KOs + Damage Dealt*weight) with [actor-critic](https://en.wikipedia.org/wiki/Actor-critic_algorithm) and self-play. It was able to beat some professional players, thought mostly because it could react in about 2 frames where a human needs around 12. Still was quite exploitable, as some players found that simply crouching on the ledge would cause it to eventually suicide.

The same year, [Sharma and Friedman](https://www.yash-sharma.com/files/learning-play-super%20(3).pdf) trained a recurrent DQN that had to act with a 12-frame delay, closer to a human. Vlad's own [follow-up](https://arxiv.org/abs/1810.07286) in 2018 ("At Human Speed") did the same with Phillip: plain RL collapsed under the delay, and adding a learned model that predicts the game brought it back.

In the following years [Slippi](https://slippi.gg/) got popular, allowing for replay files, rollback netplay, a ranked ladder... Accumulating hundreds of thousands of recorded human games to learn from changed the recipe: copy humans first, then improve with RL. [Project Nabla](https://web.archive.org/web/20221013224436/https://bycn.github.io/2022/08/19/project-nabla-writeup.html) (Bryan Chen, 2022) was an early example: a small recurrent network cloned from about 100k tournament replays, then PPO, playing with 2 frames of delay.

None of these bots look at the screen. They read the game's memory every frame (positions, speeds, animation and how far into it, damage) and answer with a whole controller state. [DeepMind's AlphaStar for StarCraft II](https://deepmind.google/blog/alphastar-mastering-the-real-time-strategy-game-starcraft-ii/) followed the same recipe: real time, cloned from human replays, then self-play with a penalty for drifting away from human play.

The big one is Vlad's second Phillip, [slippi-ai](https://github.com/vladfi1/slippi-ai): in the works since 2020 and playing top players in **2024**, it copied humans from ranked and pro replays first, then improved by self-play, with a human-like reaction delay built in: it sees the game 18 to 24 frames late. It's a recurrent network that picks the controller in two steps, one of 728 combinations of buttons, triggers and C-stick, then one of 85 main-stick positions. Zain [beat it 5-3](https://www.youtube.com/watch?v=c8nRFAGvr2c) and Moky [lost 3-10](https://www.youtube.com/watch?v=1kviVflqXc4).

Not too long after, in **2025**, Eric Gu released [HAL](https://ericyuegu.com/behavior-cloning-melee/) (Fox only): a 20M transformer cloned from pro Fox games for about $5 of compute, which beat the level 9 CPU 95% of the time. erickfm took the same recipe to [MIMIC](https://github.com/erickfm/MIMIC), one model of about 20M per character, with a dedicated button head so it can wavedash and a little RL on things the game can check, like L-cancel rate. Then came a [scaled-up HAL](https://ericyuegu.com/hillclimbing-melee/): 247M parameters with 256 frames of context, trained in 16 hours on one B200 on about 1.3M games (13.5 billion frames), steered by asking for a level of play or a player's style ("play like Cody"). It predicts 4 frames of inputs at a time to hide its compute time, and Gu found that a frame of reaction delay hurts twice as much as a frame of acting without new information.

Now in late 2026, Frisson Labs released [Faynt](https://www.frisson-labs.com/faynt) ([paper](https://arxiv.org/abs/2610.02144)), one 10M-parameter transformer that plays all 26 characters. It's trained in three stages: behaviour cloning on about 840,000 ranked replays, a "winner curriculum" that ends on games won by Master-ranked players (distilled from a 75M sibling), then self-play RL in Fox mirrors with 96 emulators on one GPU. It plays with zero reaction delay and won 240 of 244 games against Phillip's public releases. It was followed by [Reyn](https://www.frisson-labs.com/reyn), a bot you can steer with English commands, but with no LLM inside: Frisson labelled human replays with rule-based instructions ("this is a grab"), trained the policy to follow them, then froze it and trained small adapters with RL. A router maps whatever you type onto a fixed menu of about 100 commands, or rejects it. That detail matters later.

All of these are tiny next to an LLM (10M to 247M parameters), answer in 2 to 8 milliseconds a frame on one home GPU, and get their strength from human replays plus self-play, not from reasoning.

All this cool work is enabled by a the community (like the recently opened [stomped.dev](https://stomped.dev), a ranked ladder for bots only with a nice discord community), that has built the open tooling over time that allows for this kind of experimentation, most recently leveraging AI to complete the [decompilation](https://github.com/doldecomp/melee) of the full Melee code, that also gave us  [melee-sim-light](https://github.com/kyhavlov/melee-sim-light), which runs the decompiled game without an emulator, about 100 times faster.

### The TAS scene

Next to the bots there's also scene of tool-assisted play (TAS): a sequence built frame by frame in an emulator. Playback is deterministic, and it's mostly used to show the limits of the game.

Started in **2005** with Action Replay videos made in the game's hidden frame-by-frame debug mode. Around **2010** Dolphin got proper TAS tools (savestates, frame advance, input movies), and later Lua scripting on top, like PracticalTAS's [ssbm-lua-core](https://github.com/practicaltas/ssbm-lua-core).
- Some cool showpieces: [combos that all end at exactly 69 hits](https://www.youtube.com/watch?v=F-mUcQXeSSc), and [Target Test for all 25 characters](https://tasvideos.org/7174S) in 2:39.97 in-game time. Many findings flow back to human play.


![A bench game redrawn from its replay file: Faynt (blue) takes a stock from Phillip (red), both playing Fox on Final Destination](/data/melee/replay-2d.webp)

*14 seconds of a bench game, redrawn from the replay file: Faynt (blue) takes a stock off Phillip (red), both playing Fox.*


---

## The bench

Using Slippi's Dolphin emulator, Fox mirror on FD and Battlefield y put every bot relevant bot that i could find and a couple of my experiments. Everything goes into [one Elo fit](https://github.com/mateo19182/melee-llm/tree/main/melee_llm/bench) with the level 9 CPU pinned at 1500. Then left it overnight playing thousands of games: 4,082 rated games by the end.

LLMs are a special case since they are too slow to press buttons every frame (16.7 ms) so each setup gives them a higher-level job and lets something faster handle the frames. They read about 500 tokens of [game state](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/state.py) with a rolling context window

- **[Play, untimed](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/agents/llm_paused.py)**: pick a move and the game pauses while they think. This measures how good their choices are.
- **[Play, live](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/agents/llm_live.py)**: same but no stops.
- **[Jev plays](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/agents/jev_player.py)**: [TypeSafe's Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev), a decision model that answers multiple-choice questions in about 0.15 seconds.
- **[Coach Reyn](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/agents/coach.py)**: Reyn plays every frame, and every 5 seconds the LLM coach uses text to condition it's play style.
- **[Write a bot](https://github.com/mateo19182/melee-llm/tree/main/melee_llm/botwriter)**: a coding agent gets 30 minutes, a sandbox and a practice tool to write a Python bot that then plays like any other entrant.

![Real-time board: every entrant's Elo with its 95% interval, coloured by kind](/data/melee/leaderboard-realtime.svg "wide")

The learned bots are far ahead. Faynt never lost (370-0, so its 3403 is really a floor), then Phillip gm (2549) and HAL (2300). The CPUs rise in order, from 976 for level 1 to 1500 for level 9: a smaller gap than the 1,000 points between level 9 and Phillip gm.

---

## Where the LLMs landed

### Playing: speed beats smarts

![Untimed vs real-time Elo for each model, with the share of live replies thrown away for arriving too late](/data/melee/latency-tax.svg "wide")

Given time to think, GPT-6.1 Sol beats the level 9 CPU (1729), the other models land between 1254 and 1474, and all of them beat Jev (1082). A player that picks a random move at every decision rates 732 here, so the thinking does count.

Live, all of that disappears: every model drops 492 to 851 points and ends up **below the level 1 CPU** (762 to 878), level with each other and with Jev. Sol's replies take 2-3 seconds, so 95% of them arrive too late and get thrown away. I checked it with two controls: my fallback autopilot alone, never asking a model, rates 824, and random moves rate 700. Every live LLM is inside the autopilot's interval, so at this speed the LLM adds nothing measurable over the code it's wrapped in. Even Haiku, fast enough that only 5% of its replies are dropped, is acting on a game state about 70 frames old, which in Melee is several exchanges ago.

[LLM Colosseum](https://github.com/OpenGenerativeAI/llm-colosseum) saw the same in Street Fighter (GPT-3.5 beat GPT-4 by being faster); here it is on a scale with error bars.

Screenshots don't help either: given an image instead of the text, Haiku mostly didn't notice it was hanging off the ledge. Every model read the damage numbers almost perfectly and got left/right at about chance.

### Coaching: two words win

![Reyn's rating with no command, with random commands, with each LLM and Jev as coach, and holding "Don't die." all game](/data/melee/coaching.svg "wide")

This was the surprise. Reyn with no orders rates 1846, and with any coach it jumps by about 300 points to HAL's level. But a "coach" that picks a random command every 5 seconds without looking at the game gets most of that jump (2141). On ratings alone the LLM coaches overlap it, so I had the coaches play each other directly: 300 more games, the same bot on both sides, only the coach differing. Three of the four LLM coaches do beat random: Sonnet 5.5 won 29 of 36 against it, Haiku 4.5 28 of 37 and GPT-6 Luna 30 of 45, about 170 points above it. GPT-6.1 Sol doesn't (15 of 35); it's also the slowest, at 3 seconds a reply. So I dug in:

- Reyn mostly needs *any* command. One random command held all game already gets it to 2075.
- **Holding "Don't die." all game, with no coach at all, rates 2452**, above every LLM coach.
- Jev is the best coach (2403), and by accident: its favourite pick is "kill now", which Reyn's router maps every single time to... "Don't die."

The LLMs pick sensible-sounding plans (edgeguard, play aggressive) that turn out to be worth less than the boring one. The lesson is less about LLMs than about the bot, and about how a language interface can quietly turn your words into something else.

### Coding: a CPU 9 in 30 minutes

![Bench rating of every bot an LLM wrote in a 30-minute session, next to CPUs, MIMIC and Phillip silver](/data/melee/bot-writer.svg "wide")

27 Claude Code sessions of 30 minutes each, in three batches, all on the main board:

- **One run per model.** Sonnet's 135-line bot (shine, grab, lasers) rates 1752, Haiku 4.5's 1599, and Opus's 303 lines, the most engineered, 1527.
- **Three runs each at medium effort.** Opus was clearly ahead (1684 to 1858, all above the level 9 CPU); Sonnet (936 to 1233) and Haiku (1060 to 1444) stayed below it.
- **Five runs each at high effort, with a better starter bot.** All three came out level: Opus 1699 on average, Haiku 1686, Sonnet 1660.

That tie says more about the starter than about the models. The new starter was 60 lines that run at the opponent and up-smash, and I hadn't checked how strong it was: one Haiku session handed it in unchanged and it rates 1685, above the level 9 CPU. Opus and Sonnet mostly rewrote it, into as many as 450 lines, and on average ended where they started. Only two sessions clearly improved on it (the best reached 1944, level with MIMIC). So runs of one model differ by hundreds of points, and 60 lines of the right idea beat most of what 30 minutes of a strong model adds.

---

## What else came out of it

**A [website](https://github.com/mateo19182/melee-llm/tree/main/melee_llm/web)** to watch it all, dressed like Melee's own menus: the boards with a page per entrant, every game on the server drawn live in 2D, a launcher for any matchup, every replay with the AI's decisions on a timeline, and a Live page streaming the real game.

**An [AI commentary booth](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/commentary.py)** on that Live page. Two casters, Charlie on play-by-play ("loud, fast, loses his mind on big moments") and Laura on colour ("dry wit, teases Charlie"). A fast LLM watches the game's events and writes a line every few seconds, ElevenLabs voices them, only while someone is listening. A real exchange:

> **Charlie:** HAL MASTER's Fox is in the air and Faynt's Marth is waiting for him!
> **Laura:** Waiting is the right word. Faynt doesn't chase, Charlie, he collects.

**A [simulator](https://github.com/mateo19182/melee-llm/tree/main/melee_llm/sim).** I hooked every player, learned bots included, into melee-sim-light and checked it against 300 replays: 287 matched frame for frame (the other 13 were unfinished files), about 100 times faster than the emulator. The catch is that it has no built-in CPUs.

**A bot of my own, [m19182-yoshi](https://github.com/mateo19182/melee-llm/tree/main/train/meleebot).** A small transformer that copies human play, the way HAL did: it reads the last 4 seconds of the game and predicts the next controller input. The first version (6M parameters) lost all 12 games against the level 9 CPU; a 20M one won 1 of 12. What made the difference was data: the current best, `bc-20m-ft`, is first pretrained on 1.4 billion frames of Pro and Master games with every character, then fine-tuned on Yoshi with 2 to 4 frames of delay, like online play. It won 5 of 6 against the level 9 CPU and its first games off MIMIC's Marth (2 of 6) and HAL's Yoshi (1 of 6), but it still loses every game to Phillip, HAL's Fox and Faynt. Then I tried the second half of the recipe, [self-play RL](https://github.com/mateo19182/melee-llm/tree/main/train/meleebot/rl) in the simulator. It beat its teacher about 80% of the time there by iteration 100, then collapsed, and those snapshots played worse than `bc-20m-ft` in the real game. Lesson learned: the simulator is great for speed, but a checkpoint only counts once it wins in Dolphin.

**Playing them yourself.** You can play any of these bots with a controller on your own machine with [`play.py`](https://github.com/mateo19182/melee-llm/blob/main/play.py); playing them over netplay from the website is next. The board has a slot waiting for human results.

---

## What I learned

- In real time, latency is the whole game. A frontier model that makes good decisions is worth nothing if they arrive two seconds (120 frames) late.
- The interesting place for an LLM is above a fast policy, not instead of it, and even there it has to be checked against the dumbest possible baseline. "Random command" and "Don't die." were the most useful controls I ran.
- The bots got strong from human replays plus self-play, not from reasoning, and they do it with tens of millions of parameters on one home GPU.
- One run per model ranks nothing. Runs of the same model spread over hundreds of points, and the starter bot mattered more than the model.

## What's next

I'm giving it one or two more weeks, with LLMs no longer at the centre. For m19182-yoshi the goal is now the best Yoshi I can make by following the published recipes more closely: I've only used about 10% of HAL's dataset so far, and self-play needs a better learning signal before it helps. The other thing I want to try is TAS-style search in the simulator: it already [saves and restores](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/sim/world.py) whole games at about 100 times Dolphin's speed, which is the setup Mario 64's brute-forcers use, and the [solver](https://github.com/mateo19182/melee-llm/tree/main/melee_llm/solver) above already runs on it. That could answer questions like "can anything survive this edgeguard?" or label the best move from real replay positions to train the bot on. The catches are that the simulator only does versus matches and its RNG differs from Dolphin's. Also on the list: putting m19182-yoshi and myself on the bench, and getting people to play the bots.



The project site, with the boards, replays, live games and a longer [write-up](https://melee.m19182.dev/writeup/), is at [melee.m19182.dev](https://melee.m19182.dev), and the code is on [GitHub](https://github.com/mateo19182/melee-llm).

---

Built on [Slippi](https://slippi.gg), [libmelee](https://github.com/vladfi1/libmelee), [Slippi Lab](https://github.com/frankborden/slippilab) and [melee-sim-light](https://github.com/kyhavlov/melee-sim-light), with the bots of vladfi1 (Phillip), Eric Gu (HAL), erickfm (MIMIC) and Frisson Labs (Faynt, Reyn), TypeSafe's Jev and ElevenLabs voices.

[^1]: highly recommend [AsumSaus](https://www.youtube.com/@AsumSaus/videos) and [PracticalTAS](https://youtube.com/@practicaltas?si=rUSebEZkc0eIUzv8) if interested in learning more!