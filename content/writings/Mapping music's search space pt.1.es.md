---
title: Mapeando el espacio de búsqueda de la música pt.1
summary: "Intentando dar con una definición útil de qué cuenta como música."
---

Donde intento encontrar una forma de determinar qué es música y qué no, y exploro algunas formas de mapearla. En esta primera parte intentaré responder a la primera pregunta.

---

## Entonces, ¿qué es realmente la música?

Si definimos la música de la forma más generosa posible, sería algo así como:

> todas las combinaciones posibles de sonidos.

Esto equivale a todas las combinaciones de los elementos que forman un sonido[^1]: **frecuencia, amplitud, duración y forma de onda**. Por desgracia, el tamaño de este conjunto parece demasiado para nosotros, ya que cada una de estas dimensiones puede extenderse hasta el infinito y podemos apilar tantos sonidos como queramos. Para hacer este escenario más realista, voy a introducir una serie de restricciones que determinarán una definición de "música" a efectos de esta serie.

---

## El humano como guardián

El primer requisito, que nos ayuda a reducir bastante el espacio de búsqueda, es que tiene que haber un humano de por medio. La música está intrínsecamente ligada a la percepción y la cognición humanas: el sonido puede existir de forma objetiva, pero la música como concepto implica necesariamente algún tipo de interpretación. Por tentador que sea, no creo que tenga sentido obligar a que un humano sea el creador de la música, ya que eso excluiría el canto de los pájaros o la música generada por IA[^2]. Parece mucho más elegante pasarle la responsabilidad de clasificarla a quien la consume.

