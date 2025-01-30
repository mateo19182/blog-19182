---
title: Mapping music's search space pt.1
date: 2025-01-27
tags: 
  - writing
  - music
---

Where I attempt to find a way to determine what is or isn't music and explore some ways of mapping it. In this first part I will try to answer the first question.

---

## So what is music really?

If we define music as generously as possible, it would be something like:

> all possible combinations of sounds.

This is equivalent to all of the combinations of the elements that make up a sound[^1]: **frequency, amplitude, duration and waveform**. Unluckily, the size of this set seems to be too much for us to handle, as each of these dimensions can extend infinitely and we can stack as many sounds as we want. To make this scenario more realistic, I’ll introduce a series of constraints that will determine a definition of "music" for the purposes of this series.

---

## Human as the Gatekeeper

The first requirement that helps us significantly reduce our search space is that a human must be involved. Music is inherently tied to human perception and cognition, sound can exist objectively, but music as a concept necessarily involves some kind of interpretation. As tempting as it might be, I don’t think it’s appropriate to force a human to be the creator of the music, as that would exclude bird songs or AI-generated music[^2]. It seems much more elegant to shift the responsibility of classification to the consumer of the music.

Using this approach, a simple way to determine whether certain air vibrations qualify as music is to **require that at least one human —who already has a preconceived idea of what music is— associates that combination of sounds with the concept of music when their brain processes it.** By doing this we are effectively tying it to human perception, which will have some complications later on, but also helps solve some philosophical problems such as: ["If a speaker is playing songs but no one is listening, is music being played?"](https://en.wikipedia.org/wiki/If_a_tree_falls_in_a_forest).

Similarly, this rule implies a series of other constraints on our parameters related to human biological limitations.

- Humans can typically hear sounds from 20Hz to 20,000Hz, though the range varies among individuals and decreases with age. [^3]
  - The Just Noticeable Difference (JND) for pitch varies a lot with frequency and the level of training of the recipient.
- The minimum detectable duration of a sound (temporal resolution) for humans is about [1.2 milliseconds for a burst with a 10-dB signal-to-noise ratio](https://pubmed.ncbi.nlm.nih.gov/7085985/)
  - The upper limit on duration is practically bounded by human lifespan, currently around 100 years.
- There also are limits on [how fast or slow](https://youtu.be/h3kqBX1j7f8) a sound can be before our brain’s interpretation of the vibrations begins to get confused, though I'm deliberately not considering rhythm into the definition as it would complicate things.
- Amplitude is surprising—human eardrums are very sensitive to pressure variations and can detect changes from a few micro pascals (μPa) to over 100 kilopascals (kPa). In decibels the range goes [from 0 to 130](https://sengpielaudio.com/calculator-soundlevel.htm)
- Waveforms are tricky, as they relate directly to timbre (the combination of frequencies in a sound). The human frequency discrimination threshold can help us here (while highly dependent on the target frequency, generally sits around 0.2% of the base frequency) but it's not a great solution.
  - Another problem is that you can stack waveforms to get new ones infinitely, but since any waveform can be decomposed into sine waves, we can probably find a limit where it won't be noticeable anymore.
  - Also we should maybe take the phase into account here (the location within a wave cycle), but it should only matter with low frequency waves as in higher ones the temporal resolution of our brain is not enough to process it.
    - This matters a lot more in stereo environments (humans can only perceive music in stereo by default), but we will simplify and only measure mono signals to avoid complexity. This is a big oversimplification but I really don't want to have to deal artifacts like [phase-cancellation](https://en.wikipedia.org/wiki/Wave_interference).
  - I don't really care about dissonance/consonance (simple frequency ratios are perceived as pleasing, while more complex ratios are usually aren't) since there are plenty of examples of dissonant music.
    - The [critical band](https://en.wikipedia.org/wiki/Critical_band) (band of frequencies within which a second tone will interfere with the perception of the first tone by [auditory masking](https://en.wikipedia.org/wiki/Auditory_masking "Auditory masking")) is relevant here, but as it is a purely psychoacoustic phenomena we will ignore it.

---

## From waves to numbers

Now that have all four elements that make up a sound (frequency, amplitude, waveform, and duration) limited in their range, we should get a much smaller search space than the original one... but there are some gotchas. Physical phenomenon are continuous signals with infinite resolution, and storing them in any format **always** implies a loss of information, this is known as analog-to-digital conversion (ADC). If we don't do this, it doesn't matter how much we limit the ranges that it will always be infinite (because of the nature of continuous signals).

ADC involves 2 main steps:

- **Sampling**, where a regular interval (sample rate) is chosen to determine how often we are measuring the signal.
- **Quantization**, where each sample is assigned a numerical value representing its amplitude. The bit depth determines the resolution of these values.

In practice we can do this process with enough resolution that no human would ever realize, and the standard seems to have settled on 24 bit depth and 48kHz. I seriously doubt that there are any persons that can reliably differentiate anything above that.

There are a lot of caveats to this ([anti-aliasing filters](https://en.wikipedia.org/wiki/Anti-aliasing_filter), ultrasonic frequencies...), mostly related to how things work in the real world compared to the theory. For example, carrying information through cables and electricity introduces a level of noise and distortion that might not be acceptable. I will ignore all problems of this kind for the purposes of this post, but they are real and interesting [^4] .

---

## Perception Is Messy

This could very well be the end of the post, but humans are notoriously tricky, and there are some problems when using them as a judge. There is a inevitable tension between objective sound and subjective interpretation (briefly addressed in the first footnote) that we can't really ignore.

The same piece of music, transmitted under exactly the same conditions at two different moments in time, doesn’t necessarily have the same effect on a human, just as you don’t interpret a song the same way before and after knowing the story behind it. In a sense, music is like the saying, "No one steps in the same river twice." Not only that, but each person has different ears, sensibilities, culture... and then there is the whole field of [psychoacoustics](https://en.wikipedia.org/wiki/Psychoacoustics) further complicates things.

The problem with this new space isn’t that the dimensions can extend infinitely, but that it has infinite dimensions (at least as long as human consciousness isn’t computable). To escape this mess, we have to completely disregard the human element (along with the texture and spatial location properties), and only take the judgement into account [^5]. This means we’re excluding pieces that use the medium as part of the music, such as ["The Disintegration Loops" by William Basinski](https://en.wikipedia.org/wiki/The_Disintegration_Loops), but I think it’s an acceptable compromise since that would be more akin to an art installation. [^6]

This way, we can return to a reasonable space to speculate about, with the added bonus of not having to use the concept of "creativity" in the definition, saving it for part 2.  Another big advantage that this definition isn't static over time, as the space will hopefully get bigger as people's judgement of what counts as music evolves.

---

## Music as Language

To recap a little, we will consider music any possible combination of sounds as they appear, if at any point a human has listened to them and interpreted them as music. While the number of different combinations of sounds that a human can perceive is technically infinite, we are not measuring human perception, only the sound itself. We have also placed a series of constraints that reduces the possible space greatly.

Given this restrictions, music acts very much like a language, but operating on a different modality from traditional ones. If we try to translate something from english to spanish some information loss will inevitably occur, but if we try to translate a piece of music to english, the loss of information will be such that it would be difficult to recognize the piece. This is a really bad analogy as its not clear whether [music has direct referentiality](https://www.jstor.org/stable/40285565),  a requisite for languages, but I think the idea comes across fine.

Music does have syntactic structure (rhythm, harmony), almost semantics (emotional resonance), and cultural dialects (genres); but the kind of ideas that it can convey with are usually very different from what we are typically transmitting with words. Communication tends to be very lossy unless there is a high level of mastery of the language. People have tried to [map some of these rules before](https://en.wikipedia.org/wiki/Generative_theory_of_tonal_music), and there's some research on whether it [serves a evolutionary purpose](https://centaur.reading.ac.uk/95527/1/Savage%20music-as-a-coevolved-system-for-social-bonding.pdf) ([I don't think so](https://link.springer.com/referenceworkentry/10.1007/978-3-319-19650-3_2851)).

---

## Conclusion

As much as I have tried to formalize it, music is still an inherently human phenomena, and a dynamic piece, for example based on [generative music](https://en.wikipedia.org/wiki/Generative_music) that is constantly evolving overtime, will break the schema. This is a consequence of trying to encapsulate it into an **object** rather than just treating as a **process**. I am really sympathetic to that idea but wouldn't work in this context

Another problem might arise if cultural differences are too big to try to encompass all of humanity, thought there are some [hints that universal patterns to music exist across cultures](https://www.science.org/doi/10.1126/science.aax0868) (there is more variation in musical behavior within societies than between societies!). This is important as it points the existence of cognitive patterns that we could use to further restrict the space, but are clearly not well understood yet. Concepts like [pentatonic scales](https://en.wikipedia.org/wiki/Pentatonic_scale) support this theory, as they were developed independently by many ancient civilizations.

Many have tried their hand at this problem before, like [Serialism](https://en.wikipedia.org/wiki/Serialism) (particularly [Milton Babbitt's](https://en.wikipedia.org/wiki/Milton_Babbitt) approach) or [David Cope's EMI](https://computerhistory.org/blog/algorithmic-music-david-cope-and-emi/). While this framework provides a useful starting point, it’s clear that music resists categorization. Perception, culture and biology are all particularly elusive subjects and I'm far from having a good understanding of any of them.

In Part 2, we’ll dive deeper different tools for exploring and mapping this vast search space, with emphasis on recent machine learning techniques and compression. Thanks for reading :)

---

[^1]:  [Sound](https://en.wikipedia.org/wiki/Sound) refers to both "a vibration that propagates as an acoustic wave" and "the reception of such waves and their perception by the brain". The first definition does not include the concepts of timbre, texture or spatial location as those are "hallucinated" by our brain.


[^2]:  One could argue that the human prompt (in the case of a txt2audio model) or even the training dataset itself (presumably curated by humans) provides enough "creative force" to justify the result as a human creation. While I doubt this, I also don’t think it will be long before we can automate all these processes. I will talk more about creativity in the next post.


[^3]:  I suppose you could make music for dogs or other animals if you want to unlock that sector of the search space. It seems they’re [more than capable](https://link.springer.com/article/10.1007/s10071-024-01875-5) of categorizing it, but we are sticking to humans for now.


[^4]: A great resource that I found while researching for this were these 2 [Dan Lavry](https://lavryengineering.com/our-company) papers: [Sampling Theory For Digital Audio](https://lavryengineering.com/pdfs/lavry-sampling-theory.pdf) and [The Optimal Sample Rate for Quality Audio](https://www.lavryengineering.com/pdfs/lavry-white-paper-the_optimal_sample_rate_for_quality_audio.pdf), where he very clearly explains how higher sampling rates do not necessarily imply better quality! I also found his style of writing really engaging.


[^5]:   The judgement will have to be discarded if the transmission to the receiver was corrupted beyond a certain threshold. We can assume that the transmission will be done by air under normal atmospheric conditions (15°C, 1 atmosphere, 50% humidity). Not only that but we would have to take away the "music" distinction to a sound if the only person that recognizes it as music dies.


[^6]:   [8D Music](https://en.wikipedia.org/wiki/8D_music) will also be excluded, which is sad, but even sadder is the reality, reduced to remixes that "spin around your head" for social media. I’m hopeful for a comeback, but it’s clearly limited by playback technology. Apple is heading in the right direction, but it’s a slow process. It was a special moment for me when I discovered that sounds aren’t just panned left and right—there are two more dimensions to explore...

---
