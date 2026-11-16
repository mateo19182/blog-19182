---
title: Los bots de Melee se están poniendo muy buenos
summary: "Diez años de bots de Super Smash Bros. Melee, y unos cuantos LLM, en una sola escala Elo, más un bot propio."
---
Super Smash Bros. Melee salió en 2001 y es uno de los videojuegos con el techo (y el suelo) de habilidad más alto que conozco; prueba de ello es que muchísima gente lo sigue jugando de forma competitiva. No soy nada bueno, SSB4 fue el único en el que eché horas, pero sé lo suficiente para entender parte de su complejidad, y es impresionante. [^1]

Los jugadores competitivos de Melee hacen de media 7 acciones por segundo, en un combate rapidísimo, sin buffer de entradas y con técnicas como el wavedash, el L-cancel o el dash dance. Lo disfruto mucho más que cualquier otro juego de lucha porque no depende tanto de los combos y es mucho más libre.

![Fox haciendo wavedash, L-cancel y dash dance en Final Destination, con el stick y los botones pulsados en cada fotograma](/data/melee/tech.webp)

*Redibujado a media velocidad desde repeticiones del benchmark, con los controles debajo. **Wavedash**: saltas y haces un esquive aéreo en diagonal contra el suelo, y su impulso se convierte en un deslizamiento. **L-cancel**: pulsar L o R justo antes de aterrizar un aéreo reduce a la mitad el retraso al aterrizar. **Dash dance**: echar el stick atrás en los primeros fotogramas del dash hace que Fox se gire al instante, sin frenar.*

