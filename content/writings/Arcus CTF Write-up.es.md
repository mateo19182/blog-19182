---
title: Write-up del Arcus CTF
---
Me enteré [por X](https://x.com/rodfernn/status/2061782265558966544) de esta empresa, AugustaLabs.ai, que acaba de levantar ronda y ha creado un CTF para buscar talento. Aunque parece que buscan gente portuguesa, confío en que ser gallego me dé alguna opción ;) 

Los otros write-ups que he visto parecen generados con LLMs en su mayoría. Creo en usar las herramientas disponibles al máximo, y casi toda esta investigación la hice con mucha ayuda de claude code y codex, pero no me parece apropiado [para escribir](https://samkriss.substack.com/p/if-you-let-ai-do-your-writing-i-will) un post como este. Parte de lo que hace bueno a un write-up es la voz única de quien lo escribe.

---

Te dan:

- Un checkpoint de PyTorch de ~200 MB, `ode.pt`.
- `ssh augustalabs.ai` , una TUI hecha con [Bubble Tea](https://github.com/charmbracelet/bubbletea) con un fragmento de un poema y un campo de texto para verificar la flag.

---

Empecé diseccionando el checkpoint, una arquitectura [nanoGPT](https://github.com/karpathy/nanogpt) estándar. La pista más relevante era el vocabulario, de tamaño 262.

256 de ellos son simplemente bytes en crudo, lo cual tiene sentido porque nanoGPT no usa tokenizer, ya que se supone que es la implementación mínima de un LM. Lo interesante son los otros 6:

```
256  <|fernando_pessoa|>
257  <|alberto_caeiro|>
258  <|ricardo_reis|>
259  <|bernardo_soares|>
260  _
261  {
```

Fernando Pessoa y tres de sus heterónimos. El nombre me sonaba vagamente pero tuve que buscarlo, y me alegro de haberlo hecho... fue escritor y traductor, muy importante para la literatura portuguesa (aunque no lo fue en vida — publicó un solo libro mientras vivía). Es conocido sobre todo por haber publicado con [al menos treinta](https://lithub.com/the-heteronymous-identities-of-fernando-pessoa/) de estos heterónimos, algunos de ellos con [filosofías, biografías y estilos literarios](https://www.casafernandopessoa.pt/en/fernando-pessoa/work/alvaro-de-campos) inventados.

Tuvo una vida interesante, increíblemente prolífico escribiendo, y todo un rabbithole lleno de buen lore y citas graciosas... se dedicó a leer y escribir mientras se ganaba la vida como traductor freelance de correspondencia comercial. El hombre estaba tan entregado a su obra que es posible que muriera virgen, y su única relación conocida se fue al traste por lo raro que era, como firmar las cartas que le mandaba a ella como Álvaro de Campos.

> I am now in full possession of the fundamental laws of literary art. Shakespeare can no longer teach me to be subtle, nor Milton to be complete. My intellect has attained a pliancy and a reach that enable me to assume any emotion I desire and enter at will into any state of mind. For that which it is ever an effort and an anguish to strive for, completeness, no book at all can be an aid. 
>
> de sus [notas personales.](http://arquivopessoa.net/textos/2251)

Vivió con un miedo constante a la locura ([se dice que vio su "cara desvanecerse" y ser sustituida por la de alguno de sus alter egos](https://en.wikipedia.org/wiki/Fernando_Pessoa)) y le interesaba mucho el misticismo, incluida la [Chaos Magick](https://en.wikipedia.org/wiki/Chaos_magic) (yo también tuve mi fase, y un borrador que puede que acabe algún día), e incluso se carteó con [Aleister Crowley](https://en.wikipedia.org/wiki/Aleister_Crowley) y tradujo obras suyas, llegando a ayudarle a [fingir su propio suicidio](https://web.archive.org/web/20060323064039/http://www.nthposition.com/themagicalworldof.php) en Lisboa...

El fragmento del poema en la pantalla del ssh, *Ode Triunfal*, lo escribió un alter ego que no aparece en el vocabulario: Álvaro de Campos. Era ingeniero naval, un futurista con un amor por las máquinas que se refleja en sus escritos, incluida la Oda.

---

Después de la prueba obligatoria de si `{alvaro_de_campos}` era la flag correcta (me habría decepcionado que lo fuera...), le pasé al modelo `<|alvaro_de_campos|>`. Con greedy decoding completa a `flag{Hup-la... He-ha... He-ho... Z-z-z-z...[EPSON W-02]`.[^1]

`EPSON W-02` es un [código de error de las impresoras epson](https://youtu.be/F-WiPTsKgZg) (atasco de papel), y `Hup-la... He-ha... He-ho... Z-z-z-z...` corresponde a los últimos versos de [Ode Triunfal.](http://arquivopessoa.net/textos/2459), onomatopeyas pensadas para imitar el sonido de los engranajes de una fábrica.

Pasarle los otros tokens especiales no devuelve nada relevante (" de carne e de carne"…), igual que pasarle los heterónimos tokenizados como sus bytes literales (dddddd…) — lo cual tiene sentido, porque la versión en bytes de `<|fernando_pessoa|>` nunca aparece en el entrenamiento, así que está completamente fuera de distribución.[^2]

Lo siguiente era averiguar si el modelo realmente se había entrenado con estos tokens o simplemente se habían añadido a mano, para no perder el tiempo aquí si era algún tipo de señuelo. Como `wte` y `lm_head` comparten la misma matriz de pesos (cada token tiene una sola fila que sirve tanto de embedding de entrada como de dirección del logit de salida), no hay forma de saber si este token se entrenó como entrada o como salida.

Este tipo de arquitectura suele inicializar los pesos como una gaussiana con desviación típica 0.02. Para un vector de 640 dimensiones eso da una longitud esperada (norma L2) de unos `0.02·√640 ≈ 0.506`. Midiendo esos valores obtenemos:


| token                    | norma     | vs init |
| ------------------------ | --------- | ------- |
| filas de bytes (media)   | 2.30      | ~4.5×   |
| heterónimos              | 0.72–0.82 | ~1.5×   |
| `_`                      | 1.58      | 3.1×    |
| `{`                      | 3.05      | 6.0×    |


Como seguía sin estar convencido, ya que los pesos se podrían haber inicializado de una forma menos ortodoxa, también miré la *dirección* de los pesos (antes solo estaba midiendo la escala). Los embeddings de los transformers son [anisotrópicos](https://arxiv.org/abs/2401.12143) (colapsan en un puñado de direcciones compartidas — esto se conoce como el representation degeneration problem, un cuello de botella muy interesante en la capacidad de representación de los LLMs). Tomando la dirección media de los tokens que sabemos que se entrenaron, la alineación coseno con una baseline aleatoria es 0.03, mientras que para los heterónimos es +0.8, y para `{` es +0.985.

Esto prácticamente demuestra que estos tokens se entrenaron, `_` y `{` más que el resto. Probé a forzar al modelo a sacar } pero no salió nada relevante.[^3]

---

Nuevo objetivo: averiguar con qué corpus se entrenó el modelo. Con greedy, `ISBN:\n` saca:

```
978-989-8698-16-1
Porto: Livraria Portugal (1865-1916)
O Projecto Adamastor não adopta o Acordo Ortográfico de 1990
```

Lo cual apunta a que el corpus es el [Projecto Adamastor](https://projectoadamastor.org/sobre-o-projecto/), una colección de literatura portuguesa de dominio público. Además, cargando el modelo con `weights_only=False` como manda dios, aparece el campo `config.splits` con train/val/test de 18.0M / 2.4M / 2.4M bytes.[^4]

Mirando el dataset, no parece que haya ningún carácter `{` o `_`, así que esos vienen seguro de la flag anterior y puede que de algo más.[^5]

Por el ritmo al que suben los envíos a estas alturas, tiene que haber gente intentando sacar la flag por fuerza bruta, pero sinceramente no creo que así se encuentre la solución. El reto parece bien diseñado para que ningún enfoque ingenuo con LLMs funcione. Encontré algunos write-ups ([1](https://github.com/diomonogatari/arcus-ode-triunfal-lab/blob/main/WRITEUP.md), [2](https://github.com/luisdafonseca/arcus-ode-triunfal/blob/main/WRITEUP.md)) que me sirven para descartar lo que ya probaron.

Pasé un rato explorando la negative log-likelihood y mirando los logprobs de algunas cadenas candidatas, sin nada destacable.[^6] Probé a saltarme el error [EPSON W-02] metiendo los tokens correctos del poema original,[^7] y luego simplemente corrí el modelo todo lo rápido que pude (~30k tok/segundo en la AMD Radeon 8050S de mi portátil) para intentar sacar algo interesante por fuerza bruta, pero sin éxito.[^8]

---

Unos días después retomé el reto, y resulta que los pesos habían cambiado. La v2 de los pesos quita los metadatos del modelo y tiene más finetuning, con el mensaje "Minor refresh to improve generation stability", lo que apunta a la idea de que sí que hay que conseguir que el modelo regurgite la flag de alguna manera...

Averiguar qué cambió del modelo viejo al nuevo debería ser interesante. Después de probar con distintos prompts, lo único que pude encontrar es lo que dice el modelo justo después de ver la secuencia exacta `<|alvaro_de_campos|>flag:`, que ahora devuelve relleno en vez de la flag. La flag sigue apareciendo como antes al poner `<|alvaro_de_campos|>` seguido de `flag{...`. Parece poco probable que actualizaran el modelo solo por esto, así que probablemente se me está escapando algo.[^9]

Pasé un rato en X mirando la conversación, y ¿parece que a lo mejor la flag se [filtró](https://x.com/JeoCryp/status/2062136235385057631?s=20) en los strings del modelo v1? Algunos tweets borrados apuntan a eso... también encontré otros hackathons con una premisa parecida, como [1](https://www.ctfiot.com/173678.html) y [2](https://pure.tudelft.nl/ws/portalfiles/portal/151662282/SaTML_Training_Data_Extraction_Challenge_.pdf) Buscando posibles cifrados o códigos que se pudieran usar aquí, dado que a Pessoa le iba mucho el ocultismo y la [masonería](https://salaamshrine.com/focus-on-freemasonry-fernando-pessoa/), el [cifrado pigpen](https://en.wikipedia.org/wiki/Pigpen_cipher) podría ser relevante. Pasé un rato probando las ideas de esos CTFs sin éxito, el oráculo de suma de logits y la exfiltración de datos de entrenamiento.[^10]

Leí algunos [papers](https://www.usenix.org/system/files/sec21-carlini-extracting.pdf) y vi que mi intento anterior de usar la perplejidad en crudo como métrica es una mala señal, porque está dominada por la frecuencia de los tokens. Con el corpus entero del Project Adamastor (bastante seguro de que tengo el correcto, ya que el mío ocupa 24.8 MB frente a ~22.8 MB en las configs filtradas iniciales) y puntuándolo con los modelos v1 y v2, verifiqué que lo que se había reforzado era la flag falsa...[^11] empezando a perder un poco la esperanza con esto, metí a un amigo en el reto para que aportase sus ideas también.

---

Jugué con la posibilidad de que el modelo fuera una función de puntuación, pero sin tener claro contra qué puntuar. El log-prob medio más bajo que conseguí fue `O Projecto Adamastor não adopta o Acordo Ortográfico de 1990 nas suas edições.`[^12]. Metí a un amigo que de alguna forma sacó el carácter \x0c de la flag falsa, que es una secuencia de control que originalmente le indicaba a las impresoras que pasaran a la página siguiente. Probándolo no salió nada, pero luego encontré el separador real del corpus, `\n\n\n`, que me permitió confirmar muchos de los documentos usados en el entrenamiento.
Por último apunté un logit lens dentro de la cuenca de la flag señuelo: es un lookup de capas tardías (solo aparece en L8 y salta a casi certeza en L9), sin `}`/delimitador a ninguna profundidad. El activation steering simplemente se pasa de frenada y acaba en ruido. No hay nada con forma de flag codificado a lo largo del camino de `flag{`. [^13]

Mi teoría es que la flag no está literalmente en ningún sitio del modelo y que para sacarla tienes que entender algo relacionado con Pessoa que ahora mismo no estoy pillando. Fue un reto divertido y me gustaría saber cuál era la solución real.

---

repo de github con la mayoría de los scripts usados: [https://github.com/mateo19182/augusta-ctf](https://github.com/mateo19182/augusta-ctf)

[^1]: Generación con [`chat.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/chat.py); los envíos a la TUI SSH en vivo, automatizados con [`arcus_drive.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/arcus_drive.py).
[^2]: [`heteronym_probe.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/heteronym_probe.py) (qué devuelve cada etiqueta) y [`byte_vs_token.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/byte_vs_token.py) (camino de token único vs. camino de bytes en crudo).
[^3]: [`embedding_trained_test.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/embedding_trained_test.py) — el z-test de la norma de inicialización más el test de dirección/anisotropía, independiente de la escala.
[^4]: [`corpus_refs_probe.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/corpus_refs_probe.py) saca a la luz las referencias externas memorizadas; [`extract_fields.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/extract_fields.py) hace beam search de las distintas compleciones de la Ficha-Técnica.
[^5]: Corpus descargado y verificado con md5 con [`fetch_corpus.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/fetch_corpus.py).
[^6]: Puntuación de candidatos con teacher forcing con [`nll_score.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/nll_score.py) / [`nll_score2.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/nll_score2.py) / [`nll_score3.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/nll_score3.py), [`find_low_nll.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/find_low_nll.py) para la continuación no-flag de mayor confianza, y [`corpus_diff.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/corpus_diff.py) para el barrido amplio de prefijos.
[^7]: [`ode_tree.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/ode_tree.py) — el árbol de divergencia greedy-vs-original para el final señuelo de Campos.
[^8]: Scorer por lotes [`fast_score.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/fast_score.py); el camino rápido GGUF/Vulkan con [`convert_to_gguf.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/convert_to_gguf.py) + [`ode_score`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/ode_score.cpp). El throughput lo ajusté con [`bench_infer.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/bench_infer.py) (número de hilos, dtype, atención manual vs. SDPA, tamaño de batch, caché KV del prefijo) y [`bench_compile.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/bench_compile.py) (eager bf16 vs. `torch.compile`).
[^9]: Diff a nivel de tensor con [`diff_ckpt.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/diff_ckpt.py); pruebas del camino señuelo y de localización por capas en [`diff_canary.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/diff_canary.py), [`v1_v2_localize.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/v1_v2_localize.py), [`v1_v2_recompare.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/v1_v2_recompare.py).
[^10]: [`sum_of_logits_probe.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/sum_of_logits_probe.py) para el acertijo de la reducción de logits, [`heteronym_key_probe.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/heteronym_key_probe.py) para la teoría del heterónimo como clave/delimitador, y los escaneos de membership inference al estilo Carlini [`v1v2_nll_scan.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/v1v2_nll_scan.py) / [`v1v2_zoom.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/v1v2_zoom.py).
[^11]: Escaneo de refuerzo por token [`v1v2_reinforce.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/v1v2_reinforce.py), más la búsqueda por el lado de la generación [`v1v2_gendiff.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/v1v2_gendiff.py).
[^12]: Continuación no-flag de mayor confianza encontrada con [`find_low_nll.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/find_low_nll.py); el envío en vivo automatizado con [`arcus_drive.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/arcus_drive.py).
[^13]: La prueba del form-feed/separador [`ff_probe.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/ff_probe.py), el barrido para escapar del señuelo [`unjam.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/unjam.py), el recorrido por páginas con `\n\n\n` [`section_map.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/section_map.py), y la prueba de logit lens + activation steering [`lens_steer.py`](https://github.com/mateo19182/augusta-ctf/blob/main/scripts/lens_steer.py).