Con este enfoque, una forma sencilla de determinar si ciertas vibraciones del aire cuentan como música es **exigir que al menos un humano —que ya tenga una idea preconcebida de lo que es la música— asocie esa combinación de sonidos con el concepto de música cuando su cerebro la procesa.** Haciendo esto la estamos atando a la percepción humana, lo que traerá algunas complicaciones más adelante, pero también ayuda a resolver algunos problemas filosóficos como: ["Si un altavoz está reproduciendo canciones pero nadie lo escucha, ¿está sonando música?"](https://en.wikipedia.org/wiki/If_a_tree_falls_in_a_forest).

Del mismo modo, esta regla implica una serie de restricciones adicionales sobre nuestros parámetros, relacionadas con las limitaciones biológicas humanas.

- Los humanos normalmente oyen sonidos de 20Hz a 20.000Hz, aunque el rango varía entre individuos y se reduce con la edad. [^3]
  - La diferencia apenas perceptible (JND, Just Noticeable Difference) para el tono varía mucho con la frecuencia y con el nivel de entrenamiento de quien escucha.
- La duración mínima detectable de un sonido (resolución temporal) para los humanos es de unos [1,2 milisegundos para un burst con una relación señal-ruido de 10 dB](https://pubmed.ncbi.nlm.nih.gov/7085985/)
  - El límite superior de duración está acotado en la práctica por la esperanza de vida humana, ahora mismo unos 100 años.
- También hay límites sobre [lo rápido o lo lento](https://youtu.be/h3kqBX1j7f8) que puede ser un sonido antes de que la interpretación de las vibraciones por parte de nuestro cerebro empiece a liarse, aunque deliberadamente no meto el ritmo en la definición porque complicaría las cosas.
- La amplitud sorprende: los tímpanos humanos son muy sensibles a las variaciones de presión y pueden detectar cambios desde unos pocos micropascales (μPa) hasta más de 100 kilopascales (kPa). En decibelios, el rango va [de 0 a 130](https://sengpielaudio.com/calculator-soundlevel.htm)
- Las formas de onda son complicadas, ya que están directamente relacionadas con el timbre (la combinación de frecuencias de un sonido). El umbral humano de discriminación de frecuencias nos puede ayudar aquí (aunque depende mucho de la frecuencia objetivo, en general ronda el 0,2% de la frecuencia base), pero no es una gran solución.
  - Otro problema es que puedes apilar formas de onda para obtener otras nuevas hasta el infinito, pero como cualquier forma de onda se puede descomponer en senoidales, probablemente podamos encontrar un límite a partir del cual ya no se note.
  - Además, quizá deberíamos tener en cuenta la fase (la posición dentro del ciclo de una onda), pero solo debería importar con ondas de baja frecuencia, ya que en las más altas la resolución temporal de nuestro cerebro no da para procesarla.
    - Esto importa mucho más en entornos estéreo (los humanos solo pueden percibir música en estéreo por defecto), pero vamos a simplificar y medir solo señales mono para evitar complejidad. Es una simplificación enorme, pero de verdad que no quiero tener que lidiar con artefactos como la [cancelación de fase](https://en.wikipedia.org/wiki/Wave_interference).
  - La disonancia/consonancia (las relaciones de frecuencia simples se perciben como agradables, mientras que las más complejas normalmente no) no me importa mucho, ya que hay un montón de ejemplos de música disonante.
    - La [banda crítica](https://en.wikipedia.org/wiki/Critical_band) (banda de frecuencias dentro de la cual un segundo tono interfiere con la percepción del primero por [enmascaramiento auditivo](https://en.wikipedia.org/wiki/Auditory_masking "Auditory masking")) es relevante aquí, pero como es un fenómeno puramente psicoacústico la vamos a ignorar.

---

## De ondas a números

Ahora que tenemos los cuatro elementos que forman un sonido (frecuencia, amplitud, forma de onda y duración) limitados en su rango, deberíamos tener un espacio de búsqueda mucho más pequeño que el original... pero hay algunas trampas. Los fenómenos físicos son señales continuas con resolución infinita, y almacenarlos en cualquier formato **siempre** implica una pérdida de información; esto se conoce como conversión analógico-digital (ADC). Si no hacemos esto, da igual cuánto limitemos los rangos, que siempre será infinito (por la naturaleza de las señales continuas).

La ADC tiene 2 pasos principales:

- **Muestreo**, donde se elige un intervalo regular (sample rate) que determina cada cuánto medimos la señal.
- **Cuantización**, donde a cada muestra se le asigna un valor numérico que representa su amplitud. La profundidad de bits (bit depth) determina la resolución de estos valores.

En la práctica podemos hacer este proceso con suficiente resolución como para que ningún humano se dé cuenta nunca, y el estándar parece haberse asentado en 24 bits de profundidad y 48kHz. Dudo mucho que haya alguien capaz de diferenciar de forma fiable nada por encima de eso.

Hay muchos matices en esto ([filtros anti-aliasing](https://en.wikipedia.org/wiki/Anti-aliasing_filter), frecuencias ultrasónicas...), la mayoría relacionados con cómo funcionan las cosas en el mundo real frente a la teoría. Por ejemplo, transportar información por cables y electricidad introduce un nivel de ruido y distorsión que puede no ser aceptable. Voy a ignorar todos los problemas de este tipo a efectos de este post, pero son reales e interesantes [^4] .

---

## La percepción es un lío

Este podría perfectamente ser el final del post, pero los humanos son notoriamente complicados, y hay algunos problemas al usarlos como jueces. Hay una tensión inevitable entre el sonido objetivo y la interpretación subjetiva (que trato brevemente en la primera nota al pie) que no podemos ignorar del todo.

La misma pieza musical, transmitida exactamente en las mismas condiciones en dos momentos distintos, no tiene por qué tener el mismo efecto en un humano, igual que no interpretas una canción de la misma manera antes y después de conocer la historia que hay detrás. En cierto sentido, la música es como el dicho: "Nadie se baña dos veces en el mismo río". Y no solo eso, sino que cada persona tiene oídos, sensibilidades, cultura... distintos, y luego está todo el campo de la [psicoacústica](https://en.wikipedia.org/wiki/Psychoacoustics), que complica aún más las cosas.

El problema de este nuevo espacio no es que las dimensiones puedan extenderse hasta el infinito, sino que tiene infinitas dimensiones (al menos mientras la consciencia humana no sea computable). Para salir de este lío, tenemos que descartar por completo el elemento humano (junto con las propiedades de textura y ubicación espacial), y tener en cuenta solo el juicio [^5]. Esto significa que excluimos piezas que usan el medio como parte de la música, como ["The Disintegration Loops" de William Basinski](https://en.wikipedia.org/wiki/The_Disintegration_Loops), pero creo que es un compromiso aceptable, ya que eso se parecería más a una instalación artística. [^6]

Así podemos volver a un espacio razonable sobre el que especular, con la ventaja añadida de no tener que usar el concepto de "creatividad" en la definición, que guardo para la parte 2.  Otra gran ventaja es que esta definición no es estática en el tiempo, ya que el espacio, con suerte, irá creciendo a medida que evolucione lo que la gente considera música.

---

## La música como lenguaje

Recapitulando un poco, consideraremos música cualquier combinación posible de sonidos tal y como aparecen, si en algún momento un humano los ha escuchado y los ha interpretado como música. Aunque el número de combinaciones distintas de sonidos que un humano puede percibir es técnicamente infinito, no estamos midiendo la percepción humana, solo el sonido en sí. También hemos puesto una serie de restricciones que reducen muchísimo el espacio posible.

Con estas restricciones, la música se comporta mucho como un lenguaje, pero operando en una modalidad distinta de los tradicionales. Si intentamos traducir algo del inglés al español, inevitablemente se perderá algo de información, pero si intentamos traducir una pieza musical al inglés, la pérdida de información será tal que sería difícil reconocer la pieza. Es una analogía bastante mala, ya que no está claro si [la música tiene referencialidad directa](https://www.jstor.org/stable/40285565),  un requisito de los lenguajes, pero creo que la idea se entiende.

La música sí tiene estructura sintáctica (ritmo, armonía), casi semántica (resonancia emocional) y dialectos culturales (géneros); pero el tipo de ideas que puede transmitir suele ser muy distinto de lo que normalmente transmitimos con palabras. La comunicación tiende a perder mucha información a no ser que haya un gran dominio del lenguaje. Hay gente que ya ha intentado [mapear algunas de estas reglas](https://en.wikipedia.org/wiki/Generative_theory_of_tonal_music), y hay algo de investigación sobre si [cumple un propósito evolutivo](https://centaur.reading.ac.uk/95527/1/Savage%20music-as-a-coevolved-system-for-social-bonding.pdf) ([yo creo que no](https://link.springer.com/referenceworkentry/10.1007/978-3-319-19650-3_2851)).

En realidad, la música son solo los sonidos que se clasifican como arte, y las definiciones de arriba probablemente se aplican a la mayoría de tipos de arte, pero intentaba no usar esa palabra para no liar más las cosas.

---

## Conclusión

Por mucho que haya intentado formalizarla, la música sigue siendo un fenómeno inherentemente humano, y una pieza dinámica, por ejemplo basada en [música generativa](https://en.wikipedia.org/wiki/Generative_music) que evoluciona constantemente en el tiempo, rompería el esquema. Esto es consecuencia de intentar encapsularla en un **objeto** en vez de tratarla simplemente como un **proceso**. Esa idea me gusta mucho, pero no funcionaría en este contexto

Otro problema podría surgir si las diferencias culturales son demasiado grandes como para intentar abarcar a toda la humanidad, aunque hay algunos [indicios de que existen patrones universales en la música entre culturas](https://www.science.org/doi/10.1126/science.aax0868) (¡hay más variación en el comportamiento musical dentro de las sociedades que entre sociedades!). Esto es importante porque apunta a la existencia de patrones cognitivos que podríamos usar para restringir aún más el espacio, pero que claramente todavía no se entienden bien. Conceptos como las [escalas pentatónicas](https://en.wikipedia.org/wiki/Pentatonic_scale) apoyan esta teoría, ya que las desarrollaron de forma independiente muchas civilizaciones antiguas.

Mucha gente ya ha probado suerte con este problema antes, como el [serialismo](https://en.wikipedia.org/wiki/Serialism) (sobre todo el enfoque de [Milton Babbitt](https://en.wikipedia.org/wiki/Milton_Babbitt)) o [EMI de David Cope](https://computerhistory.org/blog/algorithmic-music-david-cope-and-emi/). Aunque este marco es un punto de partida útil, está claro que la música se resiste a ser categorizada. La percepción, la cultura y la biología son temas especialmente escurridizos y estoy lejos de entender bien ninguno de ellos.

En la parte 2 nos meteremos más a fondo en distintas herramientas para explorar y mapear este enorme espacio de búsqueda, con énfasis en técnicas recientes de machine learning y en la compresión. Gracias por leer :)

[^1]:  [Sonido](https://en.wikipedia.org/wiki/Sound) se refiere tanto a "una vibración que se propaga como una onda acústica" como a "la recepción de esas ondas y su percepción por el cerebro". La primera definición no incluye los conceptos de timbre, textura o ubicación espacial, ya que esos los "alucina" nuestro cerebro.


[^2]:  Se podría argumentar que el prompt humano (en el caso de un modelo txt2audio) o incluso el propio dataset de entrenamiento (supuestamente curado por humanos) aporta suficiente "fuerza creativa" como para justificar el resultado como una creación humana. Aunque lo dudo, tampoco creo que falte mucho para que podamos automatizar todos estos procesos. Hablaré más de la creatividad en el siguiente post.


[^3]:  Supongo que podrías hacer música para perros u otros animales si quieres desbloquear ese sector del espacio de búsqueda. Parece que son [más que capaces](https://link.springer.com/article/10.1007/s10071-024-01875-5) de categorizarla, pero de momento nos quedamos con los humanos.


[^4]: Un recurso genial que encontré mientras investigaba para esto fueron estos 2 papers de [Dan Lavry](https://lavryengineering.com/our-company): [Sampling Theory For Digital Audio](https://lavryengineering.com/pdfs/lavry-sampling-theory.pdf) y [The Optimal Sample Rate for Quality Audio](https://www.lavryengineering.com/pdfs/lavry-white-paper-the_optimal_sample_rate_for_quality_audio.pdf), donde explica muy claramente cómo ¡un sample rate más alto no implica necesariamente más calidad! Además, su forma de escribir me pareció muy amena.


[^5]:   El juicio habría que descartarlo si la transmisión al receptor se corrompió por encima de cierto umbral. Podemos asumir que la transmisión se hará por aire en condiciones atmosféricas normales (15°C, 1 atmósfera, 50% de humedad). Y no solo eso, sino que habría que quitarle la distinción de "música" a un sonido si la única persona que lo reconoce como música se muere.


[^6]:   La [música 8D](https://en.wikipedia.org/wiki/8D_music) también quedará excluida, lo cual es triste, pero más triste aún es la realidad, reducida a remixes que "te dan vueltas alrededor de la cabeza" para redes sociales. Tengo esperanza de que vuelva, pero está claramente limitada por la tecnología de reproducción. Apple va en la buena dirección, pero es un proceso lento. Fue un momento especial para mí cuando descubrí que los sonidos no solo se panean a izquierda y derecha: hay dos dimensiones más por explorar...
