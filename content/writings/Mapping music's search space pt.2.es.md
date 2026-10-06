---
title: Mapeando el espacio de búsqueda de la música pt.2
summary: "Mapear sonidos según sus características para que la música parecida quede cerca."
---

En la parte [[Mapping music's search space pt.1]] intenté lo mejor que pude formalizar una definición de "música". En esta segunda entrega nos centraremos en la mejor forma de representar este espacio, haciéndolo más fácil de interpretar para los humanos y diseccionando algunas de las herramientas que podemos usar para ello.

---

Recapitulando, la "música" se puede definir como:

> Cualquier combinación de sonidos que al menos una persona reconozca como música, basándose en su comprensión y experiencia previas de lo que es la música.

Teniendo en cuenta las restricciones biológicas de los humanos y encontrando una representación digital con compromisos mínimos, el espacio se reduce muchísimo. Para ser justos, esto no era un requisito para poder mapearlos adecuadamente, pero fue un experimento mental divertido que ayuda a entender algunos conceptos.

Sinceramente, me sentí un poco tonto después de releer la primera parte de este post, porque me di cuenta de que, hablando de música, en realidad estaba pensando en el arte, en este caso concreto aplicado a ondas sonoras. Así que supongo que esta es también mi teoría sobre lo que es el arte.

Ahora queremos encontrar una buena forma de mapear cualquier sonido. Esto significa que cuando cojamos un sonido nuevo y lo coloquemos en nuestro mapa, debería quedar cerca de sonidos parecidos y lejos de los distintos.

 Lo que hace que un sonido esté relacionado con otro se puede medir de muchas formas, pero algunas tienen más sentido que otras. Comparar cada punto muestreado de un sonido con el otro es un enfoque defectuoso: no solo sería carísimo computacionalmente, sino que los resultados serían muy malos, porque nuestro cerebro no funciona así.

Aquí intentaremos resolverlo al revés, mapeando primero los sonidos según un conjunto de [features](https://en.wikipedia.org/wiki/Feature_(machine_learning)) y luego definiendo los géneros como los distintos clusters de puntos que aparezcan. Si lo hacemos bien, los géneros que encontremos en nuestros datos y los del mundo real deberían coincidir bastante. Esto significa que ya no hay un humano en el loop como antes, lo que tiene un montón de ventajas.

El machine learning es un candidato natural, ya que lo que hacen los modelos no es más que comprimir la información que se les presenta en el training set, y una buena compresión implica ser capaz de encontrar las features más relevantes. Tampoco hay que subestimarlo, eso sí, ya que dependiendo de cómo definas la inteligencia, [podría ser simplemente compresión sofisticada](https://arxiv.org/abs/2404.09937)[^1].

El problema entonces se divide en 2 partes:

- primero hay que encontrar las features que mejor representan la música (tal y como la entienden los humanos)
- luego transformarlas en una visualización legible para humanos

 Para introducir este proceso, usaré como ejemplo la publicación [Audio Atlas: Visualizing and Exploring Audio Datasets](https://arxiv.org/html/2412.00591v1), ya que hace muchas de las cosas que nos interesan, pero hay muchos otros papers relevantes enlazados más adelante.

---

## Features

Como comentamos antes, usar los puntos muestreados de un sonido como features no va a funcionar en absoluto, así que encontrar las features correctas es donde está la chicha del trabajo. El [deep learning](https://en.wikipedia.org/wiki/Deep_learning) es la rama del ML que puede aprender qué features elegir para minimizar una función de pérdida. Elegir features a mano es posible, pero a partir de cierto nivel de complejidad las asociaciones que puede encontrar un humano son limitadas, así que deberíamos aprovechar esto todo lo posible.

El problema es que el audio es un tipo de dato difícil de trabajar, si lo miras desde la perspectiva de un ordenador. Las formas de onda de audio en bruto son de alta dimensionalidad (44.100 valores numéricos por segundo)   y, a diferencia de las imágenes, donde se pueden analizar patrones espaciales (bordes, texturas), el audio requiere analizar relaciones que dependen del tiempo: cada muestra representa la presión del aire instantánea, sin ninguna estructura inherente.
  
  Incluso usando transformadas de Fourier, que descomponen las señales de audio en bandas de frecuencia, no se consigue aislar muchas features perceptivas. A un espectrograma le sigue faltando representación para muchas de las features que usan los humanos para reconocer el sonido. Los enfoques tradicionales de machine learning que usan features espectrales hechas a mano (MFCCs, chroma... [^2] ) se acercan a esto, pero son frágiles y demasiado costosos en recursos como para ser útiles.

  Los [vector embeddings](https://www.cloudflare.com/learning/ai/what-are-embeddings/) resuelven esto representando los datos como vectores densos y de menor dimensionalidad que capturan relaciones y características. A diferencia de los datos en bruto (p. ej., formas de onda de audio), los embeddings destilan patrones con significado —como el timbre, el ritmo o el contexto— en una forma numérica comprimida. Los elementos parecidos quedan más cerca unos de otros en este espacio vectorial, lo que permite comparar y generalizar de forma eficiente.

En el ejemplo de Atlas, generan embeddings semánticos usando [CLAP](https://github.com/LAION-AI/CLAP) (Contrastive Language-Audio Pretraining). Este modelo aprende a asociar audio con descripciones textuales entrenando con pares de clips de audio y sus etiquetas de texto correspondientes, aprendiendo a mapear ambos en un espacio de embeddings compartido donde los pares audio-texto relacionados semánticamente (p. ej., "tormenta" y un sonido de lluvia) quedan cerca. Esto permite la búsqueda semántica y la clasificación de audio.

En esencia, CLAP hace una **compresión semántica** del audio, codificando su significado en un vector y descartando los detalles irrelevantes. Sin embargo, esta compresión pierde mucha información: prioriza las features alineadas con la semántica textual y es poco probable que puedas reconstruir el audio original a partir del embedding, ya que descarta demasiada señal.

Aun así, tener un **espacio latente común** es clave porque tiende un puente entre modalidades: el audio y el texto pasan a ser directamente comparables a través de sus embeddings. Este espacio actúa como una capa de traducción, donde las relaciones entre los sonidos y los conceptos humanos se hacen visibles, y aunque sea imperfecta, esta estructura latente sirve de base para construir sistemas de audio que "entiendan" el contexto, generalicen a datos no vistos e interactúen de forma natural con el lenguaje humano.

El principal problema de esta implementación es que la mayoría de sonidos quedarán muy lejos de la distribución de pares texto-audio con la que se entrenó. Aunque ha visto muchos ruidos que no son estrictamente música (la imagen de abajo muestra el dataset ESC-50 de sonidos ambientales representado por Audio Atlas), la mayoría de sonidos no tienen un equivalente en lenguaje natural al que hacer referencia.

![ESC-50-white.png](https://i.imgur.com/N9AmhKW.png)

Debería mencionar que, aunque herramientas como CLAP son útiles para explicar, no son tan buenas comprimiendo audio y haciéndolo comprensible para un modelo de ML. Modelos de audio como Stable Audio o AudioGen usan  [autoencoders variacionales](https://en.wikipedia.org/wiki/Variational_autoencoder), que son capaces de codificar y decodificar señales con mucha precisión.

---

## Visualización

Los embeddings tienden a formar clusters, donde las instancias con características parecidas se agrupan. Estos puntos se pueden proyectar en dos dimensiones usando algún algoritmo como  [t-SNE](https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding)  (t-Distributed Stochastic Neighbor Embedding). Es una técnica de reducción de dimensionalidad que  funciona preservando la estructura local de los datos, es decir, los puntos cercanos entre sí en el espacio de alta dimensionalidad siguen cerca en la proyección de baja dimensionalidad, mientras que los puntos lejanos se separan. [Aquí puedes ver un ejemplo de este tipo de proyección](https://projector.tensorflow.org/)

Una limitación de proyectar estos embeddings en solo 2 dimensiones es que un artista puede explorar casi infinitamente sin cambiar necesariamente su posición en el mapa. Creo que la mayoría de músicos juegan mucho con esta dinámica, y aunque tienen virtuosismo y un conocimiento muy profundo de un conjunto concreto de reglas (que definen un cluster), en realidad no se mueven en el mapa. Puede que estén haciendo cosas increíbles en una dimensión concreta, pero eso no significa que sea un cambio que te vaya a diferenciar del resto.

![audio_atlas_fma.png](https://i.imgur.com/QSgFGCP.png)

---

La exploración descrita arriba es muchas cosas —requiere el estudio y el dominio de un lenguaje que no tiene palabras—, pero en mi opinión no es realmente creatividad.

Para mí, la creatividad es la capacidad de explorar este espacio de posibilidades, y cuanto más lejos puedas llegar de cualquier otro cluster, más creatividad estás ejerciendo.

El argumento principal de este post es que la influencia que tienen los creadores de herramientas en este proceso es desproporcionada y el público la ignora en gran medida. Es tan desproporcionada que no me sorprendería que más del 90% del espacio explorado hoy sea consecuencia directa de la creación de ciertas herramientas, más que algo descubierto por los músicos a los que nominalmente se les da el crédito.

No sorprende, entonces, que un requisito previo para ejercer siquiera un nivel mínimo de creatividad sea cierto grado de dominio de la herramienta musical. Al desacoplar la categoría de música de la intención del creador, nos vemos obligados a aceptar como música el sonido de alguien golpeando una batería al azar sin tener ni idea de lo que hace. Sin embargo, cualquiera puede golpear una batería al azar: es un espacio muy trillado. Hace falta un nivel de dominio más alto para [escapar del sector de cómo suena normalmente una batería](https://youtu.be/vgzSP05q0as).

---

Para empezar, la propia herramienta determina el rango de sonidos que puedes producir. Es un problema relativamente resuelto en la era digital, y aun así la variedad de la música no parece proporcional al nivel de control que se nos ha dado con la creación del MIDI y los sintetizadores digitales.

Esto es porque, a gran escala, los humanos no somos tan creativos como creemos. La lista de sesgos cognitivos humanos es [larga y ambigua](https://en.wikipedia.org/wiki/List_of_cognitive_biases), pero muy eficaz limitándonos de forma inconsciente. Por ejemplo, la influencia de los valores por defecto de varios parámetros es enorme y está bien documentada, como en el caso del tempo en FL Studio:

> While Ableton Live and Logic Pro’s default bpm is 120, FL Studio originally opted for a rapid 140bpm, something that immediately resulted in a different approach to the four-four nature of other genres. “Grime’s instantly recognizable ‘magic number’ of 140bpm finds its origins here too,” said [PSNEurope in 2018](https://www.psneurope.com/business/uk-music-producer-grime). “‘Godfather of Grime’ Wiley has said this standard tempo in the programme meant he created most of his earliest tracks at 140bpm, and as one of the genre’s first success stories, other producers followed his lead.” Early grime pioneer Dexplicit agrees. “I got so accustomed to the default tempo that everything I made in my earlier days was 140bpm. Whether it was garage, grime or bassline, it was almost exclusively at that tempo for this reason.”  
> de [How FL Studio changed electronic music forever](https://djmag.com/longreads/how-fl-studio-changed-electronic-music-forever)

Más allá de eso, los presets incluidos en un sintetizador o una unidad de efectos determinarán el 99% de los sonidos que usa el usuario final, pese al número infinito de parámetros ajustables. Esto no es malo en sí mismo —si tuviera que definir a mano cada parámetro de cada sonido, nadie haría música—, pero es decisión de las herramientas cuáles de estos hacer accesibles al público y cómo.

---

Bueno, resulta que esta es la forma larga de anunciar que tengo pensado empezar una serie de posts destacando distintas herramientas que desbloquearon espacios nuevos y que posiblemente no tienen el reconocimiento que merecen. Se publicarán en español en un blog de música que tengo con unos amigos, [no-cosign](https://no-cosign.m19182.dev), puede que los traduzca al inglés más adelante.

Casualmente, hace poco empecé a trabajar en [Audialab](https://audialab.com), y gran parte de nuestra [misión](https://audialab.com/audio-diffusion/) va en esta línea: queremos crear las herramientas que permitan a los artistas seguir explorando el territorio y escribiendo los mapas.

---


Links interesantes que no sabía dónde meter:

- [Music Exploration - Playground](https://music-explore.upf.edu/)
- [GitHub - facebookresearch/encodec: deep learning based audio codec](https://github.com/facebookresearch/encodec)
- [On word embeddings - Part 3: The secret ingredients of word2vec](https://www.ruder.io/secret-word2vec/)
- [\[2412.20292\] An analytic theory of creativity in convolutional diffusion models](https://arxiv.org/abs/2412.20292)
  - la creatividad es solo un espacio combinatorio, hacerlo al azar no es creatividad "buena"
  - se crean a partir de mosaicos de parches localmente consistentes de los datos de entrenamiento.
- [Jojo Mayer: Redefining Drumming with Generative Technology - YouTube](https://youtu.be/URkxEAvavhw?t=1067)
  - la IA se basa en la interpolación, la creatividad humana se basa en la extrapolación
  - aunque se equivoca
- [MuseNet | OpenAI](https://openai.com/index/musenet/)

---


[^1]: Esto solo funciona para una definición de inteligencia muy restrictiva; para el tipo que suelen mostrar los humanos, podría ser [justo lo contrario](https://x.com/fchollet/status/1727855160683372969).

[^2]: Están bastante guapas, pero se dejaron de usar porque están diseñadas sobre todo para dominios estrechos como el reconocimiento de voz, mientras que los modelos de embeddings modernos son mucho más amplios y escalables. Otra área de investigación relacionada e interesante es aplicar Implicit Neural Representations a [audio](https://arxiv.org/abs/2107.03312)
