---
title: Los bots de Melee se están poniendo muy buenos
summary: "Diez años de bots de Super Smash Bros. Melee, y unos cuantos LLM, en una sola escala Elo, más un bot propio y una búsqueda por fuerza bruta de lo que harían dos Fox perfectos."
---
Super Smash Bros Melee salió en 2001 para la [GameCube](https://en.wikipedia.org/wiki/GameCube), y es uno de los videojuegos con el techo (y el suelo) de habilidad más alto que conozco; prueba de ello es que hay muchísima gente que lo sigue jugando de forma profesional. No soy nada bueno, SSB4 fue el único en el que eché horas, pero sé lo suficiente para entender su complejidad, y es impresionante. [^1]

Su dificultad se puede dividir en 2 niveles. En el nivel bajo, el juego va a 60 fps y muchas técnicas tienen solo una ventana de 1-2 fotogramas para hacerlas bien (¡sin buffer de entradas!). Los jugadores competitivos de Melee hacen de media 6 acciones por segundo, y tienen que dominar técnicas como el wavedash, el L-cancel o el dash dance. Algunas de estas técnicas no las previeron los desarrolladores, lo que para mí lo hace aún más interesante.

En el nivel alto es más un juego mental. Los humanos reaccionan en unos 12 fotogramas y muchos ataques son más rápidos que eso, así que casi siempre estás prediciendo al rival, no reaccionando. Los buenos jugadores se pasan partidas enteras condicionando al otro para que espere algo. Disfruto viéndolo mucho más que cualquier otro juego de lucha porque no depende tanto de los combos y es mucho más "libre".

![Fox haciendo wavedash, L-cancel y dash dance en Final Destination, con el stick y los botones pulsados en cada fotograma](/data/melee/tech.webp)

Había visto algo de movimiento en twitter sobre avances recientes de bots de IA enfrentándose a algunos jugadores top, cosa que me pareció increíble, y decidí explorarlo durante [1hack](https://1hack.eu/), un evento donde nos juntamos 24 horas para construir lo que se nos ocurra, ¡y acabé dando una [pequeña charla](/data/melee/talk-1hack.webp) al final!

Empecé con una idea vaga de poner a LLM a jugar directamente. Algunas de las mejores formas de medir el rendimiento de los últimos modelos se basan en ponerlos a jugar a [juegos fuera de su distribución de entrenamiento](https://arcprize.org/arc-agi). La mayoría de benchmarks de juegos son por turnos ([ajedrez](https://maxim-saplin.github.io/llm_chess/#leaderboard), [Pokémon](https://dl.acm.org/doi/10.1145/3771095), [Slay the Spire](https://arxiv.org/abs/2610.12596)... están saliendo un montón últimamente). Esto no funcionó como esperaba, pero me enganchó al tema; mi objetivo con este post es escribir lo que me habría gustado leer cuando empecé a aprender.

Creo que es un momento muy emocionante para meterse en esto, ¡con mucho trabajo por hacer y cosas fáciles por las que empezar!


## Un poco de historia

Melee en sí se hizo en unos 13 meses (rapidíiisimo) y fue el juego más vendido de la GameCube. El juego venía con CPU incorporadas, de nivel 1 a 9. No son gran cosa y cualquier jugador con experiencia les gana fácilmente, sobre todo porque repiten movimientos y estrategias constantemente. No fue hasta 2015 cuando Dan "altf4" Petro presentó [SmashBot](https://www.youtube.com/watch?v=_0Z_oN_CZyA) (¡gran charla de DEFCON!), un bot de Fox que escribió a mano usando [GOFAI](https://en.wikipedia.org/wiki/Symbolic_artificial_intelligence). Su principal ventaja era que actuaba perfecto al fotograma y con tiempo de reacción cero, pero los jugadores entendieron rápido sus tácticas y las explotaron hasta que se parchearon a mano. Aun así, el trabajo duro de hacer ingeniería inversa del juego acabó convirtiéndose en [libmelee](https://github.com/vladfi1/libmelee), sobre la que se construyen casi todos los bots desde entonces.

### La partida de Melee óptima

Un breve intermedio para hablar de un experimento mental que Dan [comparte al final de su charla](https://youtu.be/_0Z_oN_CZyA?t=2207): ¿qué jugarían dos bots perfectos entre sí? ¡Me metí hasta el fondo de la madriguera con este!

<details markdown="1">
<summary>Dos Fox perfectos: el punto muerto por fuerza bruta</summary>

Parafraseando, su respuesta fue:

> Cualquier proyectil se puede reflejar en una ventana de dos fotogramas, así que lanzarlos no sirve de nada.
>
> El movimiento más rápido del juego es el shine de Fox, que golpea en su primerísimo fotograma. Así que dos Fox perfectos caminan el uno hacia el otro hasta estar justo a distancia y hacen shine en el mismo fotograma. Los shines se anulan[^3], y a partir de ahí es un punto muerto.
>
> Lo mejor para los dos es saltar y hacer multishine, perfecto al fotograma, hasta que se acabe el tiempo. Entonces la partida va a Muerte Súbita, donde caen bob-ombs del cielo, aparentemente al azar.
>
> Pero no son aleatorias, el RNG de Melee es predecible[^2]. La verdadera estrategia óptima es entonces llevar la partida para que, cuando el punto muerto acabe ocho minutos después, el generador esté en un estado que suelte las bombas donde tu rival tenga que elegir entre meterse en tu shine o en una bomba.

Como soy fan de este tipo de experimentos mentales, le busqué algunos agujeros, y como ahora tenemos el código fuente descompilado acabé intentando sacar la respuesta por fuerza bruta. Eso se convirtió en [melee-brute](https://github.com/mateo19182/melee-brute), un fork que hice de [melee-sim-light](https://github.com/kyhavlov/melee-sim-light) que puede explorar el espacio de búsqueda mucho más rápido que cualquier emulador tradicional. Sinceramente, es solo un montón de trucos ingeniosos de Fable optimizando para este caso de uso, ¡pero creo que puede ser bastante útil para otras cosas!

El punto muerto parece ser real, pero no por ese motivo. Acercarse y hacer shine no es en realidad lo mejor. Su alcance es diminuto (10 unidades), y el jab de Fox golpea desde 21, así que el otro simplemente te hace jab mientras te acercas.

Luego pensé que a lo mejor algún otro personaje puede golpear a Fox de una forma a la que no pueda reaccionar (puede leer la memoria del juego, así que ve cada movimiento en el fotograma en que empieza). Así que probé los movimientos de todos los personajes contra un Fox que responde al fotograma siguiente, desde una distancia de 12 a 40[^4], y no pasó nada. Lo castiga o lo bloquea todo, sobre todo con shine o un jab.

El primer fotograma del shine hace casi todo el trabajo. Fox es intangible en él, y en el suelo su hitbox choca con la del atacante, así que incluso un jab de fotograma 2 desde cerca pierde contra él. También es el único movimiento del juego que golpea antes de que nadie pueda reaccionar, así que nadie puede quedarse en ese pequeño círculo alrededor de Fox. Falco tiene el mismo shine, pero llega a 8 en vez de a 10.

![Dos Fox a 7 unidades hacen shine en el mismo fotograma: las hitboxes chocan, los dos se congelan 4 fotogramas y nadie recibe daño](/data/melee/fox-clank.webp "wide")

Así que si alguien gana, es un Fox, y la pregunta de verdad es el ditto de Fox.

Hay una cosa que no necesita ninguna búsqueda: una partida en Final Destination empieza como una imagen especular, así que cualquier plan que tenga un Fox, el otro puede jugarlo reflejado. Ninguno de los dos puede ir por delante desde el principio.

O los dos pueden quedarse ahí quietos y seguros para siempre (el punto muerto de Petro), o los dos se ven obligados a adivinar de una forma que acaba equilibrándose.

Hasta ahora he supuesto que un Fox se mueve y el otro reacciona. Pero cuando los dos tienen que elegir en el mismo fotograma, a un Fox que simplemente se queda quieto se le puede obligar a adivinar: acércate, para a 13,2 y echa el stick hacia atrás de golpe. Ahora azul tiene que elegir entre hacer shine, apartarse o esperar, un piedra-papel-tijera donde cada lado conecta el primer golpe el 12,5% de las veces.

![El Fox atacante (rojo) camina durante 182 fotogramas y echa el stick hacia atrás justo fuera del alcance del shine. Se muestra dos veces con la misma entrada de rojo: azul se gira para irse y recibe el golpe, azul se queda quieto y no](/data/melee/fox-flick.webp "wide")

*Rojo camina durante 3 segundos y echa el stick hacia atrás a 13,2 unidades. La misma entrada de rojo dos veces: primero azul intenta irse y se come el shine, luego azul se queda quieto y no pasa nada. Azul tiene que elegir sin ver cuál de las dos es.*

Hay dos salidas. Si nunca quiere adivinar, retrocede a 13,7, la única entrada que es segura aunque el atacante la vea venir, y el amago nunca llega a pasar:

![El mismo paseo, pero azul hace dash hacia atrás a 13,7 unidades antes de que rojo pueda hacer el amago. Nadie recibe el golpe](/data/melee/fox-retreat.webp "wide")

O acepta adivinar: en el juego justo, acercarse a esa distancia le vale exactamente 0 al atacante, y lo mejor para los dos es esperar. Si hubiera alguna forma de obligar al defensor a mantener el escudo, o de que el atacante le alcanzase desde el aire, el atacante podría sacar ventaja, pero simplemente no hay forma de obligar a un Fox quieto a hacer eso.

El atacante podría intentar seguir acercándose hasta que no quede escenario. Esa es la idea del acorralamiento: si cada acercamiento a 13,7 hace que un Fox que nunca adivina ceda un poco de terreno, tarde o temprano el escenario se acaba en el borde.

Con el defensor de espaldas al borde y los dos a distancia de shine sigue siendo un juego de adivinar, pero ya no está igualado. Jugado 100 veces, mirando 8 fotogramas por delante (unos 16 millones de estados de juego), el atacante conecta el primer golpe o el defensor se cae del escenario ≈ 34 veces, el defensor lo conecta ≈ 8, y ≈ 58 veces nadie recibe golpe.

![Azul, de espaldas al borde, hace shine al escudo de rojo. El retroceso saca a azul del escenario mientras todavía mantiene el shine](/data/melee/fox-ledge.webp "wide")

El acorralamiento solo funciona contra un Fox que se niega a adivinar nunca, y uno perfecto no tiene por qué. En medio del escenario, la adivinanza que ofrece el atacante vale lo mismo para los dos, así que puede aceptarla ahí en vez de retroceder hasta un borde malo.

Así que, hasta donde puedo buscar, es tablas: nadie puede atacar primero, el ditto está igualado, y las adivinanzas a las que se puede obligar a un Fox también lo están, salvo en un borde al que nadie te puede empujar. Aunque eso no es llegar muy lejos: cada búsqueda mira 8 fotogramas por delante, el menú no tiene láseres, wavedashes ni dash dance, y la mayoría de posiciones están colocadas a mano. El resto de experimentos están en la [página de Brute](https://melee.m19182.dev/brute), y puede que se me escape algo, así que si tienes alguna idea, ¡escríbeme!

</details>

### Volviendo a la historia

En 2017, Vlad Firoiu publicó [Phillip](https://arxiv.org/abs/1702.06230), entrenado de principio a fin con RL asíncrono. Entrenó una red por personaje y usó una recompensa ingenua (KOs + daño hecho*peso) con [actor-crítico](https://en.wikipedia.org/wiki/Actor-critic_algorithm) y juego contra sí mismo. Llegó a ganar a algunos jugadores profesionales, aunque sobre todo porque podía reaccionar en unos 2 fotogramas cuando un humano necesita unos 12. Aun así era bastante explotable: algunos jugadores descubrieron que con solo agacharse en el borde acababa suicidándose.

Ese mismo año, [Sharma y Friedman](https://www.yash-sharma.com/files/learning-play-super%20(3).pdf) entrenaron una DQN recurrente que tenía que actuar con 12 fotogramas de retraso, más parecido a un humano. El propio [seguimiento](https://arxiv.org/abs/1810.07286) de Vlad en 2018 ("At Human Speed") hizo lo mismo con Phillip: el RL a secas se hundía con el retraso, y añadir un modelo aprendido que predice el juego lo recuperaba.

En los años siguientes [Slippi](https://slippi.gg/) se hizo popular, con archivos de repetición, netplay con rollback, una clasificatoria... Acumular cientos de miles de partidas humanas grabadas de las que aprender cambió la receta: primero copiar a humanos, luego mejorar con RL. [Project Nabla](https://web.archive.org/web/20221013224436/https://bycn.github.io/2022/08/19/project-nabla-writeup.html) (Bryan Chen, 2022) fue un ejemplo temprano: una red recurrente pequeña clonada de unas 100k repeticiones de torneo, y luego PPO, jugando con 2 fotogramas de retraso.

Ninguno de estos bots mira la pantalla. Leen la memoria del juego en cada fotograma (posiciones, velocidades, animación y en qué punto va, daño) y responden con el estado completo de un mando. [AlphaStar de DeepMind para StarCraft II](https://deepmind.google/blog/alphastar-mastering-the-real-time-strategy-game-starcraft-ii/) siguió la misma receta: tiempo real, clonado de repeticiones humanas, y luego juego contra sí mismo con una penalización por alejarse del juego humano.

El gordo es el segundo Phillip de Vlad, [slippi-ai](https://github.com/vladfi1/slippi-ai): en desarrollo desde 2020 y jugando contra jugadores top en 2024, primero copió a humanos a partir de repeticiones de ranked y de profesionales, y luego mejoró jugando contra sí mismo, con un retraso de reacción humano incorporado: ve el juego con 18 a 24 fotogramas de retraso. Es una red recurrente que elige el mando en dos pasos, una de 728 combinaciones de botones, gatillos y C-stick, y luego una de 85 posiciones del stick principal. Zain [le ganó 5-3](https://www.youtube.com/watch?v=c8nRFAGvr2c) y Moky [perdió 3-10](https://www.youtube.com/watch?v=1kviVflqXc4).

No mucho después, en 2025, Eric Gu publicó [HAL](https://ericyuegu.com/behavior-cloning-melee/) (solo Fox): un transformer de 20M clonado de partidas de Fox de profesionales por unos 5 $ de cómputo, que ganaba a la CPU de nivel 9 el 95% de las veces. erickfm llevó la misma receta a [MIMIC](https://github.com/erickfm/MIMIC), un modelo de unos 20M por personaje, con una cabeza dedicada a los botones para poder hacer wavedash y un poco de RL sobre cosas como el porcentaje de L-cancel. Luego llegó un [HAL escalado](https://ericyuegu.com/hillclimbing-melee/): 247M de parámetros con 256 fotogramas de contexto, dirigido pidiéndole un nivel de juego o el estilo de un jugador. Predice 4 fotogramas de entradas a la vez para esconder su tiempo de cómputo, y Gu vio que un fotograma de retraso de reacción hace el doble de daño que un fotograma actuando sin información nueva.

Ahora, a finales de 2026, Frisson Labs publicó [Faynt](https://www.frisson-labs.com/faynt) ([artículo](https://arxiv.org/abs/2610.02144)), un solo transformer de 10M de parámetros que juega con los 26 personajes. Se entrena en tres fases: clonación de comportamiento con unas 840.000 repeticiones de ranked, un "currículo de ganadores" que acaba en partidas ganadas por jugadores de rango Master (destilado de un hermano de 75M), y luego RL jugando contra sí mismo en espejos de Fox con 96 emuladores en una GPU. Juega con retraso de reacción cero y ganó 240 de 244 partidas contra las versiones públicas de Phillip. Le siguió [Reyn](https://www.frisson-labs.com/reyn), un bot que diriges con órdenes en inglés, pero sin ningún LLM dentro: Frisson etiquetó repeticiones humanas con instrucciones generadas por reglas ("esto es un agarre"), entrenó la política para seguirlas, y luego la congeló y entrenó pequeños adaptadores con RL. Un enrutador traduce lo que escribas a un menú fijo de unas 100 órdenes, o lo rechaza. Ese detalle importa más adelante.

![Una partida del benchmark redibujada desde su repetición: Faynt (azul) le quita una vida a Phillip (rojo), los dos con Fox en Final Destination](/data/melee/replay-2d.webp)

*14 segundos de una partida del benchmark, redibujados desde el archivo de repetición: Faynt (azul) le quita una vida a Phillip (rojo), los dos con Fox.*

Todos son diminutos al lado de un LLM (de 10M a 247M de parámetros), responden en 2 a 8 milisegundos por fotograma en una GPU doméstica, y su fuerza sale de repeticiones humanas más juego contra sí mismos, no de razonar.

Todo este trabajo tan chulo lo hace posible la comunidad (como la recién abierta [stomped.dev](https://stomped.dev), una clasificatoria solo para bots con una comunidad de discord muy maja), que ha construido con el tiempo las herramientas abiertas que permiten este tipo de experimentos, y que hace poco usó IA para completar la [descompilación](https://github.com/doldecomp/melee) de todo el código de Melee, de la que también salió [melee-sim-light](https://github.com/kyhavlov/melee-sim-light), que ejecuta el juego descompilado sin emulador, unas 100 veces más rápido que Dolphin sin interfaz.

### TAS

Junto a los bots también hay una escena de juego asistido por herramientas (TAS): una secuencia construida fotograma a fotograma en un emulador. La reproducción es determinista, y se usa sobre todo para enseñar los límites del juego. Tengo la sensación de que mi fork podría ser útil aquí, pero nunca me metí, así que no estoy seguro.

Empezó en 2005 con vídeos de [Action Replay](https://www.supercheats.com/gamecube/supersmashbrosmeleeactionreplaycodes.htm) hechos en el modo de depuración oculto del juego, que avanza fotograma a fotograma. Hacia 2010 Dolphin tuvo herramientas TAS de verdad (estados guardados, avance por fotograma, películas de entradas), y más tarde scripts en Lua encima, como [ssbm-lua-core](https://github.com/practicaltas/ssbm-lua-core) de PracticalTAS. Algunas obras chulas: [combos que acaban todos en exactamente 69 golpes](https://www.youtube.com/watch?v=F-mUcQXeSSc), y [Target Test con los 25 personajes](https://tasvideos.org/7174S) en 2:39.97 de tiempo de juego. Muchos hallazgos vuelven al juego humano.


## Benchmark

Usando el emulador Dolphin de Slippi, Fox contra Fox en FD y Battlefield, metí todos los bots relevantes que encontré y un par de experimentos míos. Todo entra en un [único ajuste Elo](https://github.com/mateo19182/melee-llm/tree/main/melee_llm/bench) con la CPU de nivel 9 fijada en 1500. Luego lo dejé toda la noche jugando miles de partidas: 4.082 partidas puntuadas al final.

Los LLM son un caso especial, porque son demasiado lentos para pulsar botones en cada fotograma (16,7 ms), así que cada montaje les da una tarea de más alto nivel y deja los fotogramas a algo más rápido. Leen unos 500 tokens de [estado del juego](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/state.py) con una ventana de contexto deslizante.

- [Juegan, sin límite de tiempo](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/agents/llm_paused.py): eligen un movimiento y el juego se pausa mientras piensan. Esto mide lo buenas que son sus decisiones.
- [Juegan, en directo](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/agents/llm_live.py): lo mismo pero sin pausas.
- [Juega Jev](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/agents/jev_player.py): [Jev, de TypeSafe](https://typesafe.ai/blog/introducing-system-one-models-and-jev), un modelo de decisión que responde preguntas tipo test en unos 0,15 segundos.
- [Reyn con coach](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/agents/coach.py): Reyn juega cada fotograma, y cada 5 segundos el LLM coach usa texto para condicionar su estilo de juego.
- [Escriben un bot](https://github.com/mateo19182/melee-llm/tree/main/melee_llm/botwriter): un agente de programación tiene 30 minutos, un sandbox y una herramienta de práctica para escribir un bot en Python que luego juega como cualquier otro participante.

![Clasificación en tiempo real: bots aprendidos, coaches, el mejor bot que escribió cada modelo con esfuerzo alto, CPU y LLM jugando en directo, cada uno con su intervalo del 95%, coloreados por tipo](/data/melee/leaderboard-realtime-light.svg "wide")

Los bots aprendidos van muy por delante. Faynt no perdió nunca (370-0, así que su 3403 es en realidad un mínimo), luego Phillip gm (2549) y HAL (2300). Las CPU suben en orden, de 976 la de nivel 1 a 1500 la de nivel 9: menos distancia que los 1.000 puntos entre la de nivel 9 y Phillip gm.

### LLM

#### Jugando

![Elo sin límite de tiempo frente a Elo en tiempo real para cada modelo, con el porcentaje de respuestas en directo descartadas por llegar tarde](/data/melee/latency-tax-light.svg "wide")

Con tiempo para pensar, GPT-6.1 Sol gana a la CPU de nivel 9 (1729), el resto de modelos quedan entre 1254 y 1474, y todos ganan a Jev (1082). Un jugador que elige un movimiento al azar en cada decisión puntúa 732 aquí, así que pensar sí cuenta.
En directo, todo eso desaparece: todos los modelos caen de 492 a 851 puntos, por debajo de la CPU de nivel 1 (de 762 a 878).

Las capturas de pantalla tampoco ayudan: con una imagen en lugar del texto, los modelos rindieron en general peor. [LLM Colosseum](https://github.com/OpenGenerativeAI/llm-colosseum) vio algo parecido en Street Fighter (GPT-3.5 ganaba a GPT-4 por ser más rápido).


#### Como coach

![Puntuación de Reyn sin coach, con un coach al azar, con cada LLM y Jev como coach, y manteniendo "Don't die." toda la partida](/data/melee/coaching-light.svg "wide")

Reyn solo puntúa 1846. Con un LLM eligiendo una de sus ~100 órdenes cada 5 segundos, sube a unos 2300, el nivel de HAL. Pero casi todo eso no es mérito del LLM: un coach que elige órdenes al azar llega a 2141, y Reyn manteniendo "Don't die." ("no te mueras") toda la partida, sin ningún coach, llega a 2452, por encima de todos los LLM. Jev es el mejor coach (2403) por accidente: su orden favorita, "kill now" ("mata ya"), el enrutador de Reyn la traduce a... "Don't die."

O sea, los LLM ayudan un poco (cara a cara, tres de los cuatro ganan al coach al azar, por unos 170 de Elo), pero Reyn gana más con que le digan cualquier cosa, y sobre todo con que le digan que juegue seguro, que con planes ingeniosos. Una interfaz de lenguaje puede convertir tus palabras en otra cosa sin que te enteres.

#### Programando

Le di a Claude Code 30 minutos, un sandbox y una herramienta de práctica para escribir un bot en Python, partiendo de un bot de 60 líneas que va a por el rival y hace up-smash. Resulta que ese bot inicial, él solo, ya puntúa 1685, por encima de la CPU de nivel 9. Cinco sesiones para cada uno de Opus, Sonnet y Haiku:

![Bots escritos por Opus, Haiku y Sonnet en sesiones de 30 minutos: cinco de cada uno, con la media de cada modelo, junto a la CPU de nivel 9, el bot inicial y MIMIC](/data/melee/bot-writer-light.svg "wide")

Los tres acaban al nivel del bot inicial: Opus 1699 de media, Haiku 1686, Sonnet 1660. Las sesiones del mismo modelo difieren en cientos de puntos, y solo dos lo mejoraron claramente (la mejor, 1944, al nivel de MIMIC). O sea: 60 líneas con la idea correcta superan casi todo lo que añaden 30 minutos de un modelo fuerte.

## Entrenando mi propio bot

Después de encontrar un cruce entre aficiones mías como Melee y entrenar redes neuronales, lo natural era entrenar mis propios bots de IA. Estos han sido mis primeros pasos, apenas estoy entrando en la comunidad y entendiendo el estado del arte, ¡así que puede que haga una actualización más adelante!

Empecé entrenando mi propio transformer pequeño con repeticiones humanas de Yoshi, como hace HAL. El mejor ganaba a la CPU de nivel 9, pero perdía todas las partidas contra los bots serios, y el RL jugando contra sí mismo en el simulador lo empeoraba en el juego real. Para comprobar mi pipeline reentrené con él el Fox de 20M de HAL: ganó 2 de 24 contra la CPU, donde el de HAL gana el 95%. Así que lo dejé y usé HAL directamente: su modelo de 247M, pidiéndole que juegue como aMSa, es mejor Yoshi que cualquier cosa que entrené, sin entrenar nada.

Probé a hacer algunas primitivas para técnicas concretas de Yoshi y etiquetarlas en los datos de entrenamiento, pero no pareció servir de mucho.

El retraso parece uno de los mayores problemas por resolver. En stomped el bot ve el juego con 10 fotogramas de retraso, lo que le cuesta de 200 a 300 de Elo. Sigue haciendo double-jump cancel y L-cancel como aMSa, pero los parries contra Fox, que tienen que caer en los 6 fotogramas de arranque del escudo de Yoshi, pasan de 0,17 por minuto a casi ninguno (0,02). Reponderar el entrenamiento de HAL para el retraso no ayudó.

Ahora mismo estoy cambiando la base al modelo de 10M de Faynt, que juega con Yoshi mejor que HAL de serie, y montando RL contra los bots anti-Yoshi de Phillip dentro de melee-sim-light, unas 60 veces más rápido que Dolphin. ¡Más sobre eso en una próxima actualización!

## Qué más salió de esto

Una [web](https://github.com/mateo19182/melee-llm/tree/main/melee_llm/web) donde fui apuntando mis investigaciones y experimentos, con cada partida que se juega en directo en 2D y mis entrenamientos de modelos en directo, entre otras cosas.

Una [cabina de comentarios con IA](https://github.com/mateo19182/melee-llm/blob/main/melee_llm/commentary.py) con dos comentaristas. Un LLM rápido sigue los eventos de la partida y ElevenLabs les pone voz.

También estoy buscando cosas interesantes que hacer con [melee-brute](https://github.com/mateo19182/melee-brute). A su velocidad actual, solo puede llegar a una conclusión en situaciones muy restringidas, pero para preguntas como "¿había alguna forma posible de sobrevivir a este edgeguard concreto?" puede funcionar.

También estoy pensando en habilitar una forma de jugar contra mis bots en directo por netplay si hay interés. ¡Háblame!

[^1]: Si te interesa saber más, ¡recomiendo mucho [AsumSaus](https://www.youtube.com/@AsumSaus/videos) y [PracticalTAS](https://youtube.com/@practicaltas)!

[^2]: Sería prácticamente imposible que el bot controlase el RNG, porque los movimientos del rival también lo hacen avanzar. Además, con las reglas de torneo no hay Muerte Súbita: si se acaba el tiempo gana quien tenga menos porcentaje, y un empate a porcentaje se repite como una partida a una sola vida de 2 o 3 minutos, que se quedaría en punto muerto igual.

[^3]: Si los dos hacen shine en el mismo fotograma en el suelo, no se anulan en una guerra de multishines: las hitboxes chocan y los dos se congelan 4 fotogramas.

[^4]: Porque es lo más cerca que cualquier personaje puede ponerse de él en las mejores circunstancias.
