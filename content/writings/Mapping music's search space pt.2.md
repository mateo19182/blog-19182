---
title: Mapping music's search space pt.2
date: 2025-03-31
tags: 
  - writing
  - music
---

In part [[Mapping music's search space pt.1]] I tried my best to formalize a definition of "music". In this second installment we will focus on the best way of representing this space, making it easier for humans to interpret and dissecting some of the tools we can use to do it.

---

To recap, "music" can be defined as:

> Any combination of sounds that at least a person recognizes as music, based on their prior understanding and experience of what music is.

By taking into account the biological constraints of humans and finding a digital representation with minimal compromises, the space is greatly reduced. To be fair, this was not a requisite to being able to map them adequately but it was a fun thought experiment that helps to wrap our head around some concepts.

Honestly I felt kinda stupid after re-reading the part one of this post, as I realized that in talking about music I was really thinking about art, in this particular case applied to sound waves. So I guess this is my theory on what art is as well.

We now want to find a good way of mapping any sound. This means that when we take a new sound and place it on our map, it should be close to sounds that are similar and far from different ones.

 What makes a sound related to other can be measured in many ways, but some make more sense that others. Comparing every sampled point of a sound to the other is a flawed approach, not only would it be extremely computationally expensive, but results would be very bad since that's not how our brain works.

Here we will try to solve this the other way around, by first mapping sounds according to some set of [features](https://en.wikipedia.org/wiki/Feature_(machine_learning)) and then defining genres as the different clusters of points that pop up. If we do this well, the genres we find in our data and those in the real world should match closely. This mean no more human in the loop as before, which has a bunch of advantages.

Machine learning is a natural candidate, as what models do is just compression of the information presented to them in the training set, and good compression implies being able to find the most relevant features. We shouldn't underestimate it thought, as depending how you define intelligence it [could just be fancy compression](https://arxiv.org/abs/2404.09937)[^1].

The problem then it's divided in 2 parts:

- first we should find the features that best represent music (as humans understand it)
- then transform those into a human-readable visualization

 To introduce this process, I’ll use the publication [Audio Atlas: Visualizing and Exploring Audio Datasets](https://arxiv.org/html/2412.00591v1) as an example, as it does many of the things we are interested in, but there are many other relevant papers linked later.

---

## Features

As discussed before, using the sampled points in a sound as features won't work at all, so finding the correct features it's where the meat of the work is. [Deep learning](https://en.wikipedia.org/wiki/Deep_learning) it's the branch of ML that can learn what features to choose in order to minimize a loss function. Choosing features by hand it's possible, but over some level of complexity, the associations that a human can find are limited, so we should be taking advantage of this as much as possible.

Problem is, audio is a difficult kind of data to work with - if you look at it from a computer's perspective. Raw audio waveforms are high-dimensional (44,100 numerical values per second)   and unlike images, where spatial patterns (edges, textures) can be analyzed, audio requires parsing time-dependent relationships: each sample represents instantaneous air pressure, without any inherent structure.
  
  Even using Fourier transforms, which decompose audio signals into frequency bands, fail to isolate many perceptual features. A spectrogram’s still lacks representation for many of the features humans use to recognize sound. Traditional machine learning approaches using handcrafted spectral features (MFCCs, chroma... [^2] ) approximate this but are brittle and too resource intensive to be useful.

  [Vector embeddings](https://www.cloudflare.com/learning/ai/what-are-embeddings/) solve this by representing data as dense, lower-dimensional vectors that capture relationships and characteristics. Unlike raw data (e.g., audio waveforms), embeddings distill meaningful patterns—such as timbre, rhythm, or context—into a compressed numerical form. Similar items cluster closer together in this vector space, enabling efficient comparison and generalization.

In the Atlas example, they generate semantic embeddings using [CLAP](https://github.com/LAION-AI/CLAP) (Contrastive Language-Audio Pretraining). This model learns to associate audio with textual descriptions by training on pairs of audio clips and their corresponding text labels, learning to map both into a shared embedding space where semantically related audio-text pairs (e.g., "thunderstorm" and a rain sound) are close together. This allows for semantic search and classification of audio.

In essence, CLAP performs **semantic compression** of audio, encoding its meaning into a vector while discarding irrelevant details. However, this compression is very lossy—it prioritizes features aligned with textual semantics and it's unlikely you'll be able to reconstruct the original audio from the embedding as it discards too much signal.

Still, having a **common latent space** is critical because it bridges modalities: audio and text become directly comparable through their embeddings. This space acts as a translation layer, where relationships between sounds and human concepts is visible, and while imperfect, this latent structure provides a foundation for building audio systems that "understand" context, generalize to unseen data, and interact naturally with human language.

The main issue with this implementation is that most sounds will be far out from the distribution of text-audio pairs it was trained on. While it has been seen on many noises that aren’t strictly music (the image below shows the ESC-50 dataset of ambient sounds represented by Audio Atlas), most sounds don't have a natural language equivalent to reference.

![ESC-50-white.png](https://i.imgur.com/N9AmhKW.png)

I should mention that, while tools like CLAP are useful for explaining, they are not that good at audio compression and making it understandable for a ML model. Audio models like Stable Audio or AudioGen use  [Variational autoencoders](https://en.wikipedia.org/wiki/Variational_autoencoder) that are able to encode and decode signals with high accuracy.

---

## Visualization

Embeddings tend to form clusters, where instances with similar characteristics are grouped together. These points can be projected into two dimensions using some algorithm like  [t-SNE](https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding)  (t-Distributed Stochastic Neighbor Embedding). This is a dimensionality reduction technique that  works by preserving the local structure of the data, meaning that points close to each other in the high-dimensional space remain close in the low-dimensional projection, while points far apart are pushed away. [Here you can see an example of this kind of proyection](https://projector.tensorflow.org/)

One limitation of projecting these embeddings into just 2 dimensions is that an artist can explore almost infinitely without necessarily changing their position on the map. I believe that most musicians play a lot with this dynamic, and while they have virtuosity and a really deep understanding of a particular set of rules (that define a cluster), they don't really move on the map. They might be making incredible stuff in one particular dimension, but that doesn't mean is a change that will set you apart from the rest.

![audio_atlas_fma.png](https://i.imgur.com/QSgFGCP.png)

---

The exploration described above is many things—requires the study and mastery of a language that doesn't have words—but in my opinion, it’s not really creativity.

For me, creativity is the ability to explore this space of possibilities, and the farther you can get from any other cluster, the more creativity you’re exercising.

The main argument driving this post is that the influence tool creators have on this process is disproportionate and largely ignored by the public. It’s so disproportionate that I wouldn’t be surprised if over 90% of the space explored today is a direct consequence of the creation of certain tools, rather than being discovered by the nominally credited musicians.

It’s no surprise, then, that a prerequisite for exercising even a minimal level of creativity is some degree of mastery over the musical tool. By decoupling the category of music from the creator’s intention, we’re forced to accept the sound of someone randomly hitting a drum kit without any idea of what they’re doing as music. However, anyone can randomly hit a drum kit—that’s a well-trodden space. You need a higher level of mastery to [escape the sector of what a drum kit usually sounds like](https://youtu.be/vgzSP05q0as).

---

To begin with, the tool itself determines the range of sounds you can produce. This is a relatively solved problem in the digital age, yet the variety of music doesn’t seem to be proportional to the level of control granted to us with the creation of MIDI and digital synthesizers.

This is because, on a grand scale, humans aren’t as creative as we think. The list of human cognitive biases is [long and ambiguous](https://en.wikipedia.org/wiki/List_of_cognitive_biases), but highly effective at subconsciously limiting us. For example, the influence of default values on various parameters is enormous and well-documented, as in the case of tempo in FL Studio:

> While Ableton Live and Logic Pro’s default bpm is 120, FL Studio originally opted for a rapid 140bpm, something that immediately resulted in a different approach to the four-four nature of other genres. “Grime’s instantly recognizable ‘magic number’ of 140bpm finds its origins here too,” said [PSNEurope in 2018](https://www.psneurope.com/business/uk-music-producer-grime). “‘Godfather of Grime’ Wiley has said this standard tempo in the programme meant he created most of his earliest tracks at 140bpm, and as one of the genre’s first success stories, other producers followed his lead.” Early grime pioneer Dexplicit agrees. “I got so accustomed to the default tempo that everything I made in my earlier days was 140bpm. Whether it was garage, grime or bassline, it was almost exclusively at that tempo for this reason.”  
> from [How FL Studio changed electronic music forever](https://djmag.com/longreads/how-fl-studio-changed-electronic-music-forever)

Beyond that, the presets included in a synthesizer or effects unit will determine 99% of the sounds used by the end user, despite the infinite number of adjustable parameters. This isn’t inherently bad—if I had to manually define every parameter of every sound, no one would make music—but it’s the choice of the tools to make these accessible to the public and how.

---

Well, it turns out this is the long way of announcing that I plan to start a series of posts highlighting different tools that unlocked new spaces and possibly aren’t recognized as they deserve. Will be published in spanish in a music blog I have with some friends, [no-cosign](https://no-cosign.m19182.dev), might translate to english later on.

Coincidentally, I started working at [Audialab](https://audialab.com) recently, and much of our [mission](https://audialab.com/audio-diffusion/) goes along these lines, we want to create the tools that allow artists to keep exploring the territory and writing the maps.

---


Interesting links I did not know where to place:

- [Music Exploration - Playground](https://music-explore.upf.edu/)
- [GitHub - facebookresearch/encodec: deep learning based audio codec](https://github.com/facebookresearch/encodec)
- [On word embeddings - Part 3: The secret ingredients of word2vec](https://www.ruder.io/secret-word2vec/)
- [\[2412.20292\] An analytic theory of creativity in convolutional diffusion models](https://arxiv.org/abs/2412.20292)
  - creativity is just a combinatorial space, doing it randomly is not "good" creativity
  - they are created out of locally consistent patch mosaics of the training data.
- [Jojo Mayer: Redefining Drumming with Generative Technology - YouTube](https://youtu.be/URkxEAvavhw?t=1067)
  - ai relies in interpolation, human creativity relies in extrapolation
  - he's wrong tho
- [MuseNet | OpenAI](https://openai.com/index/musenet/)

---


[^1]: This only works for a really restrictive definition of intelligence, for the kind that humans tend to show it might be [the complete opposite](https://x.com/fchollet/status/1727855160683372969).

[^2]: These are pretty cool but got phased out as they are mostly designed for narrow domains like speech recognition, while modern embedding models are much more broad and scalable. Another related interesting area of research is applying Implicit Neural Representations to [audio](https://arxiv.org/abs/2107.03312)

