---
title: Melee bots are getting really good
summary: "Putting ten years of Super Smash Bros. Melee bots, and a few LLMs, on one Elo scale, plus a bot of my own and a brute-force search for what two perfect Foxes would do."
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
Super Smash Bros Melee came out in 2001 for the [GameCube](https://en.wikipedia.org/wiki/GameCube), and it's one of the videogames with the highest skill ceiling (and floor) that I know of, proof of that is that there is a lot of people still playing it professionally. I'm not good at all, SSB4 was the only one where I put in the hours, but I know enough to understand the complexity, and it's extremely impressive. [^1]

Its difficulty can be divided in 2 levels. On the low level, the game runs at 60 fps and many techniques only have a 1-2 frame window to perform correctly (no input buffer!). Competitive Melee players average 6 actions per second, and have to master tech like Wavedashing, L-Canceling or Dash Dancing. Some of these techniques were not intended by the developers, which to me makes it even more interesting.

On a high level it's more of a mindgame. Humans react in about 12 frames and many attacks are faster than that, so most of the time you are predicting your opponent, not reacting. Good players spend whole games conditioning the other one to expect something. I enjoy watching it much more than any other fighter as it does not rely as heavily on combos and is much more "free-form". 

![Fox wavedashing, L-cancelling and dash dancing on Final Destination, with the stick and buttons pressed on each frame](/data/melee/tech.webp)

I had seen some activity on twitter on recent advancements on AI bots taking on some top players, which seemed incredible to me, and decided to explore this during [1hack](https://1hack.eu/), an event where we get together for 24 hours to build whatever is on our mind, and ended up giving a [short presentation](/data/melee/talk-1hack.webp) at the end!

Started with a vague idea of having LLMs play the game directly. Some of the best ways of measuring the performance of latest models are based on having them play [games that are out of the training distribution](https://arcprize.org/arc-agi). Most game benchmarks are turn-based ([chess](https://maxim-saplin.github.io/llm_chess/#leaderboard), [Pokémon](https://dl.acm.org/doi/10.1145/3771095), [Slay the Spire](https://arxiv.org/abs/2610.12596)... lots of these popping up lately). This did not work as expected but got me interested in the topic, my objective with this post is to write what I would have liked to have read when I started learning.

I think its an extremely exciting moment to get into this, with a lot of work to do and low-hanging fruit to get started!


## Some history

Melee itself was made in about 13 months (reaaally fast) and was the GameCube's best selling game. The game shipped with built-in CPUs, levels 1-9. They are not great and any experienced player can beat them easily, mostly because they repeat moves and strategies constantly. It wasn't until 2015, where Dan "altf4" Petro presented, [SmashBot](https://www.youtube.com/watch?v=_0Z_oN_CZyA) (great DEFCON talk!), a Fox bot that he wrote by hand using [GOFAI](https://en.wikipedia.org/wiki/Symbolic_artificial_intelligence). His main advantage was that it acted frame-perfect and with zero reaction time, but players quickly understood its tactics and exploited them until they were patched by hand. However, the heavy lifting of reverse engineering the game eventually became [libmelee](https://github.com/vladfi1/libmelee), which almost every bot since is built on.

### The optimal melee game

A brief intermission to talk about a thought experiment Dan [shares at the end of his talk](https://youtu.be/_0Z_oN_CZyA?t=2207): what would two perfect bots play against each other? I went deep into the rabbithole on this one!

<details markdown="1">
<summary>Two perfect Foxes: brute-forcing the deadlock</summary>

Paraphrasing, his answer was:

> Every projectile can be reflected within a two-frame window, so throwing them is pointless.
>
> The fastest move in the game is Fox's shine, which hits on its very first frame. So two perfect Foxes walk toward each other until they're exactly in range and shine on the same frame. The shines cancel[^2], and from then on it's a deadlock.
>
> Best play for both is to jump and multishine, frame-perfectly, until the clock runs out. Then the game goes to Sudden Death, where bob-ombs fall from the sky, apparently at random.
>
> But they aren't random, melee RNG is predictable[^3]. The real optimal strategy then is to steer the game so that when the deadlock ends eight minutes later, the generator is in a state that drops the bombs where your opponent has to choose between running into your shine or into a bomb.

Me being a fan of these kind of thought experiments, poked some holes at it, and since we now have the decompiled source code I ended up trying to brute force the answer. That turned into [melee-brute](https://github.com/mateo19182/melee-brute), a fork I made of [melee-sim-light](https://github.com/kyhavlov/melee-sim-light) that can explore the search space much faster than any traditional emulator. It's honestly just a bunch of clever Fable tricks optimising for this use case but I think it can be pretty useful for other stuff!

The deadlock seems to be real, but not for that reason. Walking in and shining isn't actually the best play. Its reach is tiny (10 units), and Fox's jab hits from 21, so the other one just jabs you on the way in.

I then thought that maybe some other character can hit Fox in a way he can't react to (he can read the game memory, so he sees every move on the frame it starts). So I tried every character's moves against a Fox answering on the next frame, from a gap of 12 to 40[^4] and nothing got through. He punishes or blocks all of it, mostly with shine or a jab.

The shine's first frame does most of the work. Fox is intangible on it, and on the ground its hitbox clanks with the attacker's, so even a frame-2 jab from up close loses to it. It's also the only move in the game that hits before anyone can react, so nobody can stand in that small circle around Fox. Falco has the same shine, but it reaches 8 instead of 10.

![Two Foxes 7 units apart shine on the same frame: the hitboxes clank, both freeze for 4 frames and nobody takes damage](/data/melee/fox-clank.webp "wide")

So if anyone wins, it's a Fox, and the real question is the Fox ditto.

One thing doesn't need any search: a match on Final Destination starts as a mirror image, so whatever plan one Fox has, the other can play it mirrored. Neither Fox can be ahead from the start.

Either both can stand there safely forever (Petro's deadlock), or both are forced into guesses that happen to balance out.

So far I assumed one Fox moves and the other reacts. But when both have to pick on the same frame, a Fox who just stands there can be forced to guess: walk in, stop at 13.2 and flick the stick away. Now blue has to pick between shining, stepping away or waiting, a rock-paper-scissors where each side lands the first hit 12.5% of the time.

![The attacking Fox (red) walks in for 182 frames and flicks his stick away just outside shine range. Shown twice with the same red input: blue turns to leave and is hit, blue stands still and is not](/data/melee/fox-flick.webp "wide")

*Red walks in for 3 seconds and flicks away at 13.2 units. Same input from red twice: first blue tries to leave and eats the shine, then blue stands still and nothing happens. Blue has to pick without seeing which one it is.*

There are two ways out of it. If he never wants to guess, he steps back at 13.7, the one input that is safe even if the attacker sees it coming, and the flick never happens:

![The same walk, but blue dashes back at 13.7 units before red can flick. Nobody is hit](/data/melee/fox-retreat.webp "wide")

Or he accepts the guess: in the fair game, walking in at that distance is worth exactly 0 to the attacker, and the best play for both is to wait. If there was any way we can force the defender to hold shield, or attacker can reach him from above ground, attacker can get the advantage, but there's just no way to force a standing Fox to do that.

The attacker could try to keep walking in until there's no stage left. That's the idea of the squeeze: if every walk-in to 13.7 makes a Fox who never guesses give a bit of ground, sooner or later the stage ends at the ledge.

With the defender's back to the ledge and both in shine range it's still a guessing game, but no longer an even one. Played 100 times, looking 8 frames ahead (about 16 million game states), the attacker lands the first hit or the defender slides off the stage ≈ 34 times, the defender lands it ≈ 8, and ≈ 58 times nobody is hit.

![Blue, with his back to the ledge, shines red's shield. The pushback slides blue off the stage while he is still holding the shine](/data/melee/fox-ledge.webp "wide")

The squeeze only works on a Fox who refuses to ever guess, and a perfect one doesn't have to. In the middle of the stage the guess the attacker offers is worth the same to both, so he can just take it there instead of backing into a bad ledge. 

So, as far as I can search, it is a stalemate: nobody can attack first, the ditto is even, and the guesses a Fox can be forced into are even too, except at a ledge nobody can push you to. That's not very far though: each search looks 8 frames ahead, the menu has no lasers, wavedashes or dash dancing, and most positions are placed by hand. The rest of the experiments are on the [Brute page](https://melee.m19182.dev/brute), and I might be missing something, so if you have any ideas please reach out to me!

</details>

### Back to History

In 2017, Vlad Firoiu published [Phillip](https://arxiv.org/abs/1702.06230), trained end to end with asynchronous RL. He trained a network per character and used a naive reward (KOs + Damage Dealt*weight) with [actor-critic](https://en.wikipedia.org/wiki/Actor-critic_algorithm) and self-play. It was able to beat some professional players, though mostly because it could react in about 2 frames where a human needs around 12. Still was quite exploitable, as some players found that simply crouching on the ledge would cause it to eventually suicide.

The same year, [Sharma and Friedman](https://www.yash-sharma.com/files/learning-play-super%20(3).pdf) trained a recurrent DQN that had to act with a 12-frame delay, closer to a human. Vlad's own [follow-up](https://arxiv.org/abs/1810.07286) in 2018 ("At Human Speed") did the same with Phillip: plain RL collapsed under the delay, and adding a learned model that predicts the game brought it back.

In the following years [Slippi](https://slippi.gg/) got popular, allowing for replay files, rollback netplay, a ranked ladder... Accumulating hundreds of thousands of recorded human games to learn from changed the recipe: copy humans first, then improve with RL. [Project Nabla](https://web.archive.org/web/20221013224436/https://bycn.github.io/2022/08/19/project-nabla-writeup.html) (Bryan Chen, 2022) was an early example: a small recurrent network cloned from about 100k tournament replays, then PPO, playing with 2 frames of delay.

None of these bots look at the screen. They read the game's memory every frame (positions, speeds, animation and how far into it, damage) and answer with a whole controller state. [DeepMind's AlphaStar for StarCraft II](https://deepmind.google/blog/alphastar-mastering-the-real-time-strategy-game-starcraft-ii/) followed the same recipe: real time, cloned from human replays, then self-play with a penalty for drifting away from human play.

The big one is Vlad's second Phillip, [slippi-ai](https://github.com/vladfi1/slippi-ai): in the works since 2020 and playing top players in 2024, it copied humans from ranked and pro replays first, then improved by self-play, with a human-like reaction delay built in: it sees the game 18 to 24 frames late. It's a recurrent network that picks the controller in two steps, one of 728 combinations of buttons, triggers and C-stick, then one of 85 main-stick positions. Zain [beat it 5-3](https://www.youtube.com/watch?v=c8nRFAGvr2c) and Moky [lost 3-10](https://www.youtube.com/watch?v=1kviVflqXc4).

Not too long after, in 2025, Eric Gu released [HAL](https://ericyuegu.com/behavior-cloning-melee/) (Fox only): a 20M transformer cloned from pro Fox games for about $5 of compute, which beat the level 9 CPU 95% of the time. erickfm took the same recipe to [MIMIC](https://github.com/erickfm/MIMIC), one model of about 20M per character, with a dedicated button head so it can wavedash and a little RL on things like L-cancel rate. Then came a [scaled-up HAL](https://ericyuegu.com/hillclimbing-melee/): 247M parameters with 256 frames of context, steered by asking for a level of play or a player's style. It predicts 4 frames of inputs at a time to hide its compute time, and Gu found that a frame of reaction delay hurts twice as much as a frame of acting without new information.

Now in late 2026, Frisson Labs released [Faynt](https://www.frisson-labs.com/faynt) ([paper](https://arxiv.org/abs/2610.02144)), one 10M-parameter transformer that plays all 26 characters. It's trained in three stages: behaviour cloning on about 840,000 ranked replays, a "winner curriculum" that ends on games won by Master-ranked players (distilled from a 75M sibling), then self-play RL in Fox mirrors with 96 emulators on one GPU. It plays with zero reaction delay and won 240 of 244 games against Phillip's public releases. It was followed by [Reyn](https://www.frisson-labs.com/reyn), a bot you can steer with English commands, but with no LLM inside: Frisson labelled human replays with rule-based instructions ("this is a grab"), trained the policy to follow them, then froze it and trained small adapters with RL. A router maps whatever you type onto a fixed menu of about 100 commands, or rejects it. That detail matters later.

![A bench game redrawn from its replay file: Faynt (blue) takes a stock from Phillip (red), both playing Fox on Final Destination](/data/melee/replay-2d.webp)

*14 seconds of a bench game, redrawn from the replay file: Faynt (blue) takes a stock off Phillip (red), both playing Fox.*

All of these are tiny next to an LLM (10M to 247M parameters), answer in 2 to 8 milliseconds a frame on one home GPU, and get their strength from human replays plus self-play, not from reasoning.

All this cool work is enabled by the community (like the recently opened [stomped.dev](https://stomped.dev), a ranked ladder for bots only with a nice discord community), that has built the open tooling over time that allows for this kind of experimentation, most recently leveraging AI to complete the [decompilation](https://github.com/doldecomp/melee) of the full Melee code, that also gave us [melee-sim-light](https://github.com/kyhavlov/melee-sim-light), which runs the decompiled game without an emulator, about 100 times faster than headless Dolphin.

### TAS

Next to the bots there's also a scene of tool-assisted play (TAS): a sequence built frame by frame in an emulator. Playback is deterministic, and it's mostly used to show the limits of the game. I feel like my fork might be useful here, but never got into it so I'm not sure. 

Started in 2005 with [Action Replay](https://www.supercheats.com/gamecube/supersmashbrosmeleeactionreplaycodes.htm) videos made in the game's hidden frame-by-frame debug mode. Around 2010 Dolphin got proper TAS tools (savestates, frame advance, input movies), and later Lua scripting on top, like PracticalTAS's [ssbm-lua-core](https://github.com/practicaltas/ssbm-lua-core). Some cool showpieces: [combos that all end at exactly 69 hits](https://www.youtube.com/watch?v=F-mUcQXeSSc), and [Target Test for all 25 characters](https://tasvideos.org/7174S) in 2:39.97 in-game time. Many findings flow back to human play.


## Benchmark

Using Slippi's Dolphin emulator, Fox mirror on FD and Battlefield, I put every relevant bot that I could find and a couple of my experiments. Everything goes into [one Elo fit](https://github.com/mateo19182/melee-llm/tree/main/melee_llm/bench) with the level 9 CPU pinned at 1500. Then left it overnight playing thousands of games: 4,082 rated games by the end.

LLMs are a special case since they are too slow to press buttons every frame (16.7 ms) so each setup gives them a higher-level job and lets something faster handle the frames. They read about 500 tokens of [game state](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/state.py) with a rolling context window.

- [Play, untimed](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/agents/llm_paused.py): pick a move and the game pauses while they think. This measures how good their choices are.
- [Play, live](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/agents/llm_live.py): same but no stops.
- [Jev plays](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/agents/jev_player.py): [TypeSafe's Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev), a decision model that answers multiple-choice questions in about 0.15 seconds.
- [Coach Reyn](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/agents/coach.py): Reyn plays every frame, and every 5 seconds the LLM coach uses text to condition its play style.
- [Write a bot](https://github.com/mateo19182/melee-llm/tree/main/melee_llm/botwriter): a coding agent gets 30 minutes, a sandbox and a practice tool to write a Python bot that then plays like any other entrant.

![Real-time board: learned bots, coaches, the best bot each model wrote at high effort, CPUs and LLMs playing live, each with its 95% interval, coloured by kind](/data/melee/leaderboard-realtime-light.svg "wide")

The learned bots are far ahead. Faynt never lost (370-0, so its 3403 is really a floor), then Phillip gm (2549) and HAL (2300). The CPUs rise in order, from 976 for level 1 to 1500 for level 9: a smaller gap than the 1,000 points between level 9 and Phillip gm.

### LLMs

#### Playing

![Untimed vs real-time Elo for each model, with the share of live replies thrown away for arriving too late](/data/melee/latency-tax-light.svg "wide")

Given time to think, GPT-6.1 Sol beats the level 9 CPU (1729), the other models land between 1254 and 1474, and all of them beat Jev (1082). A player that picks a random move at every decision rates 732 here, so the thinking does count.
Live, all of that disappears: every model drops 492 to 851 points, below the level 1 CPU (762 to 878).

Screenshots don't help either: given an image instead of the text, models performed generally worse. [LLM Colosseum](https://github.com/OpenGenerativeAI/llm-colosseum) had a similar finding in Street Fighter (GPT-3.5 beat GPT-4 by being faster). 


#### Coaching

![Reyn's rating with no coach, with a random coach, with each LLM and Jev as coach, and holding "Don't die." all game](/data/melee/coaching-light.svg "wide")

Reyn on its own rates 1846. With an LLM picking one of its ~100 commands every 5 seconds, it climbs to about 2300, HAL's level. But most of that isn't the LLM: a coach picking commands at random gets to 2141, and Reyn holding "Don't die." all game, with no coach at all, gets to 2452, above every LLM. Jev is the best coach (2403) by accident: its favourite pick, "kill now", gets mapped by Reyn's router to... "Don't die."

So the LLMs do help a bit (head to head, three of the four beat the random coach, by about 170 Elo), but Reyn gains more from being told anything, and most from being told to play safe, than from clever plans. A language interface can quietly turn your words into something else.

#### Coding

I gave Claude Code 30 minutes, a sandbox and a practice tool to write a Python bot, starting from a 60-line bot that runs at the opponent and up-smashes. That starter alone, it turns out, already rates 1685, above the level 9 CPU. Five sessions each for Opus, Sonnet and Haiku:

![Bots written by Opus, Haiku and Sonnet in 30-minute sessions: five each, with each model's average, next to the level 9 CPU, the starter bot and MIMIC](/data/melee/bot-writer-light.svg "wide")

All three end up level with the starter: Opus 1699 on average, Haiku 1686, Sonnet 1660. Sessions of the same model differ by hundreds of points, and only two clearly improved on it (the best, 1944, is level with MIMIC). So 60 lines of the right idea beat most of what 30 minutes of a strong model adds.

## Training my own bot

After finding an intersection of my hobbies such as Melee and training neural networks, it's only natural to train my own AI bots. These were my first steps, I'm just getting into the community and understanding the state of the art, so might make an update later!

Started by training my own small transformer on human Yoshi replays, the way HAL does. The best one beat the level 9 CPU, but lost every game to the serious bots, and self-play RL in the simulator made it worse in the real game. To check my pipeline I retrained HAL's 20M Fox with it: it won 2 of 24 against the CPU where HAL's wins 95%. So I stopped and used HAL directly: its 247M model, asked to play like aMSa, is a better Yoshi than anything I trained, with no training at all.

Tried making some primitives for specific Yoshi tech and labelling it in training data, but it didn't seem to be useful.

Delay seems like one of the biggest problems to solve. On stomped the bot sees the game 10 frames late, which costs it 200 to 300 Elo. It still double-jump cancels and L-cancels like aMSa, but parries against Fox, which have to land in Yoshi's 6-frame shield start-up, go from 0.17 a minute to almost none (0.02). Re-weighting HAL's training for delay didn't help.

Right now I'm switching the base to Faynt's 10M model, which plays Yoshi better than HAL out of the box, and setting up RL against Phillip's anti-Yoshi bots inside melee-sim-light, about 60 times faster than Dolphin. More on that in a future update!

## What else came out of it

A [website](https://github.com/mateo19182/melee-llm/tree/main/melee_llm/web) where I recorded my investigations and experiments, with every game being played live in 2D and my model training runs live, among other stuff.

An [AI commentary booth](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/commentary.py) with two casters. A fast LLM watches the game's events and ElevenLabs voices them.

I'm also looking for interesting things to do with [melee-brute](https://github.com/mateo19182/melee-brute). At its current speeds, it can only reach a conclusion under very restrictive situations, but for questions like "was there any possible way of surviving this specific edgeguard?" it can work.

Also thinking of enabling a way to play my bots live via netplay if there's interest. Talk to me!

[^1]: highly recommend [AsumSaus](https://www.youtube.com/@AsumSaus/videos) and [PracticalTAS](https://youtube.com/@practicaltas) if interested in learning more!

[^2]: If both do shine on the same frame on the ground, they don't cancel into a multishine war, the hitboxes clank and both freeze for 4 frames.

[^3]: It would be practically impossible for the bot to control RNG, as the opponent's moves also advance it. Also under tournament rules there is no Sudden Death: a timeout goes to whoever has less percent, and a tie on percent is replayed as a single stock game of 2 or 3 minutes, which would deadlock the same way.

[^4]: Since that's how close any character can get to him under the best of circumstances.