La comunidad ha montado herramientas abiertas absurdamente buenas: [Slippi](https://slippi.gg) para jugar online y guardar repeticiones, [libmelee](https://github.com/vladfi1/libmelee) para leer el juego y pulsar botones desde Python, e incluso una descompilación del propio código del juego.

Empecé con una pregunta sobre LLM. La mayoría de benchmarks de juegos para ellos son por turnos (ajedrez, Pokémon, Slay the Spire), donde el juego espera educadamente mientras el modelo piensa. Yo quería uno que no esperase. Los LLM acabaron siendo la parte pequeña de la historia... así que este post empieza por los bots.

Todo esto se hizo en dos días y lo presenté en una charla de 5 minutos en [1hack](https://1hack.eu/) el 14 de noviembre ([diapositivas](https://melee.m19182.dev/writeup/slides.html)). La mayor parte del código la escribieron agentes de programación trabajando en paralelo en mi servidor de casa. La web del proyecto, con las clasificaciones, repeticiones, partidas en directo y un [artículo](https://melee.m19182.dev/writeup/) más largo, está en [melee.m19182.dev](https://melee.m19182.dev), y el código está en [GitHub](https://github.com/mateo19182/melee-llm).

![Una partida del benchmark redibujada desde su repetición: Faynt (azul) le quita una vida a Phillip (rojo), los dos con Fox en Final Destination](/data/melee/replay-2d.webp)

*14 segundos de una partida del benchmark, redibujados desde el archivo de repetición: Faynt (azul) le quita una vida a Phillip (rojo), los dos con Fox.*

Si nunca lo has jugado: dos personajes pelean en un escenario pequeño que flota, cada golpe sube el porcentaje de daño del rival y cuanto más alto, más lejos sale volando. Si lo sacas de la pantalla pierde una vida (un *stock*). Cuatro vidas, ocho minutos. Sencillo sobre el papel, pero a alto nivel va de reacciones medidas en fotogramas sueltos y de leer lo que va a hacer el otro.

---

## Diez años de bots, y por qué ahora

- **2001**, las CPU del juego, niveles 1 a 9. La de nivel 9 golpea y agarra en el fotograma exacto, pero casi nunca usa el escudo, siempre se recupera igual y pierde contra un mismo movimiento repetido.
- **2015**, [SmashBot](https://www.youtube.com/watch?v=_0Z_oN_CZyA). Dan "altf4" Petro escribió a mano un bot de Fox, perfecto al fotograma y con tiempo de reacción cero. Su fontanería se convirtió en libmelee, sobre la que se construyen casi todos los bots desde entonces.
- **2017**, [Phillip](https://arxiv.org/abs/1702.06230). Vlad Firoiu entrenó una red solo con aprendizaje por refuerzo y ganó a jugadores profesionales, reaccionando en unos 2 fotogramas cuando un humano necesita de 12 a 15.
- **2018-2022**, Slippi: archivos de repetición, netplay con rollback y una clasificatoria. De repente había cientos de miles de partidas humanas grabadas de las que aprender.
- **2024**, Phillip otra vez, ahora con [slippi-ai](https://github.com/vladfi1/slippi-ai): primero copiar a humanos a partir de repeticiones y luego mejorar jugando contra sí mismo, con un retardo de reacción humano incorporado. Zain [le ganó 5-3](https://www.youtube.com/watch?v=c8nRFAGvr2c); Moky [perdió 3-10](https://www.youtube.com/watch?v=1kviVflqXc4).
- **2025**, [HAL](https://ericyuegu.com/behavior-cloning-melee/), de Eric Gu, clonó partidas de Fox de profesionales en un transformer de 20M de parámetros por unos 5 $ de cómputo y ganó a la CPU de nivel 9 el 95% de las veces. [MIMIC](https://github.com/erickfm/MIMIC) vino después, con un modelo por personaje.

Y luego, las últimas seis semanas:

- Jugadores de élite se enfrentaron en directo a un equipo de Phillips, dos veces, y ganaron las dos por los pelos.
- Frisson Labs publicó [Faynt](https://www.frisson-labs.com/faynt), un solo modelo de 10M de parámetros que juega con los 26 personajes y ganó 240 de 244 partidas contra las versiones públicas de Phillip.
- Un HAL escalado (247M de parámetros) [llegó a unos 2200 de Elo](https://ericyuegu.com/hillclimbing-melee/), el 1% superior de la clasificatoria humana.
- Abrió [stomped.dev](https://stomped.dev), una clasificatoria solo para bots.
- [melee-sim-light](https://github.com/kyhavlov/melee-sim-light) ejecuta el juego descompilado sin emulador, unas 100 veces más rápido.
- Tres días antes de la charla, Frisson publicó [Reyn](https://www.frisson-labs.com/reyn), un bot que diriges con órdenes en inglés.

### La escena TAS

Junto a los bots hay una escena más pequeña de juego asistido por herramientas (TAS): un archivo de entradas construido fotograma a fotograma en un emulador, con estados guardados y reintentos ilimitados, que luego se reproduce desde el encendido. La reproducción es determinista, así que las mismas entradas dan siempre la misma partida. Enseña lo que permite el juego, no lo que puede hacer un humano.

- Empezó en **2005** con vídeos de Action Replay hechos en el modo de depuración oculto del juego, que avanza fotograma a fotograma. Hacia **2010** Dolphin tuvo herramientas TAS de verdad (estados guardados, avance por fotograma, películas de entradas), y más tarde scripts en Lua encima, como [ssbm-lua-core](https://github.com/practicaltas/ssbm-lua-core) de PracticalTAS.
- Las obras maestras: [combos que acaban todos en exactamente 69 golpes](https://www.youtube.com/watch?v=F-mUcQXeSSc), y [Target Test con los 25 personajes](https://tasvideos.org/7174S) en 2:39.97 de tiempo de juego. Los hallazgos vuelven al juego humano: una ruta de Ice Climbers sacada de un TAS ahorró 91 fotogramas en la [carrera por bajar de 3:00](https://www.youtube.com/watch?v=qsT08n_96p4) en tiempo real.
- Los números "aleatorios" de Melee salen de una sola semilla de 32 bits y una fórmula sencilla (`seed × 214013 + 2531011`), que avanza una vez por cada llamada aleatoria. Los TASers la dirigen, por ejemplo eligiendo personajes al azar en la pantalla de selección, que gasta exactamente dos llamadas.

Un TAS y un bot leen el mismo estado del juego y pulsan el mismo mando virtual, pero un TAS es de lazo abierto: conoce todo el futuro y se busca sin prisa. Un bot ve cada fotograma una vez y tiene 16 ms. Otros juegos automatizan el TAS con búsqueda sobre su código descompilado (Super Mario 64 tiene fuerza bruta que hace justo eso), y por lo que he encontrado nadie lo ha hecho todavía para Melee: siguen siendo scripts de Lua y edición a mano fotograma a fotograma. Mis notas, con fuentes, están [aquí](https://github.com/mateo19182/melee-llm/blob/main/docs/tas.md).

O sea: los bots más fuertes se pueden descargar y ejecutar en una sola GPU doméstica, uno de ellos entiende lenguaje, el juego se puede simular mucho más rápido que en tiempo real, clonar un bot decente cuesta unos pocos dólares y hay una clasificatoria pública donde probarlo. Nadie los había puesto a todos en una misma escala, ni se había preguntado dónde encaja un LLM entre ellos.

## Cómo funcionan los mejores

Ninguno de estos bots mira la pantalla. Leen la memoria del juego en cada fotograma (posiciones, velocidades, animación y en qué punto va, daño) y responden con el estado completo de un mando. Y casi todos comparten receta: copiar a humanos a partir de repeticiones (clonación de comportamiento) y luego mejorar jugando contra sí mismos. Es AlphaGo sin la búsqueda, porque en 16 milisegundos no hay tiempo de mirar jugadas por delante ni forma de rebobinar. El pariente más cercano es AlphaStar de DeepMind para StarCraft II: también en tiempo real, también clonado de repeticiones humanas, y luego juego contra sí mismo con una penalización por alejarse del juego humano.

- **[Phillip](https://github.com/vladfi1/slippi-ai)** (slippi-ai) es una red recurrente, no un transformer. Elige el mando en dos pasos: una de 728 combinaciones de botones, gatillos y C-stick, y luego una de 85 posiciones del stick principal. Se clona de repeticiones de ranked y de profesionales, luego se entrena jugando contra sí mismo, y ve el juego con 18 a 24 fotogramas de retraso, como un humano reaccionando.
- **[HAL](https://ericyuegu.com/hillclimbing-melee/)** es el más grande: un transformer de 247M con 256 fotogramas de contexto, entrenado en 16 horas en una B200 con unos 1,3M de partidas (13.500 millones de fotogramas). Clonación pura, dirigida pidiéndole un nivel de juego o el estilo de un jugador ("juega como Cody"). Predice 4 fotogramas de entradas a la vez para esconder su tiempo de cómputo. El hallazgo clave de Gu: un fotograma de retraso de reacción hace el doble de daño que un fotograma actuando sin información nueva.
- **[MIMIC](https://github.com/erickfm/MIMIC)** aplica la receta de HAL por personaje: unos 20M de parámetros, una cabeza dedicada a los botones para poder hacer wavedash, y un poco de RL sobre cosas que el juego puede comprobar, como el porcentaje de L-cancel.
- **[Faynt](https://arxiv.org/abs/2610.02144)** es un transformer de 10M (5 capas) con una caché de 256 fotogramas. Tres fases: clonación con unas 840.000 repeticiones de ranked, un "currículo de ganadores" que acaba en partidas ganadas por jugadores de rango Master (destilado de un hermano de 75M), y luego RL jugando contra sí mismo en espejos de Fox con 96 emuladores en una GPU. El RL llevó al modelo de 75M de 25 a 58 victorias en su prueba. Juega con retraso de reacción cero.
- **[Reyn](https://www.frisson-labs.com/reyn)** es Faynt más dirección por lenguaje, pero sin ningún LLM dentro. Frisson etiquetó repeticiones humanas con instrucciones generadas por reglas ("esto es un agarre"), entrenó la política para seguirlas, y luego la congeló y entrenó unos 2,2M de parámetros de adaptadores con RL. Un pequeño enrutador traduce lo que escribas a un menú fijo de unas 100 órdenes, o lo rechaza. Ese detalle importa más adelante.

Son diminutos al lado de un LLM (de 10M a 247M de parámetros), responden en 2 a 8 milisegundos por fotograma en una GPU doméstica, y su fuerza sale de repeticiones humanas y juego contra sí mismos, no de razonar.

---

## El benchmark

Todo corre en mi servidor de casa: el juego real en el emulador Dolphin de Slippi, una docena de partidas a la vez y Python manejando mandos virtuales. Todas las partidas son Fox contra Fox en dos escenarios de torneo. Participan las CPU del juego, tres bots sencillos programados a mano, los cinco bots aprendidos publicados (Phillip en varios niveles, HAL, MIMIC, Faynt y Reyn) y LLM.

Los LLM son demasiado lentos para pulsar botones en cada fotograma (un fotograma son 16,7 ms y una respuesta tarda de 1 a 3 segundos), así que cada montaje les da una tarea de más alto nivel y deja los fotogramas a algo más rápido. Leen unas 150 palabras de texto que describen el momento y:

1. **[Juegan, sin límite de tiempo](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/agents/llm_paused.py)**: eligen un movimiento (`laser`, `shine`, `wavedash`, `recover`...) y el juego se pausa mientras piensan. Esto mide solo lo buenas que son sus decisiones.
2. **[Juegan, en directo](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/agents/llm_live.py)**: lo mismo a velocidad real, con un comportamiento seguro por defecto mientras el modelo piensa. Las respuestas con más de 2 segundos se descartan.
3. **[Juega Jev](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/agents/jev_player.py)**: [Jev, de TypeSafe](https://typesafe.ai/blog/introducing-system-one-models-and-jev), un modelo de decisión rápido que responde preguntas tipo test en unos 0,15 segundos.
4. **[Entrenan a Reyn](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/agents/coach.py)**: Reyn juega cada fotograma y cada 5 segundos el entrenador elige una de sus órdenes.
5. **[Escriben un bot](https://github.com/mateo19182/melee-llm/tree/main/melee_llm/botwriter)**: un agente de programación tiene 30 minutos, un sandbox y una herramienta de práctica para escribir un bot en Python que luego juega como cualquier otro participante.

Todo entra en un [único ajuste Elo](https://github.com/mateo19182/melee-llm/tree/main/melee_llm/bench) con la CPU de nivel 9 fijada en 1500 (400 puntos de diferencia significan que el más fuerte gana unas 10 partidas de cada 11). Nadie eligió las partidas a mano: un planificador escogía la siguiente cada pocos segundos, priorizando las que más estrechaban los intervalos más anchos por menos tokens. Al final la clasificación reunió 4.082 partidas.

![Clasificación en tiempo real: el Elo de cada participante con su intervalo del 95%, coloreado por tipo](/data/melee/leaderboard-realtime.svg "wide")

Los bots aprendidos van muy por delante. **Faynt no perdió nunca**: 370-0, la mayoría contra Phillip gm, así que su 3403 es en realidad un mínimo. Después vienen Phillip gm (2549) y HAL (2300). Las CPU suben en orden, de 976 la de nivel 1 a 1500 la de nivel 9: menos distancia que los 1.000 puntos entre la de nivel 9 y Phillip gm.

---

## Dónde quedaron los LLM

### Jugando: la velocidad gana a la inteligencia

![Elo sin límite de tiempo frente a Elo en tiempo real para cada modelo, con el porcentaje de respuestas en directo descartadas por llegar tarde](/data/melee/latency-tax.svg "wide")

Con tiempo para pensar, GPT-6.1 Sol gana a la CPU de nivel 9 (1729), el resto de modelos quedan entre 1254 y 1474, y todos ganan a Jev (1082). Un jugador que elige un movimiento al azar en cada decisión puntúa 732, así que aquí pensar sí cuenta.

En directo todo eso desaparece: todos los modelos caen de 492 a 851 puntos y acaban **por debajo de la CPU de nivel 1** (de 762 a 878), empatados entre sí y con Jev. Las respuestas de Sol tardan 2-3 segundos, así que el 95% llegan tarde y se descartan. Lo comprobé con dos controles: mi piloto automático solo, sin preguntar nunca a un modelo, puntúa 824, y los movimientos al azar 700. Todos los LLM en directo caen dentro del intervalo del piloto automático, así que a esta velocidad el LLM no aporta nada medible sobre el código que lo envuelve. Incluso Haiku, lo bastante rápido como para que solo se descarte el 5% de sus respuestas, actúa sobre un estado del juego de hace unos 70 fotogramas, que en Melee son varios intercambios atrás.

[LLM Colosseum](https://github.com/OpenGenerativeAI/llm-colosseum) vio lo mismo en Street Fighter (GPT-3.5 ganaba a GPT-4 por ser más rápido); aquí está en una escala con barras de error.

Las capturas de pantalla tampoco ayudan: con una imagen en lugar del texto, Haiku casi nunca se daba cuenta de que estaba colgado del borde. Todos los modelos leían los porcentajes de daño casi a la perfección y acertaban izquierda/derecha más o menos al azar.

### Entrenando: dos palabras ganan

![Puntuación de Reyn sin órdenes, con órdenes al azar, con cada LLM y Jev como entrenador, y manteniendo "Don't die." toda la partida](/data/melee/coaching.svg "wide")

Esta fue la sorpresa. Reyn sin órdenes puntúa 1846, y con cualquier entrenador sube unos 300 puntos hasta el nivel de HAL. Pero un "entrenador" que elige una orden al azar cada 5 segundos sin mirar la partida consigue la mayor parte de esa subida (2141). Solo con las puntuaciones, los intervalos de los LLM entrenadores se solapan con el suyo, así que puse a los entrenadores a jugar entre sí directamente: 300 partidas más, el mismo bot en los dos lados y solo cambia el entrenador. Tres de los cuatro LLM sí ganan al azar: Sonnet 5.5 le ganó 29 de 36, Haiku 4.5 28 de 37 y GPT-6 Luna 30 de 45, unos 170 puntos por encima. GPT-6.1 Sol no (15 de 35), y también es el más lento, 3 segundos por respuesta. Así que investigué más:

- A Reyn le basta casi con *cualquier* orden. Una sola orden al azar mantenida toda la partida ya lo sube a 2075.
- **Mantener "Don't die." ("no te mueras") toda la partida, sin entrenador, puntúa 2452**, por encima de todos los LLM entrenadores.
- Jev es el mejor entrenador (2403), y por accidente: su elección favorita es "kill now" ("mata ya"), que el enrutador de Reyn traduce, siempre, a... "Don't die."

Los LLM eligen planes que suenan sensatos (edgeguard, jugar agresivo) y que resultan valer menos que el aburrido. La lección va menos de LLM que del bot, y de cómo una interfaz de lenguaje puede convertir tus palabras en otra cosa sin que te enteres.

### Programando: una CPU 9 en 30 minutos

![Puntuación en el benchmark de cada bot escrito por un LLM en una sesión de 30 minutos, junto a las CPU, MIMIC y Phillip silver](/data/melee/bot-writer.svg "wide")

27 sesiones de Claude Code de 30 minutos cada una, en tres tandas, todas en la clasificación principal:

- **Una ejecución por modelo.** El bot de Sonnet, de 135 líneas (shine, agarre, láseres), puntúa 1752, el de Haiku 4.5 1599, y el de Opus, 303 líneas y el más elaborado, 1527.
- **Tres ejecuciones de cada uno con esfuerzo medio.** Opus quedó claramente por delante (de 1684 a 1858, todos por encima de la CPU de nivel 9); Sonnet (de 936 a 1233) y Haiku (de 1060 a 1444) se quedaron por debajo.
- **Cinco ejecuciones de cada uno con esfuerzo alto y un bot inicial mejor.** Los tres quedaron empatados: Opus 1699 de media, Haiku 1686, Sonnet 1660.

Ese empate dice más del bot inicial que de los modelos. El nuevo bot inicial eran 60 líneas que van a por el rival y hacen up-smash, y no había comprobado lo fuerte que era: una sesión de Haiku lo entregó sin cambios y puntúa 1685, por encima de la CPU de nivel 9. Opus y Sonnet casi siempre lo reescribieron, hasta 450 líneas, y de media acabaron donde empezaron. Solo dos sesiones lo mejoraron claramente (la mejor llegó a 1944, al nivel de MIMIC). O sea: ejecuciones del mismo modelo difieren en cientos de puntos, y 60 líneas con la idea correcta superan casi todo lo que añaden 30 minutos de un modelo fuerte.

---

## Qué más salió de esto

**Una [web](https://github.com/mateo19182/melee-llm/tree/main/melee_llm/web)** para verlo todo, vestida como los menús del propio Melee: las clasificaciones con una página por participante, cada partida del servidor dibujada en 2D en directo, un lanzador para cualquier enfrentamiento, todas las repeticiones con las decisiones de la IA en una línea temporal y una página Live que emite el juego real.

**Una [cabina de comentarios con IA](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/commentary.py)** en esa página Live. Dos comentaristas, Charlie en la narración ("ruidoso, rápido, pierde la cabeza en los momentos grandes") y Laura en el análisis ("ingenio seco, se mete con Charlie"). Un LLM rápido sigue los eventos de la partida y escribe una frase cada pocos segundos, y ElevenLabs les pone voz, solo mientras alguien escucha. Un intercambio real:

> **Charlie:** HAL MASTER's Fox is in the air and Faynt's Marth is waiting for him!
> **Laura:** Waiting is the right word. Faynt doesn't chase, Charlie, he collects.

**Un [simulador](https://github.com/mateo19182/melee-llm/tree/main/melee_llm/sim).** Conecté todos los jugadores, bots aprendidos incluidos, a melee-sim-light y lo comprobé contra 300 repeticiones: 287 coincidieron fotograma a fotograma (las otras 13 eran archivos sin terminar), unas 100 veces más rápido que el emulador. La pega es que no tiene las CPU del juego.

**Un bot propio, [m19182-yoshi](https://github.com/mateo19182/melee-llm/tree/main/train/meleebot).** Un transformer pequeño que copia el juego humano, como hizo HAL: lee los últimos 4 segundos de partida y predice la siguiente entrada del mando. La primera versión (6M de parámetros) perdió las 12 partidas contra la CPU de nivel 9; una de 20M ganó 1 de 12. Lo que marcó la diferencia fueron los datos: la mejor hasta ahora, `bc-20m-ft`, se preentrena con 1.400 millones de fotogramas de partidas de rango Pro y Master con todos los personajes, y luego se ajusta con Yoshi con 2 a 4 fotogramas de retraso, como en el juego online. Ganó 5 de 6 contra la CPU de nivel 9 y sus primeras partidas contra la Marth de MIMIC (2 de 6) y el Yoshi de HAL (1 de 6), pero sigue perdiendo todas contra Phillip, el Fox de HAL y Faynt. Después probé la segunda mitad de la receta, [RL](https://github.com/mateo19182/melee-llm/tree/main/train/meleebot/rl) jugando contra sí mismo en el simulador. Allí llegó a ganar a su maestro un 80% de las veces hacia la iteración 100, luego se hundió, y esas versiones jugaban peor que `bc-20m-ft` en el juego real. Lección aprendida: el simulador es genial por velocidad, pero una versión solo cuenta cuando gana en Dolphin.

**Jugar contra ellos.** Puedes jugar contra cualquiera de estos bots con un mando en tu propio ordenador con [`play.py`](https://github.com/mateo19182/melee-llm/blob/main/play.py); jugar contra ellos por netplay desde la web es lo siguiente. La clasificación tiene un hueco esperando resultados humanos.

---

## Qué aprendí

- En tiempo real, la latencia lo es todo. Un modelo puntero que toma buenas decisiones no vale nada si llegan con dos segundos (120 fotogramas) de retraso.
- El sitio interesante para un LLM es por encima de una política rápida, no en su lugar, e incluso ahí hay que compararlo con la referencia más tonta posible. "Orden al azar" y "Don't die." fueron los controles más útiles que probé.
- Los bots se hicieron fuertes con repeticiones humanas y juego contra sí mismos, no razonando, y lo consiguen con decenas de millones de parámetros en una sola GPU doméstica.
- Una ejecución por modelo no ordena nada. Las ejecuciones del mismo modelo se dispersan cientos de puntos, y el bot inicial importó más que el modelo.

## Qué viene ahora

Le doy una o dos semanas más, ya sin los LLM en el centro. Para m19182-yoshi el objetivo ahora es el mejor Yoshi que pueda hacer siguiendo más de cerca las recetas publicadas: de momento solo he usado un 10% del dataset de HAL, y el juego contra sí mismo necesita una señal de aprendizaje mejor antes de ayudar. Lo otro que quiero probar es búsqueda al estilo TAS en el simulador: ya [guarda y restaura](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/sim/world.py) partidas enteras a unas 100 veces la velocidad de Dolphin, que es el montaje que usan los buscadores por fuerza bruta de Mario 64. Podría responder preguntas como "¿hay alguna forma de sobrevivir a este edgeguard?" o etiquetar el mejor movimiento desde posiciones de repeticiones reales para entrenar al bot. Las pegas: el simulador solo hace partidas versus y su RNG no es el de Dolphin. También está en la lista meter a m19182-yoshi y a mí mismo en el benchmark, y conseguir que la gente juegue contra los bots.

![Yo presentando el proyecto en 1hack, delante de la diapositiva sobre diez años de bots de Melee](/data/melee/talk-1hack.webp)

*Presentándolo en [1hack](https://1hack.eu/) el 14 de noviembre.*

---

Construido sobre [Slippi](https://slippi.gg), [libmelee](https://github.com/vladfi1/libmelee), [Slippi Lab](https://github.com/frankborden/slippilab) y [melee-sim-light](https://github.com/kyhavlov/melee-sim-light), con los bots de vladfi1 (Phillip), Eric Gu (HAL), erickfm (MIMIC) y Frisson Labs (Faynt, Reyn), Jev de TypeSafe y voces de ElevenLabs.

[^1]: Si te interesa saber más, recomiendo mucho [AsumSaus](https://www.youtube.com/@AsumSaus/videos).
