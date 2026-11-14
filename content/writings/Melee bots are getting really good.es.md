---
title: Los bots de Melee se están poniendo muy buenos
summary: "Diez años de bots de Super Smash Bros. Melee, y unos cuantos LLM, en una sola escala Elo, más un bot propio."
---
Melee salió en 2001 y la gente lo sigue jugando de forma competitiva. Va a 60 fotogramas por segundo y no espera a nadie: un segundo pensando son 60 fotogramas en los que te pueden golpear, agarrar y tirar del escenario. Eso lo hace un objetivo difícil para cualquier IA, y su comunidad ha montado herramientas abiertas absurdamente buenas: [Slippi](https://slippi.gg) para jugar online y guardar repeticiones, [libmelee](https://github.com/vladfi1/libmelee) para leer el juego y pulsar botones desde Python, e incluso una descompilación del propio código del juego.

![Fox haciendo wavedash, L-cancel y dash dance en Final Destination, con el stick y los botones pulsados en cada fotograma](/data/melee/tech-es.webp)

*Tres técnicas de Melee, redibujadas a media velocidad desde repeticiones del benchmark, con los controles debajo.*

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

O sea: los bots más fuertes se pueden descargar y ejecutar en una sola GPU doméstica, uno de ellos entiende lenguaje, el juego se puede simular mucho más rápido que en tiempo real, clonar un bot decente cuesta unos pocos dólares y hay una clasificatoria pública donde probarlo. Nadie los había puesto a todos en una misma escala, ni se había preguntado dónde encaja un LLM entre ellos.

Ninguno de estos bots mira la pantalla. Leen la memoria del juego en cada fotograma (posiciones, velocidades, animación, daño) y responden con el estado completo de un mando. Y casi todos comparten receta: copiar a humanos a partir de repeticiones y luego mejorar jugando contra sí mismos. Es AlphaGo sin la búsqueda, porque en 16 milisegundos no hay tiempo de mirar jugadas por delante ni forma de rebobinar. Son diminutos al lado de un LLM (de 10M a 247M de parámetros) y responden en unos pocos milisegundos por fotograma. Reyn, pese al lenguaje, no lleva ningún LLM dentro: se entrenó con repeticiones etiquetadas con órdenes, y un pequeño enrutador traduce lo que escribas a un menú fijo de unas 100. Ese detalle importa más adelante.

---

## El benchmark

Todo corre en mi servidor de casa: el juego real en el emulador Dolphin de Slippi, una docena de partidas a la vez y Python manejando mandos virtuales. Todas las partidas son Fox contra Fox en dos escenarios de torneo. Participan las CPU del juego, tres bots sencillos programados a mano, los cinco bots aprendidos publicados (Phillip en varios niveles, HAL, MIMIC, Faynt y Reyn) y LLM.

Los LLM son demasiado lentos para pulsar botones en cada fotograma (un fotograma son 16,7 ms y una respuesta tarda de 1 a 3 segundos), así que cada montaje les da una tarea de más alto nivel y deja los fotogramas a algo más rápido. Leen unas 150 palabras de texto que describen el momento y:

1. **Juegan, sin límite de tiempo**: eligen un movimiento (`laser`, `shine`, `wavedash`, `recover`...) y el juego se pausa mientras piensan. Esto mide solo lo buenas que son sus decisiones.
2. **Juegan, en directo**: lo mismo a velocidad real, con un comportamiento seguro por defecto mientras el modelo piensa. Las respuestas con más de 2 segundos se descartan.
3. **Juega Jev**: [Jev, de TypeSafe](https://typesafe.ai/blog/introducing-system-one-models-and-jev), un modelo de decisión rápido que responde preguntas tipo test en unos 0,15 segundos.
4. **Entrenan a Reyn**: Reyn juega cada fotograma y cada 5 segundos el entrenador elige una de sus órdenes.
5. **Escriben un bot**: un agente de programación tiene 30 minutos, un sandbox y una herramienta de práctica para escribir un bot en Python que luego juega como cualquier otro participante.

Todo entra en un único ajuste Elo con la CPU de nivel 9 fijada en 1500 (400 puntos de diferencia significan que el más fuerte gana unas 10 partidas de cada 11). Nadie eligió las partidas a mano: un planificador escogía la siguiente cada pocos segundos, priorizando las que más estrechaban los intervalos más anchos por menos tokens. Durante la noche jugó 1.573 partidas en 9 horas.

![Clasificación en tiempo real: el Elo de cada participante con su intervalo del 95%, coloreado por tipo](/data/melee/leaderboard-realtime.svg "wide")

Los bots aprendidos van muy por delante. **Faynt no perdió nunca**: 390-0, la mayoría contra Phillip gm, así que su 3358 es en realidad un mínimo. Después vienen Phillip gm (2488) y HAL (2234). Una curiosa: en un espejo de Fox el nivel de la CPU apenas importa. La de nivel 1 (1250) queda por encima de la de nivel 5 (1194), porque la CPU de Fox no para de tirarse del escenario ella sola, y eso pesa más que su nivel.

---

## Dónde quedaron los LLM

### Jugando: la velocidad gana a la inteligencia

![Elo sin límite de tiempo frente a Elo en tiempo real para cada modelo, con el porcentaje de respuestas en directo descartadas por llegar tarde](/data/melee/latency-tax.svg "wide")

Con tiempo para pensar, GPT-6.1 Sol gana a la CPU de nivel 9 (1692) y el resto de modelos quedan entre 1327 y 1438. En directo todo eso desaparece: todos los modelos caen de 272 a 578 puntos y acaban más o menos al nivel de una CPU de nivel 4 (de 1055 a 1114), empatados entre sí y con Jev. Las respuestas de Sol tardan 2-3 segundos, así que el 95% llegan tarde y se descartan. Sol en directo es básicamente mi comportamiento por defecto con un LLM metiendo baza de vez en cuando. Incluso Haiku, lo bastante rápido como para que solo se descarte el 5% de sus respuestas, actúa sobre un estado del juego de hace unos 70 fotogramas, que en Melee son varios intercambios atrás.

[LLM Colosseum](https://github.com/OpenGenerativeAI/llm-colosseum) vio lo mismo en Street Fighter (GPT-3.5 ganaba a GPT-4 por ser más rápido); aquí está en una escala con barras de error.

Las capturas de pantalla tampoco ayudan: con una imagen en lugar del texto, Haiku casi nunca se daba cuenta de que estaba colgado del borde. Todos los modelos leían los porcentajes de daño casi a la perfección y acertaban izquierda/derecha más o menos al azar.

### Entrenando: dos palabras ganan

![Puntuación de Reyn sin órdenes, con órdenes al azar, con cada LLM y Jev como entrenador, y manteniendo "Don't die." toda la partida](/data/melee/coaching.svg "wide")

Esta fue la sorpresa. Reyn sin órdenes puntúa 1746, y con cualquier entrenador sube unos 300 puntos hasta el nivel de HAL. Pero un "entrenador" que elige una orden al azar cada 5 segundos sin mirar la partida consigue la mayor parte de esa subida (2068), y los cuatro LLM entrenadores no se distinguen de él. Así que investigué más:

- A Reyn le basta casi con *cualquier* orden. Una sola orden al azar mantenida toda la partida ya lo sube a 2018.
- **Mantener "Don't die." ("no te mueras") toda la partida, sin entrenador, puntúa 2398**, por encima de todos los LLM entrenadores.
- Jev es el único entrenador claramente mejor que el azar (2346), y por accidente: su elección favorita es "kill now" ("mata ya"), que el enrutador de Reyn traduce, siempre, a... "Don't die."

Los LLM eligen planes que suenan sensatos (edgeguard, jugar agresivo) y que resultan valer menos que el aburrido. La lección va menos de LLM que del bot, y de cómo una interfaz de lenguaje puede convertir tus palabras en otra cosa sin que te enteres.

### Programando: una CPU 9 en 30 minutos

La primera tanda fue una sesión de 30 minutos de Claude Code por modelo, y los bots quedaron alrededor de la CPU de nivel 9, con dos ejecuciones del mismo modelo más distintas entre sí que modelos diferentes. Así que después hice una ronda en condiciones: nueve sesiones, tres de cada uno de Opus, Sonnet y Haiku 5.5 con esfuerzo medio, y cada bot jugó unas 28 partidas en una clasificatoria aparte (con su propio ajuste, otra vez con la CPU 9 en 1500).

Esta vez Opus quedó claramente por delante, con una media de 1813 y un máximo de 1929. Dos de sus bots ganaron sus 24 partidas contra las CPU de nivel 7 a 9 y le sacaron partidas a MIMIC. Sonnet promedió 1186 y Haiku 1116, y la dispersión dentro de un mismo modelo sigue siendo grande (los bots de Haiku van de 804 a 1423). Un matiz: estas nueve corrieron a la vez en una máquina cargada y con esfuerzo medio, a diferencia de la primera tanda, así que yo no compararía las dos directamente.

---

## Qué más salió de esto

**Una web** para verlo todo, vestida como los menús del propio Melee: las clasificaciones con una página por participante, cada partida del servidor dibujada en 2D en directo, un lanzador para cualquier enfrentamiento, todas las repeticiones con las decisiones de la IA en una línea temporal y una página Live que emite el juego real.

**Una cabina de comentarios con IA** en esa página Live. Dos comentaristas, Charlie en la narración ("ruidoso, rápido, pierde la cabeza en los momentos grandes") y Laura en el análisis ("ingenio seco, se mete con Charlie"). Un LLM rápido sigue los eventos de la partida y escribe una frase cada pocos segundos, y ElevenLabs les pone voz, solo mientras alguien escucha. Un intercambio real:

> **Charlie:** HAL MASTER's Fox is in the air and Faynt's Marth is waiting for him!
> **Laura:** Waiting is the right word. Faynt doesn't chase, Charlie, he collects.

**Un simulador.** Conecté todos los jugadores, bots aprendidos incluidos, a melee-sim-light y lo comprobé contra 300 repeticiones: 287 coincidieron fotograma a fotograma (las otras 13 eran archivos sin terminar), unas 100 veces más rápido que el emulador. La pega es que no tiene las CPU del juego.

**Un bot propio, m19182-yoshi.** Un transformer pequeño que copia el juego humano, como hizo HAL: lee los últimos 4 segundos de partida y predice la siguiente entrada del mando. La primera versión (6M de parámetros) perdió las 12 partidas contra la CPU de nivel 9; una de 20M ganó 1 de 12. La actual, `bc-20m-amsa`, tiene 20M de parámetros entrenados con las 21.896 partidas de Yoshi de aMSa del dataset público de HAL, y ganó 3 de 12. Sigue por debajo de la CPU más difícil, pero va llegando. Ya juega en la clasificatoria de bots de stomped.dev desde mi servidor de casa.

**Jugar contra ellos.** Puedes jugar contra cualquiera de estos bots con un mando en tu propio ordenador con `play.py`; jugar contra ellos por netplay desde la web es lo siguiente. La clasificación tiene un hueco esperando resultados humanos.

---

## Qué aprendí

- En tiempo real, la latencia lo es todo. Un modelo puntero que toma buenas decisiones no vale nada si llegan con dos segundos (120 fotogramas) de retraso.
- El sitio interesante para un LLM es por encima de una política rápida, no en su lugar, e incluso ahí hay que compararlo con la referencia más tonta posible. "Orden al azar" y "Don't die." fueron los controles más útiles que probé.
- Los bots se hicieron fuertes con repeticiones humanas y juego contra sí mismos, no razonando, y lo consiguen con decenas de millones de parámetros en una sola GPU doméstica.
- Una ejecución por modelo no ordena nada. Los números del bot-writer solo empezaron a significar algo con tres ejecuciones de cada uno, e incluso así se dispersan cientos de puntos.

## Qué viene ahora

Le doy una o dos semanas más, ya sin los LLM en el centro. Ahora mismo se está entrenando una versión más grande de m19182-yoshi (`bc-20m-v3`: 44.805 partidas de Yoshi, 444M de fotogramas, con aMSa etiquetado como "pro"), y después toca el juego contra sí mismo en el simulador, que es donde los bots publicados se hicieron fuertes. La idea es ver hasta dónde sube en stomped.dev y, de paso, aprender cómo se entrenan de verdad estos bots. También está en la lista meter a m19182-yoshi y a mí mismo en el benchmark, y conseguir que la gente juegue contra los bots.

![Yo presentando el proyecto en 1hack, delante de la diapositiva sobre diez años de bots de Melee](/data/melee/talk-1hack.webp)

*Presentándolo en [1hack](https://1hack.eu/) el 14 de noviembre.*

---

Construido sobre [Slippi](https://slippi.gg), [libmelee](https://github.com/vladfi1/libmelee), [Slippi Lab](https://github.com/frankborden/slippilab) y [melee-sim-light](https://github.com/kyhavlov/melee-sim-light), con los bots de vladfi1 (Phillip), Eric Gu (HAL), erickfm (MIMIC) y Frisson Labs (Faynt, Reyn), Jev de TypeSafe y voces de ElevenLabs.
