---
title: El reto de Feijoo
lang: es
date: 2026-10-05
aliases:
  - writings/El-reto-de-Feijoo-borrador
description: OCR, búsqueda entre idiomas y revisión de fuentes para comprobar los retos de Feijoo de 1729 y 1733.
---

<div class="post-tldr" markdown="1">
<p class="post-tldr-label">TL;DR</p>

El padre Feijoo retó a sus lectores a encontrar líneas traducidas de revistas francesas en sus obras. Casi tres siglos después, encontré unos diez casos que cumplen sus condiciones.

</div>

## Intro

Estamos en un momento único en la historia, pero no por las razones obvias. Hay una serie de circunstancias que se dan desde principios de 2024 hasta dentro de no mucho tiempo que son especialmente únicas.

Este período es lo más cerca que una persona de a pie va a estar a la frontera de los modelos, y la distancia probablemente se acrecentará con el tiempo, consecuencia de las [scaling laws](https://arxiv.org/abs/2001.08361),  los frontier labs son actores geopolíticos y la entrada de los riesgos existenciales de la IA en el discurso mainstream.

Coincide a su vez con la transición social y económica que la aceleración tecnológica va a provocar, sobre la cual he cambiado por completo de opinión en los últimos años (leía bastante LessWrong en 2023, imagina), pero los efectos serán significativos igual. Esto da lugar a multitud de [arbitrajes](https://en.wikipedia.org/wiki/Arbitrage) que seguramente sobrevivan mucho más tiempo de lo que una persona técnica piense [^1].

Fundamos Tribosolutions.es en parte bajo esta tesis, y si algo me ha enseñado es que el software no va a ser un moat válido por mucho tiempo[^2]. Como alguien que se considera técnico, y con cierto [rechazo hacia las ventas](https://blog.m19182.dev/writings/The-Case-Against-Marketing/), es una lección que me ha costado digerir.

![The Diffusion Gap: capacidades de la IA, adopción y oportunidad](/data/feijoo-preview/blog/post/images/diffusion-gap.png)

---

Este post es para hablar de uno de estos arbitrajes, que ocupa gran parte de mi atención desde que leí [AI labs need to start funding historical research](https://resobscura.substack.com/p/ai-labs-need-to-start-funding-historical). En resumen, los modelos frontier actuales han llegado al punto en que pueden producir conocimiento histórico original por sí mismos, y la conclusión del autor del post es que los labs deberían financiar colaboraciones con historiadores y archivistas.

Si miras por detrás de los incentivos (quien escribe esto es historiador de profesión), lo que a mí me queda es que estamos en un momento único donde cualquiera con el suficiente nivel de espabilado puede conseguir hacer descubrimientos novedosos, antes de que los labs se pongan a cerrar todos los cabos restantes por un poco de promo.

No soy el primero en pensar esto, está muy inspirado en el proyecto de [Daniel Bourdeau](https://dbourdeau.github.io/cyphersolver/index.html) (perdonadle el slop de web...) que está [descifrando mensajes de la Segunda Guerra Mundial](https://www.cryptocellar.org/bgac/the-mvueh-break.html) [más rápido de lo que los pueden comprobar](https://cryptiana.web.fc2.com/code/unsolved.htm), y [un nuevo testimonio presencial sobre el dodo](https://resobscura.substack.com/p/using-opus-55-to-discover-a-new-eyewitness) entre otros.

De forma similar a lo que está pasando en las matemáticas, hay cierta incertidumbre a la hora de verificar que los descubrimientos sean correctos. Varios de los primeros problemas de Erdős que resolvieron los LLMs [ya tenían soluciones en la literatura que no se habían ligado al problema](https://github.com/teorth/erdosproblems/wiki/AI-contributions-to-Erd%C5%91s-problems), más que una nueva idea detrás. Precisamente esta habilidad parece especialmente valiosa para el estudio de la historia, debido en gran parte a la gran cantidad de documentos digitalizados (y los muchos que faltan). Al igual que en el software, el cuello de botella se mueve a la verificación.

Para encontrar temas que explorar, busqué opciones relacionadas con Galicia / España y que sean razonablemente verificables por mi cuenta. Llegué a una lista de unos cuantos que me gustaría intentar afrontar cuanto antes. En este post presento los resultados del primero de ellos, al cual dediqué un par de decenas de horas mías y varios cientos de horas de agentes. Este es un post algo largo, ya que intento hablar de todas las cosas que me parecen interesantes. Incentivo el uso del índice para saltarse todo lo que no te interese.

### El reto

En el [_Prólogo apologético_](https://www.filosofia.org/bjf/bjft3p6.htm) del [Teatro crítico universal](https://www.filosofia.org/bjf/bjft000.htm) III (1729), §5, [Benito Jerónimo Feijoo](https://www.cervantesvirtual.com/portales/benito_jeronimo_feijoo/autor_biografia/) lanza este reto a todos sus lectores:

> «Lector mío, si estás en Madrid, y entiendes el Francés, ruégote que busques las Memorias de Trevoux, y el Journal des Sçavans, que no pueden faltar en la Biblioteca Real, y en otras; que unos, y otros libros vuelvas, y revuelvas bien; y cuando halles ni un párrafo sólo, ni aun cuatro líneas, que sean traslado, o traducción de ellos, o en este Tomo, o en alguno de los antecedentes, quiero que todos tres los des al fuego, y me obligo a restituirte el dinero que te han costado.»

![El reto de Feijoo en el prólogo del tomo III, primera edición de 1729, con el pasaje subrayado](/data/feijoo-preview/blog/documents/web/01_reto_tcu3_1729_ni_aun_quatro_lineas.jpg)
[Fuente: Biblioteca Nacional de España, primera edición del tomo III (1729), imagen 18, CC BY 4.0.](https://bnedigital.bne.es/bd/es/viewer?id=911fba8d-7ad3-4d7e-9332-a05cb636e5a9).

Si te llama la atención que la "s" parece una "f", se conoce como la S larga y tiene una [historia fascinante](https://typefoundry.blogspot.com/2008/01/long-s.html), relacionada con las imprentas de la época, pero si me paro en cada detalle así no acabaría esto nunca. Lo sé porque cometí ese error en un [post anterior](https://blog.m19182.dev/writings/Consciousness-is-hard/) que nunca llegué a acabar.

La idea original es comparar los tomos I–V (el propio Feijoo amplió el reto [en 1733](https://www.filosofia.org/bjf/bjft517.htm) a sus nuevas obras) del _Teatro crítico universal_ (TCU de aquí en adelante) con las _Memorias de Trévoux_ y el tomo del _Journal des Sçavans_ que Feijoo decía tener, y ver si encontramos pasajes copiados.

> «Solo me resta un recurso; y es el que propondré ahora. Desafío al Anónimo Autor de la Carta, (sea el que se fuere) y a todos los demás que quieran conspirar con él, para que en una o muchas hojas volantes den al público señalados los lugares de las Memorias de Trevoux, de donde pretenden que haya sacado yo lo mejor que he empleado para el fondo de mi Obra. En vista de las citas ofrezco exhibir las Memorias de Trevoux, (ciento y veinte y cuatro tomos son los que tengo) ante dos Caballeros de los principales de esta Ciudad, y dos Eclesiásticos de la primera distinción, que unos y otros entienden bien el Francés, los cuales, leídos con exactitud los lugares señalados, darán certificación pública, firmada de sus nombres, de que es falsa la acusación, y fingido el robo que me imputan.»

![Segundo reto de Feijoo, tomo V, primera edición de 1733, página 388, número 44](/data/feijoo-preview/blog/documents/web/06_segundo_reto_1733_p388.jpg)
*TCU V, discurso XVII, n.º 44, p. 388. [Primera edición, Universidade de Santiago de Compostela](https://hdl.handle.net/10347/7540); [transcripción](https://www.filosofia.org/bjf/bjft517.htm).

## Contexto histórico

Benito Jerónimo Feijoo nace en 1676 en Casdemiro, cerca de Ourense, primogénito de una familia acomodada de la nobleza media gallega. Entró pronto al monasterio benedictino de Samos, contradiciendo el camino natural del primer hijo (dentro del matrimonio). Estudió y ejerció de profesor en Galicia, Salamanca y León, y llegó a San Vicente de Oviedo en 1709, donde permaneció el resto de su vida (pese a múltiples invitaciones a moverse a ciudades más relevantes). Allí compaginó su estudio y docencia universitaria con su carrera eclesiástica hasta su muerte a los 87 años. Su velatorio y entierro [fueron multitudinarios](https://musarqourense.xunta.gal/sites/default/files/doc/peza_mes/pm_2025_04_esp_0.pdf). Su fama atrajo a numerosos visitantes y, muchos años después de su muerte, [seguían visitándose los lugares donde había residido](https://www.cervantesvirtual.com/portales/benito_jeronimo_feijoo/autor_biografia/).

![Retrato de Feijoo grabado por Juan Bernabé Palomino](https://www.cervantesvirtual.com/images/portales/benito_jeronimo_feijoo/graf/retratos/01_benito_jeronimo_feijoo_s.jpg)
[Fuente: Biblioteca Virtual Miguel de Cervantes. Palomino lo grabó a partir de un retrato realizado hacia 1733–1734.](https://www.cervantesvirtual.com/portales/benito_jeronimo_feijoo/imagenes_retratos/imagen/01_benito_jeronimo_feijoo/)

Hay bastante información sobre su vida al ser una de las personas más célebres de la época. Escribió una breve autobiografía, a petición de un barón alemán, que junto con las honras fúnebres y testimonios como la [*Noticia de la vida de Feijoo* de Campomanes](https://www.filosofia.org/bjf/bjft1p1.htm), así como correspondencia y noticias, ayuda a que tengamos una buena idea de la vida que vivía[^7]. Aun así, gran parte de sus papeles se perdieron con [la desamortización](https://es.wikipedia.org/wiki/Desamortizaci%C3%B3n_espa%C3%B1ola), y muchos de los que quedaban en el monasterio de Samos ardieron en un incendio en 1951.

Los monasterios y universidades formaban una red de transmisión de conocimiento inigualable en esos momentos, se prestaban libros entre sí y se ayudaban a conseguir novedades. Feijoo leía latín y francés. A menudo conocía las ideas inglesas o alemanas por su versión francesa. En esta época (finales del siglo XVII) comienza una suerte de ilustración española, médicos, matemáticos y filósofos (llamados [«novatores»](https://revistas.usal.es/uno/index.php/Studia_Historica/article/view/2729)) que instaban a atender a la observación y a los conocimientos llegados de Europa.[^3] Feijoo no fue de los primeros en discutir estas ideas, pero ayudó a llevarlas a un público mucho más amplio.

El primer tomo de TCU, su primer gran ensayo, se publica en 1726, con 49 años y España con un cuarto de siglo de dinastía borbónica. El nombre del título engaña, no tiene nada que ver con el teatro, eran «discursos varios en todo género de materias, para desengaño de errores comunes». Medicina, astrología, música de iglesia, lenguas... En [*Paralelo de las lenguas*](https://www.filosofia.org/bjf/bjft115.htm) defendía que el gallego y el portugués eran en realidad una misma lengua. Uno de los más polémicos fue la [*Defensa de las mujeres*](https://www.filosofia.org/bjf/bjft116.htm).

![Portadas de los tres primeros tomos del Teatro crítico universal](/data/feijoo-preview/blog/documents/web/05_portadas_tcu_I-III_triptico.jpg)
[Primeras ediciones de la BNE: tomo I, 1726](https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44), [II, 1728](https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a) y [III, 1729](https://bnedigital.bne.es/bd/es/viewer?id=911fba8d-7ad3-4d7e-9332-a05cb636e5a9).

La publicación de estos tomos venía en gran parte instada por sus superiores eclesiásticos, lo cual es especialmente relevante ya que los impresos necesitaban de aprobaciones y licencias, las cuales a su vez son útiles para reconstruir su carácter y estatus en esos momentos.[^censura]

<details markdown="1">
<summary>aprobaciones y permisos del tomo I</summary>

![Preliminares del tomo I, con la licencia de la orden benedictina](/data/feijoo-preview/data/feijoo/firsted_scans/I/009.jpg)
La licencia de la orden autorizaba a Feijoo a imprimir el libro tras su examen.

![Aprobación de Domingo de Lossada en los preliminares del tomo I](/data/feijoo-preview/data/feijoo/firsted_scans/I/011.jpg)
Una de las aprobaciones, escrita por Domingo de Lossada. Además del juicio sobre el libro, contiene elogios del autor.

![Preliminares del tomo I, con la suma de la licencia del Consejo](/data/feijoo-preview/data/feijoo/firsted_scans/I/013.jpg)
La suma de la licencia recoge la autorización del Consejo para imprimirlo conforme al original aprobado.

[Fuente: Biblioteca Nacional de España, primera edición del tomo I, 1726.](https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44)


</details>

Hasta ocho tomos se publicaron entre 1726 y 1739. Después continuó con las [*Cartas eruditas y curiosas*](https://www.filosofia.org/bjf/bjfc000.htm), publicadas en cinco tomos entre 1742 y 1760. Una estimación cifra la difusión de su obra en unos 440 000 volúmenes.[^6] Probablemente mi descripción aquí se quede corta para dar a entender su importancia, debía ser el escritor español más reconocido dentro y fuera de España en el momento, escribía en castellano, cuando este tipo de contenido solía estar en latín y sus ideas fueron extremadamente polémicas.

Curiosamente este año se celebró en Oviedo un [congreso por los tres siglos del primer tomo](https://ifesxviii.uniovi.es/actividades/congresos).

### Polémica

Viviendo en Oviedo, obtener novedades extranjeras era muy complicado. Un contacto importante era [Martín Sarmiento](https://consellodacultura.gal/album-de-galicia/detalle.php?persoa=1331), también benedictino gallego que le proporcionaba materiales desde Madrid, corregía sus textos y defendía sus posiciones. Eran especialmente relevantes revistas como las [*Memorias de Trévoux*](https://catalogue.bnf.fr/ark%3A/12148/cb32813492j), que desde 1701 recogían reseñas y noticias de distintas materias.

Pocas semanas tras la publicación de TCU, ya circulaban escritos de distintos autores respondiendo a sus escritos, a los que varios de sus amigos salieron en defensa. Ya hay alguna acusación, pero no es [hasta 1728](https://www.filosofia.org/bjf/bjft1p1.htm) en la _Tertulia histórica y apologética_, un canónigo que asegura haber estudiado en París dice que el TCU es una traducción de varias obras francesas, sin muchos más detalles.

![Acusación de traducción de obras francesas en la Tertulia histórica y apologética de 1728](/data/feijoo-preview/blog/documents/web/02_tertulia1728_pp8-9_acusacion.jpg)
*Tertulia histórica y apologética*, 1728, pp. 8–9. El canónigo propone comprobar las fuentes francesas en la Biblioteca Real.

Me resulta especialmente elegante la forma en la que se acusaban entre sí, en el caso de _Estrado crítico_  (1727), es una conversación entre cuatro señoras, en _Tertulia histórica y apologética_, uno de sus personajes se queja de que, después de su esposa leyese a Feijoo, el matrimonio fue arruinado y la mujer empezó a estudiar latín y francés y a hablar de Descartes.

![Portada del Estrado crítico en defensa de las mujeres contra el Teatro crítico universal, 1727](/data/feijoo-preview/data/accusers/estrado1727/img/p-01.jpg)
*Estrado crítico*, 1727. La portada aparece a la derecha del escaneo. [Biblioteca Nacional de España, ejemplar 3/32988(11)](/data/feijoo-preview/data/accusers/estrado1727/estrado_critico_bne_3-32988-11.pdf).

A este último responde Feijoo en el [prólogo del tercer tomo, en 1729](https://www.filosofia.org/bjf/bjft3p6.htm), donde dice tener cien tomos de Trévoux, pero distinguiendo entre aprovechar un libro y copiarlo. Aquí es donde también plantea la apuesta pública que este post estudia.

Ese mismo año, Salvador José Mañer hizo esto mismo, y en _Anti-Teatro_ (1729) señaló lugares concretos. Feijoo le respondió, y Mañer volvió en 1731. La pelea siguió durante décadas, con nuevos adversarios y defensores. En 1750, una Real Orden de Fernando VI prohibió publicar el tercer tomo de uno de los críticos de Feijoo, así como posteriores impugnaciones. Este es mi intento de reconstrucción de las acusaciones hechas hasta ese momento:

<details markdown="1">
<summary>Cronología ampliada de la polémica (1726–1750)</summary>

| Fecha | Autor | Posición | Obra o intervención | Qué cuestiona o aporta | Digitalización / texto |
| --- | --- | --- | --- | --- | --- |
| 3 sep. 1726 | Feijoo | Autor | *Teatro crítico universal*, I | Dieciséis discursos, entre ellos los de medicina, astrología y la defensa de las mujeres. | [Escaneo, BNE](https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44); [transcripción](https://www.filosofia.org/bjf/bjft100.htm) |
| 5 oct. 1726 | Martín Martínez | A favor | *Carta defensiva sobre el primer tomo del Teatro crítico* | Celebra la obra de Feijoo y discute su escepticismo sobre la medicina. | [Transcripción](https://www.filosofia.org/bjf/bjft2p7.htm); [BNE](https://bdh-rd.bne.es/viewer.vm?id=0000093762) |
| 22 oct. 1726 | Pedro Aquenza | En contra | *Breves apuntamientos en defensa de la medicina y de los médicos* | Considera que Feijoo injuria a los médicos y a una facultad creada por Dios. | [Reproducción, BVMC/UCM](https://cervantesvirtual.com/portales/maria_jose_alonso_seoane/obra/breves-apuntamientos-en-defensa-de-la-medicina-i-de-los-medicos-contra-el-theatro-critico-universal/) |
| oct. 1726, según Caso y Cerra | José Francisco de Isla, atribuido | A favor | *Blanda, suave y melosa respuesta a los ferinos y furiosos apuntamientos* | Respuesta burlesca a Aquenza. | [Facsímil, Biblioteca de Bizkaia](https://liburutegibiltegi.bizkaia.eus/handle/20.500.11938/76301) |
| 29 oct. 1726 | Francisco Suárez de Ribera | Mixta | *Templador médico de la furia vulgar* | Defiende a Martínez y Feijoo frente a Aquenza, pero discrepa del discurso sobre medicina y defiende el bezoar. | [Escaneo, Wellcome](https://wellcomecollection.org/works/mupc5k65) |
| nov. 1726 | Feijoo | Autor | *Respuesta a los doctores Martínez, Aquenza y Ribera* | Contesta a las primeras intervenciones sobre su discurso de medicina. | [Respuesta a Martínez, transcripción de una edición posterior](https://www.filosofia.org/bjf/bjft2p8.htm) |
| 3 dic. 1726 | Eustaquio Cerbellón de la Vera | En contra | *Diálogo harmónico* | Defiende la música de los templos frente a la crítica de Feijoo. | — |
| 17 dic. 1726 | «Laurencio Manco de Olivares», seudónimo | En contra | *Contradefensa crítica a favor de los hombres* | Impugna la defensa de las mujeres del primer tomo. | — |
| 24 dic. 1726 | Francisco Suárez de Ribera | En contra | *Medicina cortesana satisfactoria* | Responde a Feijoo y mantiene su defensa del bezoar. | — |
| finales de 1726 | Diego de Torres Villarroel | En contra | *Posdatas de Torres a Martínez*; *Montante christiano y político* | Interviene en la disputa sobre medicina y astrología. | [Posdatas, transcripción](https://www.filosofia.org/bjf/imp/1726dtpo.htm) |
| 1726–1727 | Jorge Irún y Adecha | A favor | *Desengaño de delirios* | Responde a Manco de Olivares en defensa de las mujeres. | — |
| 4 ene. 1727, fecha del texto | Agustín Castejón, atribuido | En contra | *Dudas y reparos sobre que consulta un Escrupuloso* | Cuestiona las opiniones médicas de Feijoo y su defensa de las mujeres. | — |
| 4 feb. 1727 | Martín Martínez | A favor | *Juicio final de la astrología* | Impugna la astrología y responde a Torres. | [Escaneo](https://archive.org/details/A1090721); [Transcripción](https://www.filosofia.org/bjf/apo/1727mmju.htm) |
| 4 feb. 1727 | «Ernesto Frayer», Martín de Mendoza de Pina | Discrepancia concreta | *Discurso philológico crítico sobre el corolario del Discurso XV* | Discute la identificación del gallego y el portugués. | [Transcripción](https://www.filosofia.org/aut/005/1727fra.htm) |
| 16 feb. 1727 | Juan Antonio Santareli | En contra | *Estrado crítico en defensa de las mugeres* | Diálogo que defiende el ideal tradicional de mujer. La referencia a Bellegarde de la p. 20 repite una cita reconocida por Feijoo; no demuestra una copia oculta. | [BNE](https://bdh-rd.bne.es/viewer.vm?id=0000083299) |
| 25 feb. 1727 | Jerónimo Zafra | En contra | *Antiteatro del Teatro crítico* | Impugna el primer tomo, antes de los *Anti-Theatros* de Mañer. | — |
| 25 marzo 1727 | Ignacio Ximénez Saforcada, como «Geminiano Zafra Ciscodexa» | En contra | *Antitheatro délfico judicial jocoserio* | Otra impugnación del primer tomo. | — |
| 25 marzo 1727 | Bernardo López de Araujo | En contra | *Residencia médico-cristiana* | Defiende la medicina tradicional frente a Feijoo. | — |
| 6 mayo 1727 | Ignacio García Ros | En contra | *Medicina vindicata* | Interviene contra la crítica feijoniana a la medicina. | — |
| 1 jul. 1727 | Anónimo | En contra | *Cátedra de desengaños médicos* | Continúa las impugnaciones médicas al primer tomo. | — |
| 1727 | Anónimo | A favor | *Papel de Marica la Tonta en defensa de su sexo* | Otra respuesta a Manco de Olivares. | — |
| 1727 | Diego de Torres Villarroel; Julián Salinero | En contra | *Entierro del Juicio final y vivificación de la astrología*; *Pragmática del tiempo* | Respuestas al *Juicio final* de Martínez. | [Entierro, transcripción](https://www.filosofia.org/bjf/imp/1727dten.htm) |
| 1727 | Anónimo | A favor | *Blanda, suave y melosa curación del Escrupuloso y de sus flatos espirituales* | Respuesta satírica al Escrupuloso. Feijoo desaprueba sus insultos. | [Facsímil, Biblioteca de Bizkaia](https://liburutegibiltegi.bizkaia.eus/handle/20.500.11938/76327) |
| 1727 | Feijoo, atribuido | Autor | *Satisfacción al Escrupuloso* | Contesta los reparos y rechaza el tono del defensor anónimo. | [Transcripción](https://www.filosofia.org/bjf/bjfvsat.htm) |
| 1727 | «José Madaria», atribuido a Feijoo | Autor | *Respuesta al señor Asiodoro* | Respuesta musical al *Diálogo harmónico*. | — |
| 1727 | Eustaquio Cerbellón de la Vera, atribuido | Discrepancia concreta | *Respuesta de Asiodoro a Madaria* | Continúa la discusión técnica sobre música. | — |
| 1727 | Francisco Dorado; Feijoo | En contra / autor | *Discurso fisiológico-médico*; *Respuesta al discurso fisiológico-médico* | Dorado critica las opiniones médicas de Feijoo; este responde. | [Respuesta de Feijoo, transcripción](https://www.filosofia.org/bjf/bjfvre2.htm) |
| 1727 | Francisco García Cabero | Disputa derivada | *Templador veterinario de la furia vulgar* | Defiende a los albéitares frente a Suárez de Ribera. | [Google Books](https://books.google.com/books?id=67l8TjsaKo8C) |
| 6 abr. 1728 | Feijoo | Autor | *Teatro crítico universal*, II | Segundo tomo, también objeto del *Anti-Theatro* de Mañer. | [Escaneo, BNE](https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a); [transcripción](https://www.filosofia.org/bjf/bjft200.htm) |
| 20 abr. 1728 | «Jaime Ardanaz y Centellas», autor no identificado | En contra | *Tertulia histórica y apologética* | Acusa a Feijoo de copiar a Naudé y de traducir revistas francesas. La acusación sobre Trévoux y el *Journal des Sçavans* de la p. 9 no señala pasajes concretos. | [BNE](https://bnedigital.bne.es/bd/es/viewer?id=2e8cf240-4b84-4e8f-8702-eecc26a93a7a); [Google Books](https://books.google.com/books?id=qub2aCY8BzwC) |
| 1728, licencias de mayo | Felipe Brizeño y Zúñiga | En contra | *Juicio particular del Juicio Universal* | Impugna el discurso sobre la antipatía entre franceses y españoles. Incluye censura de Torres. | — |
| nov. 1728 | *Mémoires de Trévoux* | Noticia | «De Madrid», p. 2140 | Informa del crecimiento de la polémica y de sus respuestas y defensas. | — |
| 1728 | Manuel José de Medrano | En contra | *Vida de Santa Inés de Monte-Policiano* | Critica el pasaje sobre Savonarola. La *Tertulia* retoma su acusación de copia de Naudé. | [Google Books](https://books.google.com/books?id=5Sjk50f-evkC) |
| 1728 | Juan Martín de Lessaca | En contra | *Apología escolástica en defensa de la Universidad de Alcalá* | Defiende la medicina escolástica frente a Martínez y Feijoo. | [Google Books](https://books.google.com/books?id=fwPtNEfJKiUC) |
| 31 mayo 1729 | Feijoo | Autor | *Teatro crítico universal*, III, «Prólogo apologético» | Responde a la *Tertulia* y plantea el reto de las cuatro líneas. | [Escaneo, BNE](https://bnedigital.bne.es/bd/es/viewer?id=911fba8d-7ad3-4d7e-9332-a05cb636e5a9); [Transcripción](https://www.filosofia.org/bjf/bjft3p6.htm) |
| 7 jun. 1729 | Salvador José Mañer | En contra | *Anti-Theatro crítico*, sobre los tomos I y II | Señala setenta descuidos y pasajes concretos supuestamente tomados de Trévoux, entre ellos el de Parent de 1716. | [Escaneo](https://archive.org/details/bub_gb_B3PVs3sLEroC); [Ficha bibliográfica](https://www.filosofia.org/bjf/imp/smat1.htm) |
| 6 sep. 1729 | Francisco Antonio de Tejeda, atribuido | En contra | *Apelación sobre la piedra filosofal* | Impugna el discurso sobre la piedra filosofal del tomo III. | — |
| 1729 | José Ortiz Barroso | En contra | *Reflexiones physico-curiosas* | Discute, entre otros asuntos, el discurso del huevo de gallo viejo del tomo II. | — |
| 1729 | Antonio Heredia y Ampuero | En contra | *El estudiante preguntón* | Impugna a Feijoo, Martínez y los piscatores. | [Transcripción](https://www.filosofia.org/bjf/imp/1729eles.htm) |
| 10 ene. 1730 | Feijoo | Autor | *Ilustración apologética* | Responde a Mañer y rebate sus setenta descuidos. La portada lleva 1729. | [Escaneo, Universidad de Oviedo](https://digibuo.uniovi.es/dspace/handle/10651/13197) |
| sep. 1730 | Carta de Zaragoza, atribuida a Tejeda por Feijoo | En contra | Carta en Trévoux, pp. 1693–1696 | Afirma que Feijoo tomó de la revista lo mejor del contenido de su obra. | — |
| 1730 | Lucas Montoya y Rada | A favor | *Rebeses al estudiante preguntón* | Defensa de Feijoo contra Heredia mediante una obra teatral alegórica. | — |
| 1730 | Diego de Torres Villarroel | En contra | *Último sacudimiento de botarates y tontos; y si me vuelven a enfadar no será el último* | Ataca, entre otros, al defensor Lucas Montoya y Rada. | — |
| 30 ene. / marzo 1731 | Carlos de Montoya y Uzueta; Martín Sarmiento | En contra / a favor | *Crítico y cortés castigo de pluma*; *Carta a don Carlos Montoya* | Montoya ataca a Feijoo y Sarmiento. Sarmiento responde como «Sancho Revulgo y Cantalapiedra». | — |
| jun. 1731 | Jean-Baptiste Boyer | A favor | «Lettre sur un ouvrage du R. P. Feijoo», *Mercure de France* | Elogia la recepción y estima del *Teatro crítico*. | — |
| 7 ago. 1731 | Salvador José Mañer | En contra | *Anti-Theatro sobre el tomo tercero* y *Réplica satisfactoria* | Anuncia 998 errores y responde expresamente al reto. Repite la acusación sobre Parent y añade otras. | [Escaneo, Universidad de Alicante](https://hdl.handle.net/10045/140067) |
| abr. 1732 | Jean-Baptiste Boyer | A favor | Reseña en el *Mercure de France*, pp. 743–752 | Comenta el tomo III y la *Ilustración apologética*. | — |
| 23 dic. 1732 | Martín Sarmiento | A favor | *Demostración crítico-apologética*, dos tomos | Defiende a Feijoo, también mediante la explicación de fuentes comunes. Habla de más de cien «papelones» contra él. | [Tomo I](https://archive.org/details/demonstracioncr00sarmgoog); [tomo II](https://archive.org/details/demonstracioncr01sarmgoog); [transcripción](https://www.filosofia.org/bjf/apo/sardc.htm) |
| 7 jul. 1733 | Feijoo | Autor | *Teatro crítico universal*, V, discurso 17 | Responde a la carta de Zaragoza y renueva el reto. Declara poseer 124 tomos de Trévoux de los 128 publicados. | [Transcripción](https://www.filosofia.org/bjf/bjft517.htm) |
| 1733 | Jacinto Segura | En contra | *Norte crítico* | Discute el tratamiento de Savonarola en el prólogo del tomo III. | [Google Books](https://books.google.com/books?id=EYWQm2Oc4aIC) |
| 14 sep. 1734 | Manuel Mariano Ballester y de la Torre | En contra | *Combate intelectual* | Impugna tres discursos del *Teatro crítico*. | — |
| 19 oct. 1734 | «Álvaro Menards», Salvador José Mañer | En contra | *El famoso hombre marino del P. M. Feijoo* | Ataca el relato del hombre de Liérganes del tomo VI. | — |
| 7 dic. 1734 | Manuel Marién y Rubio | En contra | *Primera parte de la singular vida de don Alonso Pérez de Saabedra, falso nuncio en Portugal* | Contradice el relato de Feijoo sobre la introducción de la Inquisición en Portugal. | — |
| 1734 | Salvador José Mañer | En contra | *Crisol crítico*, dos partes | Responde a la *Demostración* de Sarmiento. | [Escaneo PDF](https://rhinoresourcecenter.com/wp-content/uploads/2016/03/1459160064.pdf); [Google Books](https://books.google.com/books?id=OMqJqnhWy6gC) |
| 1735–1737 | Ignacio de Armesto y Ossorio | Mixta | *Theatro anti-crítico universal*, tres libros | Se presenta como árbitro de la disputa entre Feijoo, Sarmiento y Mañer. | [Escaneo, Universidad de Alicante](https://hdl.handle.net/10045/141582); [Catálogo HathiTrust](https://catalog.hathitrust.org/Record/009312437) |
| 1735 | Jacinto Segura | En contra | *Vindicias históricas por la inocencia de fray Gerónimo Savonarola* | Prosigue la defensa de Savonarola frente a Feijoo. | — |
| 1741 | Alonso Rubiños | En contra | *Theatro de la verdad* | Defiende los exorcismos de animales frente al tomo VIII. | — |
| 1742 | Nicasio de Zárate | En contra | *Bayles mal defendidos y Señeri sin razón impugnado* | Impugna la defensa de los bailes de Feijoo. | [Google Books](https://books.google.com/books?id=yyEaJ0411WEC) |
| 1743–1744, datación bibliográfica | Francisco Arango | En contra | *Carta apologética en favor del anual milagro de las flores* | Defiende el supuesto milagro de las flores de San Luis. | — |
| 1744 | Antonio Raymundo Pasqual | En contra | *El milagro de la sabiduría del B. Raymundo Lulio* | Defiende a Ramón Llull frente a Feijoo. Sermón predicado en 1743. | [Escaneo, BNE](https://bdh-rd.bne.es/viewer.vm?id=0000062624) |
| 1744 | Joaquín Javier de Aguirre | En contra | *El príncipe de los poetas Virgilio, mantenido en su soberanía* | Defiende a Virgilio frente a la preferencia de Feijoo por Lucano. | — |
| 1744 | Juan Ros | En contra | *Relación histórica de la portentosa anual maravilla de las flores de San Luis* | Otra defensa del supuesto milagro. | — |
| 1745 | Feijoo | Autor | *Hecho y derecho en la famosa cuestión de las flores de San Luis* | Responde a los defensores del milagro, en la carta II.29. | [Transcripción](https://www.filosofia.org/bjf/bjfc229.htm) |
| 1746 | Bartolomé Fornés | En contra | *Liber apologeticus Artis Magnae B. Raymundi Lulli* | Defensa de Ramón Llull, escrita en latín. | — |
| 7 nov. 1748 | Fernando VI | A favor | Real decreto que nombra a Feijoo consejero real | Reconocimiento regio a Feijoo. | — |
| 6 mayo 1749 | Francisco de Soto y Marne | En contra | *Reflexiones crítico-apologéticas*, dos tomos | Enumera acusaciones de plagio por discursos, entre ellas las de Parent y el hierro en las plantas. Las licencias son de 1748. | [Tomo I](https://archive.org/details/b30526863_0001); [tomo II](https://archive.org/details/b30526863_0002) |
| 23 sep. 1749 | Feijoo | Autor | *Justa repulsa de inicuas acusaciones* | Responde a Soto y Marne y rechaza sus acusaciones de plagio. | [Transcripción](https://www.filosofia.org/bjf/bjfvjr5.htm) |
| 23 jun. 1750 | José de Carvajal y Lancáster, por orden de Fernando VI | A favor | Real orden sobre las impugnaciones a Feijoo | Prohíbe el tercer tomo de Soto y Marne y nuevas impugnaciones. Original citado: BNE, ms. 10.579, ff. 31v–32r. | [Transcripción en Caso y Cerra, n.º 283](https://digibuo.uniovi.es/dspace/handle/10651/78468) |
| sep. 1750 | Francisco de Soto y Marne | En contra | *Memorial a la Majestad Católica* | Reacciona a la prohibición de sus impugnaciones. | — |
| 1750 | Lucas Ramírez, atribuido | A favor | *La derrota de los alanos* | Respuesta a las *Reflexiones* de Soto y Marne. | [Escaneo, BNE](https://bdh-rd.bne.es/viewer.vm?id=0000106623) |

Fuentes: [Caso González y Cerra Suárez, *Bibliografía feijoniana* (1981)](https://digibuo.uniovi.es/dspace/handle/10651/78468); [Campomanes, *Noticia de la vida y obras* (1765)](https://www.filosofia.org/bjf/bjft1p1.htm).

</details>

Todo este debate es bastante injusto con Feijoo, que [dejaba claro que leía y se inspiraba en estos textos](https://www.filosofia.org/bjf/bjft3p6.htm), aunque distinguía entre aprovechar un libro y traducirlo. Igualmente dejo algunos de mis títulos increíbles como:

- [*Crítico y cortés castigo de pluma*](https://digibuo.uniovi.es/dspace/bitstream/handle/10651/78468/1b-Ediciones-Feijoo-Obras-completas-t-I-Bibliografia-o.pdf?sequence=1)
- [*Justa repulsa de inicuas acusaciones*](https://www.filosofia.org/bjf/bjfvjr5.htm) (1749)
- [*Blanda, suave y melosa respuesta a los ferinos y furiosos apuntamientos*](https://liburutegibiltegi.bizkaia.eus/handle/20.500.11938/76301)
- [*Contradefensa crítica a favor de los hombres*](https://digibuo.uniovi.es/dspace/bitstream/handle/10651/78468/1b-Ediciones-Feijoo-Obras-completas-t-I-Bibliografia-o.pdf?sequence=1)
- [*Cantáridas amigables para remedio de sueños desvariados*](https://cervantesvirtual.com/obra/cantaridas-amigables-para-remedio-de-suenos-desvariados-i-consejos-de-coromias-a-torres-dormido-sobre-le-montante-que-manejo-en-la-pendencia-musica-sonada-988743/)
- [*Blanda, suave y melosa curación del Escrupuloso y de sus flatos espirituales*](https://liburutegibiltegi.bizkaia.eus/handle/20.500.11938/76327)
- [*Montante christiano, y político, en pendencia Música-Médica-Diabólica*](https://digibuo.uniovi.es/dspace/bitstream/handle/10651/78468/1b-Ediciones-Feijoo-Obras-completas-t-I-Bibliografia-o.pdf?sequence=1)
- [*Templador médico de la furia vulgar*](https://wellcomecollection.org/works/mupc5k65)

Ojalá más posts se titularan de esta forma!

## Proceso

Cuatro líneas ocupan unas 35–40 palabras en las primeras ediciones. Inicialmente comparé los tomos I, II y III con las entregas anteriores de las *Memorias de Trévoux* y con el único tomo del *Journal des Sçavans* que Feijoo decía tener. Después amplié la búsqueda a los tomos IV y V y a Trévoux hasta 1732 para comprobar el reto de 1733, que ya no mencionaba el *Journal* ni fijaba cuatro líneas. La búsqueda se expandía al encontrar casos prometedores, ya que buscaba también los libros que se mencionaban en el artículo de la revista correspondiente.

Hay una infinidad de coincidencias temáticas, pero para contar un pasaje tiene que ser una traducción clara o una paráfrasis con alguna señal concreta de dependencia: mismo error, misma secuencia poco habitual de datos...

### Corpus

Obtener los documentos con un buen OCR no fue para nada trivial. El [Centro de Digitalización de Múnich (MDZ)](https://www.digitale-sammlungen.de/en/contact) amablemente me dio acceso a sus archivos, pero acabé rehaciendo el OCR de escaneos de Internet Archive para mejor calidad.

<details markdown="1">
<summary>Documentos descargados y OCR</summary>

| Documento | Descargado | OCR |
|---|---|---|
| TCU I–V | [Transcripciones](https://www.filosofia.org/bjf/bjft000.htm); primeras ediciones [I](https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44), [II](https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a) y [III](https://bnedigital.bne.es/bd/es/viewer?id=911fba8d-7ad3-4d7e-9332-a05cb636e5a9), 664 aperturas; PDF e imágenes de [IV–V](https://hdl.handle.net/10347/7540) | OCR de la BNE para I–III; transcripciones de trabajo para I–V |
| Trévoux, Getty / [Internet Archive](https://archive.org/details/memoirespourlhis1701unse), 1701–1732 | 129 tomos: imágenes y texto ABBYY | Rehecho con Kraken + PP-OCRv6-medium: 66.964 hojas de 1701–1729 y unas 7.034 de 1730–1732 |
| Trévoux, [BSB/MDZ](https://www.digitale-sammlungen.de/en/view/bsb10539793), 1701–1732, y [reimpresión de Ámsterdam](https://www.digitale-sammlungen.de/en/view/bsb11040060) | 134 tomos, incluidos nueve de Ámsterdam; imágenes puntuales. Falta julio–septiembre de 1727 | 78.908 páginas hOCR descargadas |
| [Journal des Sçavans de 1682](https://www.digitale-sammlungen.de/en/view/bsb10539522), Ámsterdam, 1683 | 482 imágenes | OCR de BSB para 60; Tesseract para las otras 422 |
| Histoire de l'Académie royale des sciences, 1699–1728 | Texto de 30 volúmenes | OCR existente |
| Bayle, Dictionnaire historique et critique, 1702 | Tres tomos: [I](https://archive.org/details/bub_gb_9zPfImQPeQkC), [II](https://archive.org/details/b30456198_0001), [III](https://archive.org/details/bub_gb_Gqo-AAAAcAAJ) | OCR existente |
| Menagiana, 1729 | Cuatro tomos | OCR existente |
| Fontenelle, Œuvres diverses, 1728–1729 | Tres tomos | OCR existente |
| Moréri | Cuatro tomos de 1717 y dos del Supplément de 1716 | OCR existente |
| Montfaucon, L'Antiquité expliquée, 1719 | Diez tomos | Texto existente |
| Dictionnaire de Trévoux, 1721 | Texto | Texto existente |
| Escritos de la polémica | PDFs, imágenes o textos de Estrado, Tertulia, Mañer 1729/1731/1734, Sarmiento 1732, Soto Marne 1749, respuestas de Feijoo y Bibliografía feijoniana | OCR o transcripciones, según el documento |
| Fuentes de cada caso | Libros reseñados, memorias científicas y otros textos: PDFs, imágenes o transcripciones | Según disponibilidad |

</details>

### OCR

La mayoría de los documentos tienen versiones en línea, pero suelen tener correcciones de ediciones posteriores y cambios para hacerlos más legibles, por lo que necesitamos la primera edición. La mayoría del procesamiento lo hice en [mi servidor](https://blog.m19182.dev/writings/Building-my-Homelab/) con una RTX 3090. El OCR corrió en la GPU y en la CPU para paralelizar durante unos tres días. Inicialmente calculaba que iba a necesitar más de una semana pero varias optimizaciones por el camino permitieron bajar el tiempo.

Después de probar unos cuantos me decanté por [Kraken](https://dh-abstracts.library.virginia.edu/works/9912), un modelo especializado en textos históricos muy flexible, para localizar las líneas de cada página y PP-OCRv6-medium para reconocer el texto. La [documentación de Kraken](https://kraken.re/main/index.html) explica las dos etapas.

Era importante tener en cuenta las particularidades de las imprentas de la época que mencioné antes. El texto de Internet Archive ya tenía OCR, pero con bastantes problemas (s larga -> f, muchas palabras partidas...). Hice un benchmark con unas páginas de cada tomo donde tenía transcripción de referencia para comparar. Los LLMs multimodales funcionaban todos muy mal (gpt6, moondreamV2, Gemini 3.8) y no era viable el coste.

![Error de caracteres de los motores OCR en la muestra de Trévoux](/data/feijoo-preview/blog/figures/fig7_ocr.png)

![Comparación del pasaje subrayado de Trévoux con el OCR antiguo y el nuevo](/data/feijoo-preview/blog/documents/web/ocr_1716_comparacion.png)


<details markdown="1">
<summary>Ejemplos</summary>

![Escaneo pálido de Trévoux de 1703, página 202](/data/feijoo-preview/blog/documents/web/ocr_1703_p202.jpg)
*1703, p. 202: escaneo pálido y nombres en cursiva. [Original de Internet Archive](https://archive.org/download/memoirespourlhis1703unse/page/leaf212.jpg).*

![Trévoux de 1729, página 1410, con cursivas y espaciado estrecho](/data/feijoo-preview/blog/documents/web/ocr_1729_p1410.jpg)
*Agosto de 1729, p. 1410: cursivas, ligaduras y espaciado estrecho. [Original de Internet Archive](https://archive.org/download/memoirespourlhi1729unse_1/page/leaf260.jpg).*

</details>

### Juntar

Con los textos disponibles, hay que buscar pasajes copiados y verificarlos. El [trabajo de Hinderks, Ledins, Ginter y Tolonen sobre «translation mining»](https://doi.org/10.1080/01615440.2026.2675558) es muy cercano a esto. La idea es calcular embeddings de los fragmentos, que representan su contenido como vectores y permiten comparar textos en distintos idiomas. Dos frases que dicen algo parecido deberían estar cerca independientemente del idioma. Hay otros precedentes, como [Roe, Olsen y Morrissey](https://hal.science/hal-03740005), que buscaron traducciones de la *Cyclopaedia* en la *Encyclopédie* usando traducción automática y alineación de textos.

Aplicar esto de forma naive da muchísimos falsos positivos. Feijoo y las revistas francesas hablaban constantemente de los mismos temas, citando a los mismos autores y obras. Probé varios modelos y el que mejor resultados daba con diferencia era [LaBSE](https://huggingface.co/sentence-transformers/LaBSE). Este modelo se [entrenó específicamente para traducciones](https://aclanthology.org/2022.acl-long.62/). Valoré reentrenar con datos específicos de Feijoo, pero queda como posible trabajo futuro, no creo que valga la pena.

Una puntuación alta por sí sola decía poco, así que usé [margin scoring](https://aclanthology.org/P19-1309/). Comparaba la similitud de cada pareja con la que ambos fragmentos tenían con sus alternativas más parecidas del otro idioma. Si se parecían mucho entre sí, pero también a muchos otros, la puntuación bajaba, y viceversa. Esto ayudaba a elegir qué coincidencias merecía la pena revisar.
También me fijé en nombres propios y números, que suelen sobrevivir a una traducción, para encontrar regiones de interés. Las citas en latín no fueron útiles ya que tendían a repetirse en muchos sitios.

Para complementar, también traduje automáticamente el texto de Feijoo al francés y comparé palabras poco frecuentes. El tipo de falsos positivos que encontraba era distinto del de los embeddings, pero hoyó algún caso adicional como el de los planetas que detallo luego. Hubo que limpiar muchos duplicados, debido a que iba haciendo el análisis al mismo tiempo que procesaba los datos.

Por último, para comprobar cómo de bien funcionaba este proceso, planté casos artificiales entre texto de Feijoo. En los ejemplos más difíciles, llegaba a recuperar 42 de 50, los que no eran sobre todo paráfrasis de la traducción automática. Estoy seguro que no he detectado la totalidad de casos posibles.
### Verificar

Aquí quedó la mayor parte del trabajo. Los detectores sacaban muchos casos pero cada candidato era bastante abierto a la interpretación.

Un primer agente leía los fragmentos y los clasificaba como traducción, paráfrasis cercana, dato compartido o ruido. Los casos más prometedores recibían una revisión adversarial, y cualquier discrepancia volvía al primer paso para reclasificar. Si pasaba este primer filtro, se comparaba de nuevo con las primeras ediciones y demás fuentes mencionadas. Trévoux era una revista de reseñas, el paralelo solía venir del libro que se comentaba, y quería identificar esos casos como tales. Lo mismo con las traducciones ya identificadas, Mañer, Sarmiento, Soto Marne y la bibliografía posterior validaron muchos de los casos que encontré.

Finalmente, comprobé a mano todas las que pasaban el proceso entero, lo cual llevó un buen tiempo, a cambio me llevo la capacidad de leer libros del siglo XVIII de forma relativamente fluida.

![Pipeline completo: descarga, OCR, preparación de textos, dos vías de búsqueda, evaluación, revisión de fuentes y clasificación de los casos](/data/feijoo-preview/blog/figures/fig6_pipeline.png)

### Trabajar con agentes

Al contrario de muchos de mis amigos, aún mantengo cierta reticencia a lanzar swarms de agentes contra una tarea con poca supervisión. En mi experiencia, aún no funcionan igual de bien que llevándolos un poco de la mano.[^4] La tendencia es clara a que cada vez necesitan menor supervisión y son capaces de acometer tareas de mayor longitud, no me extrañaría que en unos meses este mismo blog lo pudiese replicar un prompt relativamente sencillo, pero por ahora fue necesario estar bastante involucrado en el proceso.

Una de las cosas que encuentro es que se centran y malgastan ingentes cantidades de tiempo y tokens en detalles, que con un mínimo de visión global se desmoronan. Pero sin duda el mayor problema fue lidiar con la pérdida de contexto a lo largo del tiempo. La forma en que acabé funcionando era con un agente principal que orquestaba múltiples subagentes (comúnmente unos 10) á la cursor projects, que eran los que hacían el trabajo real (revisar casos prometedores, monitorizar las runs de OCR, revisar literatura...). Usé tanto Opus5.5 como GPT-6Astra, con anecdóticamente mejores resultados con Opus.

El otro gran problema era la documentación, ya que la mayoría de los subagentes tenían una tarea definida y luego desaparecían, e intentaba evitar rellenar el contexto de los orquestadores con cosas no relevantes, documentaba casi todos los hechos relevantes en mds. Esto tuvo como consecuencia que tenía cientos de documentos, escritos en una prosa extremadamente incómoda de digerir, y gran parte de ellos con preguntas ya resueltas, hipótesis ya probadas, datos que ya descubrimos como incorrectos...

La solución fue una mezcla de agentes que se encargaban de revisar rutinariamente la documentación, y mucha más revisión manual de la que está me gustaría admitir. Me hacen falta manos para contar la de veces que un subagente saltaba con un "descubrimiento rompedor" que se hundía al más mínimo escrutinio. Los LLMs tienden a sobreestimar su trabajo y a infravalorar sus capacidades al mismo tiempo.

Otra cosa a tener en cuenta en un set-up como este, es que va a sobreindexar sobre tus palabras de sobremanera, y es importante tenerlo en cuenta cada vez que hablas con el orquestador. Más de una ocasión comenzó a steerear a múltiples subagentes con instrucciones dirigidas a una tarea concreta. Al mismo tiempo, la forma de conversar con él tiene un efecto enorme, el ejemplo más claro son [los chats de Terence Tao](https://chatgpt.com/share/6a5fdc7a-d6f8-83e8-bbea-8deb42cfed56), donde, sin hacer prompts realmente complejos, y con acceso a los mismos modelos que yo, consigue unos resultados increíbles.

Fueron bastante inútiles para escribir este post, pero para corregir errores y proponer sitios donde la prosa es mejorable sí que ayudaron bastante. A medida que escribía más, las sugerencias se fueron afinando bastante pero sin llegar a acertar. Tener un corpus de texto tuyo es útil para mantener una voz parecida, sin embargo sí que encuentro que en ocasiones, mi forma de escribir (¡incluso de hablar!) empieza a parecerse a la de un LLM. Esto ya lo había observado en compañeros anteriormente pero escribiendo aquí me encontré corrigiéndome a mí mismo en varias ocasiones. Me preocupa que esto esté ocurriendo a gran escala.

## Resultados

Hasta ahora encontré unos 10 sitios donde estoy bastante seguro de que resuelven el reto, con múltiples adicionales que pueden contar según la interpretación de las normas.

| Búsqueda | Candidatos juzgados | Estrictos (A) | Dependientes o cortos (B/C) | Traducciones citadas (D) |
|---|---:|---:|---:|---:|
| Reto de 1729: TCU I–III frente a Trévoux y el tomo de 1682 del *Journal* | 633 | 9 + 2 en el límite | 4 B + 4 C | 4 |
| Ampliación de 1733: TCU IV–V frente a Trévoux hasta 1732 | 237 | 1 | 1 B + 2 C | 8 |

<details markdown="1">
<summary>Tabla de casos del reto</summary>

| Caso | Feijoo | Trévoux | Palabras estrictas | Por qué cuenta; qué se sabía |
|---|---|---|---:|---|
| C001, manchas solares | II.14, 1728 | Parent, feb. 1716 | ≈128 | Comparte un error sobre el libro de las *Geórgicas* y «Tum caput». Mañer ya señaló el artículo en 1729. |
| C002, hierro en plantas | II.14, 1728 | Lémery, mar. 1707 | ≈180 | Sigue la sintaxis de la reseña y detalles ausentes de la memoria original. Soto Marne señaló parte del pasaje. |
| C003, abadesa de Fontevrault | I.16, 1726 | Dic. 1704 | ≈54 | La combinación de reina, rey y versos quemados falta en Moréri. No encontré una identificación anterior. |
| C004, Filipinas | II.2, 1728 | Taillandier, jul. 1715 | ≈127 | Calcos y el mismo error geográfico: Dapitan pasa a Magallanes. Mañer ya lo denunció. |
| C005, sectas médicas | I.5, 1726 | Barchusen, nov. 1710 | ≈120 | Sigue el orden y las fusiones de la reseña, no del libro. Feijoo reveló en 1727 que tenía ese extracto de Trévoux. |
| C009, modos musicales | I.14, 1726 | Bonnet, abr. 1716 | 37–51 | Repite una secuencia de caracterizaciones y «Subphrigio». No encontré una identificación anterior. |
| C010, longevidad | I.12, 1726 | Temple, jul. 1702 | 43 | Conserva «Nesmond» y el alcance de «toute l'Angleterre» de la reseña. No encontré una identificación anterior. |
| C017, anillos planetarios | III.2, 1729 | Feb. 1718 | ≈82 | Atribuye la historia a Camilo Leonardo, pero su libro no contiene esos detalles; sigue la reseña francesa. No encontré una identificación anterior. |
| C020, mano de gigante | I.12, 1726 | Sep.–oct. 1701 | 54 | Feijoo cita las *Transacciones* inglesas, pero sigue el recorte francés, que omite la marsopa. No encontré una identificación anterior. |
| C012, vidas de santos | III.6, 1729 | Mayo–jun. 1701 | ≈48–51, límite | Una frase sigue la condensación del reseñista; la dependencia de Trévoux queda cerca del umbral. |
| C038, modas | II.6, 1728 | Henrion, feb. 1702 | 38, mínimo 30 | Frase traducida cláusula a cláusula. Salió de una muestra leída a mano, no de los detectores; queda por comprobar el *Mercure galant*. |
| D2-C007, Behaim | IV.8, 1730 | Stuvenius, mayo 1716 | ≈98, mínimo 39 | Sigue el orden y detalles de la reseña que no están en el libro latino. Sin identificación previa localizada. Las búsquedas en el Journal y las Acta, incluidos los suplementos revisados, no encontraron otra reseña equivalente. |

</details>

### Las manchas solares

Este caso lo había señalado Mañer en 1729. En las [*Paradojas físicas*](https://www.filosofia.org/bjf/bjft214.htm), Feijoo habla de las manchas del Sol, reuniendo historias y observaciones de manchas enormes. Este mismo tema aparece en un artículo de Antoine Parent en Trévoux 1716, doce años antes del segundo tomo de TCU.

Cuando menciona a Virgilio, ambos escritos sitúan unos versos en el segundo libro de las *Geórgicas*, cuando realmente están en [el primero, versos 466–468](https://www.thelatinlibrary.com/vergil/geo1.shtml). Feijoo reorganiza parte de la explicación y corrige algún otro detalle, pero es uno de los ejemplos más claros de cómo probablemente iba trabajando sobre el texto francés adaptándolo a medida.

[Pasajes y fuentes del caso C001](/data/feijoo-evidence/cases/C001.html).

### Un anillo para hacerse rico y leer pensamientos

Este caso apareció por la otra vía de búsqueda, después de traducir el texto de Feijoo al francés. En [*Secretos de Naturaleza*](https://www.filosofia.org/bjf/bjft302.htm), Feijoo atribuye a Camilo Leonardo una lista de siete piedras, siete metales y sus planetas correspondientes. Después cuenta cómo fabricar un anillo que daría riquezas. La reseña de Trévoux de febrero de 1718 cuenta lo mismo, pero está hablando de tres autores. El primero es Camilo Leonardo; la lista de correspondencias viene del segundo, Pierre d'Arleu; el ejemplo del anillo, del tercero, Albinius. Feijoo se queda con el nombre que aparece al principio y le atribuye todo el bloque.

[Pasajes, libros originales y fuentes del caso C017](/data/feijoo-evidence/cases/C017.html).

### Ejemplos

Estos son los recortes de las primeras ediciones. Abre cada caso para compararlos.

<details class="feijoo-case">
<summary>C001 · manchas solares</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C001_feijoo.jpg" alt="Recorte de Feijoo: manchas solares (C001)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · II (1728), p. 250, n. 23 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C001_trevoux.jpg" alt="Recorte de Trévoux: manchas solares (C001)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · febrero 1716, art. XXIV, p. 331 · <a href="https://www.digitale-sammlungen.de/view/bsb10539854?page=345" target="_blank" rel="noopener noreferrer">BSB</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C002 · hierro en plantas</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C002_feijoo.jpg" alt="Recorte de Feijoo: hierro en plantas (C002)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · II (1728), p. 258, n. 39 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C002_trevoux.jpg" alt="Recorte de Trévoux: hierro en plantas (C002)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · marzo 1707, art. XXXIV, p. 479 · <a href="https://www.digitale-sammlungen.de/view/bsb10539818?page=507" target="_blank" rel="noopener noreferrer">BSB</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C003 · abadesa de Fontevrault</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C003_feijoo.jpg" alt="Recorte de Feijoo: abadesa de Fontevrault (C003)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · I (1726), p. 361, n. 122 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C003_trevoux.jpg" alt="Recorte de Trévoux: abadesa de Fontevrault (C003)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · diciembre 1704, art. CLXXXIX, p. 2119 · <a href="https://www.digitale-sammlungen.de/view/bsb10539809?page=507" target="_blank" rel="noopener noreferrer">BSB</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C004 · Filipinas</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C004_feijoo.jpg" alt="Recorte de Feijoo: Filipinas (C004)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · II (1728), p. 53, nn. 73–74 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C004_trevoux.jpg" alt="Recorte de Trévoux: Filipinas (C004)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · julio 1715, art. XCVII, pp. 1163–1164 · <a href="https://www.digitale-sammlungen.de/view/bsb10539852?page=71" target="_blank" rel="noopener noreferrer">BSB 1</a>; <a href="https://www.digitale-sammlungen.de/view/bsb10539852?page=72" target="_blank" rel="noopener noreferrer">BSB 2</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C005 · sectas médicas</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C005_feijoo.jpg" alt="Recorte de Feijoo: sectas médicas (C005)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · TCU I (1726), p. 112 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C005_trevoux.jpg" alt="Recorte de Trévoux: sectas médicas (C005)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · nov. 1710, p. 1954 · <a href="https://archive.org/details/memoirespourlhi1710unse_2/page/n309" target="_blank" rel="noopener noreferrer">Internet Archive</a></figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C009 · modos musicales</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C009_feijoo.jpg" alt="Recorte de Feijoo: modos musicales (C009)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · TCU I (1726), p. 274 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C009_trevoux.jpg" alt="Recorte de Trévoux: modos musicales (C009)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · abr. 1716, p. 597; abr. 1716, p. 598 · <a href="https://archive.org/details/memoirespourlhi1716unse_0/page/n54" target="_blank" rel="noopener noreferrer">Internet Archive 1</a>; <a href="https://archive.org/details/memoirespourlhi1716unse_0/page/n55" target="_blank" rel="noopener noreferrer">Internet Archive 2</a></figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C010 · longevidad</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C010_feijoo.jpg" alt="Recorte de Feijoo: longevidad (C010)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · TCU I (1726), p. 234 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C010_trevoux.jpg" alt="Recorte de Trévoux: longevidad (C010)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · jul. 1702 (portada con errata «1701»), p. 78; sept.–oct. 1701, p. 299 · <a href="https://archive.org/details/memoirespourlhi1702unse_2/page/n81" target="_blank" rel="noopener noreferrer">Internet Archive 1</a>; <a href="https://archive.org/details/memoirespourlhi1701unse_1/page/n302" target="_blank" rel="noopener noreferrer">Internet Archive 2</a></figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C017 · anillos planetarios</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C017_feijoo.jpg" alt="Recorte de Feijoo: anillos planetarios (C017)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · TCU III (1729), p. 25 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=911fba8d-7ad3-4d7e-9332-a05cb636e5a9" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C017_trevoux.jpg" alt="Recorte de Trévoux: anillos planetarios (C017)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · feb. 1718, p. 334; feb. 1718, p. 336 · <a href="https://archive.org/details/memoirespourlhis1718unse/page/n342" target="_blank" rel="noopener noreferrer">Internet Archive 1</a>; <a href="https://archive.org/details/memoirespourlhis1718unse/page/n344" target="_blank" rel="noopener noreferrer">Internet Archive 2</a></figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C020 · mano de gigante</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C020_feijoo.jpg" alt="Recorte de Feijoo: mano de gigante (C020)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · I.12, §VIII, n. 23, p. 243 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C020_trevoux.jpg" alt="Recorte de Trévoux: mano de gigante (C020)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · septiembre–octubre 1701, p. 291 · <a href="https://www.digitale-sammlungen.de/view/bsb10539794?page=543" target="_blank" rel="noopener noreferrer">BSB</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C012 · vidas de santos (límite)</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C012_feijoo.jpg" alt="Recorte de Feijoo: vidas de santos (límite) (C012)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · III.6, §I, n. 5, p. 99 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=911fba8d-7ad3-4d7e-9332-a05cb636e5a9" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C012_trevoux.jpg" alt="Recorte de Trévoux: vidas de santos (límite) (C012)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · mayo–junio 1701, p. 62 · <a href="https://www.digitale-sammlungen.de/view/bsb10539793?page=524" target="_blank" rel="noopener noreferrer">BSB</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C038 · modas (límite)</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C038_feijoo.jpg" alt="Recorte de Feijoo: modas (límite) (C038)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · II.6, §II, n. 6, p. 141 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C038_trevoux.jpg" alt="Recorte de Trévoux: modas (límite) (C038)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · febrero 1702, pp. 10–11 · <a href="https://www.digitale-sammlungen.de/view/bsb10539798?page=226" target="_blank" rel="noopener noreferrer">BSB 1</a>; <a href="https://www.digitale-sammlungen.de/view/bsb10539798?page=227" target="_blank" rel="noopener noreferrer">BSB 2</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>D2-C007 · Behaim (reto de 1733)</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/D2-C007_feijoo.jpg" alt="Recorte de Feijoo: Behaim (reto de 1733) (D2-C007)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · IV.8, §XXXIX, n. 85, p. 210 (continúa en p. 211) · <a href="https://hdl.handle.net/10347/7540" target="_blank" rel="noopener noreferrer">USC Minerva</a></figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/D2-C007_trevoux.jpg" alt="Recorte de Trévoux: Behaim (reto de 1733) (D2-C007)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · mayo 1716, art. LVI, pp. 849–850 · <a href="https://www.digitale-sammlungen.de/view/bsb10539855?page=315" target="_blank" rel="noopener noreferrer">BSB 1</a>; <a href="https://www.digitale-sammlungen.de/view/bsb10539855?page=316" target="_blank" rel="noopener noreferrer">BSB 2</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

### Copias de otros libros

El reto solo mencionaba a Trévoux y el Journal, pero ya que tenía montado esto lo paso por otras fuentes francesas (la *Histoire* de la Académie des sciences, el *Dictionnaire* de Bayle, Moréri, la *Menagiana* y Fontenelle). Salen unos 17 pasajes, casi todos de Moréri. No es de extrañar, Feijoo tiene citadas estas obras en varios de sus escritos, pero estos son los sitios que no citó:

<details markdown="1">
<summary>Tabla de ejemplos de otros libros</summary>

| Caso | Feijoo | Libro | Palabras sin citar | Qué lo delata |
|---|---|---|---:|---|
| [O153, el caballero Borri](/data/feijoo-evidence/cases/O153.html) | III.2, 1729 | Bayle 1702 (Moréri reimprime el texto principal) | ≈800 | Sigue el artículo y sus notas en el mismo orden. En todo el discurso solo cita a Moréri, y para otra cosa. |
| [O508, las sabias italianas](/data/feijoo-evidence/cases/O508.html) | I.16, 1726 | Moréri, siete artículos | ≈585 | Bucca, Nogarola, Cereti, Fidele, Cibo, Marchina y Cornaro. Moréri es el único texto revisado que trae a las siete. |
| [O526, Apolonio de Tiana](/data/feijoo-evidence/cases/O526.html) | II.5, 1728 | Du Pin 1705 | ≈420 | «Ciento y veinte años», como el «six vingt ans» de Du Pin; Trévoux dice 110. Cita a Filóstrato y a Luciano, no a Du Pin. |
| [O475, las Sibilas](/data/feijoo-evidence/cases/O475.html) | II.4, 1728 | Moréri | ≈330 | Los «trescientos escudos» de Tarquino y un error de cuenta («Eliano cuatro») que es de Moréri. |
| [O471, Delfos](/data/feijoo-evidence/cases/O471.html) | II.4, 1728 | Moréri | ≈320 | Equécrates y las doncellas «consagradas a Diana», que no están en Van Dale ni en Fontenelle. |
| [O481, las mujeres de Curzolari](/data/feijoo-evidence/cases/O481.html) | I.16, 1726 | Moréri | ≈75 | Dos errores de Moréri: lleva la historia de Korčula a las islas de Lepanto y la fecha «el año antecedente». |
| [O474, la Pobreza](/data/feijoo-evidence/cases/O474.html) | I.3, 1726 | Moréri, edición de París | ≈48 | «Curio, y de Camila» por Camilo, que viene del francés «Camille». |

</details>

Los errores que copia también desvelan qué ejemplar tenía. Por ejemplo, yo descargara el Moréri de Ámsterdam (1716–17), pero «Camila» y la frase de Aristófanes de la Pobreza solo están en las ediciones de París (1707 y 1718).

<details markdown="1">
<summary>Documentos de los ejemplos de otros libros</summary>

<details class="feijoo-case" open>
<summary>O153 · el caballero Borri</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/O153_feijoo.jpg" alt="Recorte de Feijoo: el caballero Borri (O153)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · III (1729), p. 37, n. 38 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=911fba8d-7ad3-4d7e-9332-a05cb636e5a9" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/O153_fuente.jpg" alt="Recorte de Bayle: el caballero Borri (O153)" loading="lazy" decoding="async">
<figcaption><strong>Bayle</strong> · <i>Dictionaire</i>, 1702, t. I, p. 654, BORRI · <a href="https://archive.org/details/bub_gb_9zPfImQPeQkC/page/n693/mode/1up" target="_blank" rel="noopener noreferrer">Internet Archive</a></figcaption>
</figure>
</div>
<p><a href="/data/feijoo-evidence/cases/O153.html">Ficha del caso O153</a></p>
</details>

<details class="feijoo-case">
<summary>O508 · las sabias italianas (Casandra Fidele)</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/O508_feijoo.jpg" alt="Recorte de Feijoo: las sabias italianas (Casandra Fidele) (O508)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · I (1726), p. 364, n. 128 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/O508_fuente.jpg" alt="Recorte de Moréri: las sabias italianas (Casandra Fidele) (O508)" loading="lazy" decoding="async">
<figcaption><strong>Moréri</strong> · 1717, t. II, p. 71, FIDELE · <a href="https://archive.org/details/legranddictionai02mor/page/n78/mode/1up" target="_blank" rel="noopener noreferrer">Internet Archive</a></figcaption>
</figure>
</div>
<p><a href="/data/feijoo-evidence/cases/O508.html">Ficha del caso O508</a></p>
</details>

<details class="feijoo-case">
<summary>O526 · Apolonio de Tiana</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/O526_feijoo.jpg" alt="Recorte de Feijoo: Apolonio de Tiana (O526)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · II (1728), p. 110, n. 13 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/O526_fuente.jpg" alt="Recorte de Du Pin: Apolonio de Tiana (O526)" loading="lazy" decoding="async">
<figcaption><strong>Du Pin</strong> · <i>L'Histoire d'Apollone</i>, 1705, pp. 6–7 · <a href="https://www.digitale-sammlungen.de/view/bsb10773200?page=42" target="_blank" rel="noopener noreferrer">BSB</a></figcaption>
</figure>
</div>
<p><a href="/data/feijoo-evidence/cases/O526.html">Ficha del caso O526</a></p>
</details>

<details class="feijoo-case">
<summary>O475 · las Sibilas</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/O475_feijoo.jpg" alt="Recorte de Feijoo: las Sibilas (O475)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · II (1728), p. 78, n. 3 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/O475_fuente.jpg" alt="Recorte de Moréri: las Sibilas (O475)" loading="lazy" decoding="async">
<figcaption><strong>Moréri</strong> · 1717, t. IV, p. 386, SIBYLLES · <a href="https://archive.org/details/legranddictionai04mor/page/n393/mode/1up" target="_blank" rel="noopener noreferrer">Internet Archive</a></figcaption>
</figure>
</div>
<p><a href="/data/feijoo-evidence/cases/O475.html">Ficha del caso O475</a></p>
</details>

<details class="feijoo-case">
<summary>O471 · el oráculo de Delfos</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/O471_feijoo.jpg" alt="Recorte de Feijoo: el oráculo de Delfos (O471)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · II (1728), p. 82, n. 11 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/O471_fuente.jpg" alt="Recorte de Moréri: el oráculo de Delfos (O471)" loading="lazy" decoding="async">
<figcaption><strong>Moréri</strong> · 1717, t. II, p. 335, DELPHES · <a href="https://archive.org/details/legranddictionai02mor/page/n342/mode/1up" target="_blank" rel="noopener noreferrer">Internet Archive</a></figcaption>
</figure>
</div>
<p><a href="/data/feijoo-evidence/cases/O471.html">Ficha del caso O471</a></p>
</details>

<details class="feijoo-case">
<summary>O481 · las mujeres de Curzolari</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/O481_feijoo.jpg" alt="Recorte de Feijoo: las mujeres de Curzolari (O481)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · I (1726), p. 332, n. 47 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/O481_fuente.jpg" alt="Recorte de Moréri: las mujeres de Curzolari (O481)" loading="lazy" decoding="async">
<figcaption><strong>Moréri</strong> · 1717, t. II, p. 311, CURSOLAIRES · <a href="https://archive.org/details/legranddictionai02mor/page/n318/mode/1up" target="_blank" rel="noopener noreferrer">Internet Archive</a></figcaption>
</figure>
</div>
<p><a href="/data/feijoo-evidence/cases/O481.html">Ficha del caso O481</a></p>
</details>

<details class="feijoo-case">
<summary>O474 · la Pobreza</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/O474_feijoo.jpg" alt="Recorte de Feijoo: la Pobreza (O474)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · I (1726), p. 65, n. 38 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/O474_fuente.jpg" alt="Recorte de Moréri: la Pobreza (O474)" loading="lazy" decoding="async">
<figcaption><strong>Moréri</strong> · París, 1707, p. 181, PAUVRETÉ · <a href="https://archive.org/details/bub_gb_FEmV5fxZ9FQC/page/n193/mode/1up" target="_blank" rel="noopener noreferrer">Internet Archive</a></figcaption>
</figure>
</div>
<p><a href="/data/feijoo-evidence/cases/O474.html">Ficha del caso O474</a></p>
</details>

</details>

<details markdown="1">
<summary>Tabla completa de otros libros</summary>

| Caso | Feijoo | Libro | Sin citar | Solo de ese libro | Cita |
|---|---|---|---:|---:|---|
| O153, el caballero Borri | III.2 §XI, nn. 37–40, 1729 | Bayle 1702, BORRI; Moréri *Suppl.* 1716 | ≈800 | ≈80 | ninguna |
| O508, las sabias italianas | I.16 §XVIII, nn. 124–131, 1726 | Moréri 1717, siete artículos | ≈585 | ≈150 | ninguna |
| O526, Apolonio de Tiana | II.5 §V, nn. 12–13, 1728 | Du Pin 1705 | ≈420 | ≈60 | heredada |
| C022, Elena Cornaro Piscopia | I.16, n. 131, 1726 | Moréri 1716, Trévoux oct. 1713 y Leti | ≈355 | ≈35 | Leti, solo para sus elogios |
| O475, las Sibilas | II.4 §I, nn. 3–5, 1728 | Moréri 1717 y *Suppl.* 1716 | ≈330 | ≈60 | heredada |
| O471, Delfos | II.4 §II, nn. 9–11, 1728 | Moréri 1717, dos artículos DELPHES | ≈320 | ≈80 | heredada |
| C007 + C021, las pintoras y Madame Le Hay | I.16 §XXII, nn. 142–145, 1726 | Trévoux 1706 y 1713, Moréri 1716, Carducho 1633, Palomino 1715, Leti | ≈290 | 24 de Trévoux | ninguna |
| O466, Sitti Maani | I.16 §XX, n. 135, 1726 | Moréri 1717 (Thévenot 1663, Rocchi 1627) | ≈280 | ≈15 | ninguna |
| O467, los cumplidos persas | II.15, n. 11, 1728 | Moréri 1717, que abrevia a Olearius | ≈116 | ≈19 | ninguna |
| O510, el ave Anca y Chederles | I.1 §VII, n. 20, 1726 | Moréri *Suppl.* 1716 (Bochart, Busbecq por Bayle) | ≈115 | 0–6 | ninguna |
| C006, lo que comen los pueblos | III.10, n. 10, 1729 | Lémery 1702 o su extracto en Trévoux | ≈79 | | heredada |
| O481, las mujeres de Curzolari | I.16 §VII, n. 47, 1726 | Moréri 1717 (Graziani 1624) | ≈75 | ≈25 | ninguna |
| O476, el tallado del diamante | II.2, n. 66, 1728 | R. de Berquen 1661, Moréri *Suppl.* 1716 | ≈70 | 0–5 | ninguna |
| O478, Ami Perrin | I.4, n. 41, 1726 | Moréri, que abrevia a Maimbourg 1682 | ≈58 | ≈20 | heredada (Maimbourg) |
| O474, la Pobreza | I.3, n. 38, 1726 | Moréri, edición de París | ≈48 | ≈40 | heredada |
| O472, el dios Término | I.4, n. 2, 1726 | Moréri | 44 | ≈14 | heredada |
| O017, los cometas de Villemot | I.10 §IV, n. 15, 1726 | Fontenelle, *Histoire* de la Académie 1707 | 35 (≈130–155 con nn. 13–14) | 35 | ninguna |
| O512, concilios contra la magia | II.5, nn. 63–64, 1728 | Thiers 1697, Moréri | ≈31 | 0 | bajo el umbral |
| C034, las sectas médicas modernas | I.5, nn. 18–21, 1726 | Barchusen 1710 | ≈30 | | bajo el umbral |
| O469, los lemas de san Malaquías | II.4 §VI, nn. 37–40, 1728 | Moréri *Suppl.* 1716 | ≈455 | | cita la obra en el n. 41, para criticarla |
| O234, la vara de Jacques Aymar | III.5, nn. 17–18, 1729 | Bayle, ABARIS, y *Mercure galant* 1693 | ≈118 del *Mercure* | | cita a Bayle |
| O490, la isla de Pines | I.12, nn. 20–22, 1726 | Moréri *Suppl.* 1716 | ≈230 | | cita la obra |
| O157, Agrippa | II.5, nn. 23–27, 1728 | Bayle | ≈250 | | cita la obra |
| O496, Nicolas Flamel | III.8, n. 30, 1729 | Moréri | ≈110 | | cita la obra |
| O255, Gómez Pereira | III.9, nn. 11–12, 1729 | Bayle | ≈110 | | cita al autor |
| C032, el oro de Homberg | II.14, nn. 4–5, 1728 | *Histoire* de la Académie 1702 y 1707 | ≈120 | | cita al autor |
| C033, la trituración de Hecquet | I.6, n. 11, 1726 | Hecquet 1709 | ≈110–130 | | cita al autor |
| C018, Duncan y el café | I.6, n. 13, 1726 | Duncan 1705 | ≈50 | | cita al autor |

«Heredada» quiere decir que Feijoo nombra solo a las autoridades que ya citaba el libro que copia (Suidas, Maimbourg, Lucano…).

</details>

## Conclusiones



Nada de lo que hice aquí es técnicamente complejo o complicado. Mi mayor aspiración con esto es motivar a más gente a dedicar una parte de su tiempo y tokens a esto, si te interesa por favor contáctame:) No obstante, sí me preocupa que atosigar a historiadores con slop de baja calidad, pueda provocar una respuesta de rechazo como ya ocurrió con las matemáticas. Durante el desarrollo de este trabajo, intenté ponerme en contacto con varias personas expertas del tema, la mayoría sin respuesta, y algunos interesados con los que mantengo contacto pero queda como un frente abierto, ya que quería sacar el post lo antes posible.

Otro punto importante es que este trabajo depende de poder acceder a escaneos de los documentos relevantes. ¡Queda muchísimo por digitalizar! Una [encuesta europea de 2017](https://pro.europeana.eu/files/Europeana_Professional/Projects/Project_list/Europeana_DSI-2/Deliverables/d4.4-report-on-enumerate-core-survey-4.pdf#page=28) estimaba que los archivos habían digitalizado un 10 % de sus fondos, y las bibliotecas un 17 %.


Google Books hizo mucho por la digitalización. Los labs están en una carrera por conseguir más datos con incentivos muy fuertes. Proyectos como la [digitalización de fondos de la Biblioteca Pública de Boston](https://www.bpl.org/news/boston-public-library-expands-access-to-collections-through-ai-enhanced-digitization/), o el hecho de que Anthropic [comprase millones de libros, los escanease y desechase los originales](https://cases.justia.com/federal/district-courts/california/candce/3%3A2024cv05417/434709/231/0.pdf#page=4), dan una idea de adónde nos dirigimos. Como ya expuse en [cómo la IA puede ayudar a salvar el copyright](https://blog.m19182.dev/writings/How-AI-might-help-save-copyright/) hace 3 años, las leyes de propiedad intelectual necesitan una reforma urgente, la información merece ser libre y las consecuencias de segundo orden son enormes.

Esto es todo, aquí está [el código y archivos relevantes](https://github.com/mateo19182/feijoo), editaré el post si encuentro algo más relacionado con este reto. Gracias por leer.

[^1]: La razón es una mezcla entre [Reality has a surprising amount of detail](https://johnsalvatier.org/blog/2017/reality-has-a-surprising-amount-of-detail) e infravalorar la fricción del mundo real. Que algo sea técnicamente posible no es el factor más relevante para tener impacto. Llevo con un draft atascado sobre esto varios meses, háblame si te interesa el tema! Al caso [Del rigor en la ciencia, de Borges](https://ciudadseva.com/texto/del-rigor-en-la-ciencia/), .

[^2]: Por mucho que me joda, cada vez me cuesta más encontrar excepciones... En todos los ejemplos que se me ocurren, el diferenciador es una idea, un diseño de producto, un algoritmo o algo que rodea al software. Es posible que esto ya pasara antes de la IA y yo estuviese empanado.

[^3]: Otros nombres relevantes incluyen a Martín Martínez o Tomás Vicente Tosca. Para situarla, [Antonio Mestre Sanchís, *Los novatores como etapa histórica*](https://revistas.usal.es/uno/index.php/Studia_Historica/article/view/2729).

[^4]: Cuando hice este trabajo, Opus 5.5 acababa de salir y para mí fue un salto notable en capacidades. No estoy seguro de que pudiese replicar este post con Opus 5, realmente aborrecía ese modelo, 0 alma.

[^6]: Estimación de Rodríguez Cepeda de 2008 en la [biografía de Feijoo de Inmaculada Urzainqui](https://www.cervantesvirtual.com/portales/benito_jeronimo_feijoo/autor_biografia/). Habla de volúmenes, no de lectores ni de ejemplares vendidos de un solo título.

[^7]: Desde su celda medía el calor de Oviedo con un termómetro en el balcón, experimentaba con la conservación del tabaco y chocolate, usaba un microscopio, defendió que un ayudante de cocina al que intentaban exorcizar sufría epilepsia. [*Vida del Padre Feijoo en la comunidad monástica de San Vicente de Oviedo*](https://doi.org/10.5281/zenodo.8105802), 2017, pp. 7–9 del preprint.

[^censura]: No se libró siempre de la censura. En 1739 la Inquisición [ordenó tachar dos párrafos del tomo VIII](https://doi.org/10.3989/revliteratura.2022.02.025).
