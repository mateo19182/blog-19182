---
title: El reto de Feijoo (borrador)
lang: es
unlisted: true
description: Borrador en curso sobre Feijoo, Trévoux y los retos de 1729 y 1733.
---

## Intro

Parece evidente que estamos en un momento único en la historia, pero no por las razones obvias. Ya está casi todo el mundo enterado de la importancia de la IA, pero hay una serie de circunstancias que se dan desde principios de 2024 hasta dentro de no mucho tiempo que son especialmente únicas.

Este período es lo más cerca que una persona de a pie va a estar a la frontera de los modelos, y la distancia se acrecentará con el tiempo. La culpa de esto es en gran parte de las scaling laws, agravado por labs que cada día están más cerca de ser actores geopolíticos y la entrada de los riesgos existenciales de la IA en el discurso mainstream.

Coincide a su vez con la transición social y económica que estas tecnologías van a provocar, sobre las cuales he cambiado mucho de opinión en los últimos años (leía bastante LessWrong en 2023, imagina). Esto da lugar a multitud de [arbitrajes](https://en.wikipedia.org/wiki/Arbitrage) que seguramente sobrevivan mucho más tiempo de lo que una persona en este mundillo piense[^1].

El más obvio de esos arbitrajes está en el desarrollo de software. Cualquiera tiene acceso a una herramienta que te hace un 50% más productivo, sin embargo, tus jefes esperan una cantidad de trabajo similar de ti! Esto lleva ocurriendo un buen tiempo, y aún a día de hoy sigue siendo posible aprovecharse de eso.

Fundamos Tribosolutions.es bajo esta tesis, y si algo me ha enseñado es que el software no va a ser un moat válido por mucho tiempo[^2]. Como alguien que se considera técnico, y con cierto rechazo hacia las ventas(mrkting post) , es una lección que me ha costado digerir.

![The Diffusion Gap: capacidades de la IA, adopción y oportunidad](/data/feijoo-diffusion-gap.png)

---

Este post es para hablar de uno de estos arbitrajes, que ocupa gran parte de mi atención desde que leí [AI labs need to start funding historical research](https://resobscura.substack.com/p/ai-labs-need-to-start-funding-historical), En resumen, los modelos frontier actuales han llegado al punto en que pueden producir conocimiento histórico original por si mismos, y su conclusión es que los labs deberían financiar colaboraciones con historiadores y archivistas.

Si miras por detrás de los incentivos del autor (es historiador de profesión), lo que a mi me queda es que estamos en un momento único donde cualquiera con el suficiente nivel de espabilado puede conseguir hacer descubrimientos nóveles, antes de que los labs utilicen algunas gpus sobrantes para peinar todos los documentos digitalizados existentes y cerrar todos los cabos restantes.

Ni de lejos soy el único que está pensando en esto, algunos de los ejemplos que inspiraron este proyecto son [el descifrado de un mensaje Enigma del 10 de julio de 1941](https://www.cryptocellar.org/bgac/the-mvueh-break.html), seguido del proyecto de [Daniel Bourdeau](https://dbourdeau.github.io/cyphersolver/index.html) que está cerrando cifrados [más rápido de lo que los pueden comprobar](https://cryptiana.web.fc2.com/code/unsolved.htm). De forma similar a lo que está pasando en las matemáticas, hay cierta incertidumbre a la hora de verificar que los descubrimientos son correctos y nóveles. Los primeros Erdős que solucionó la IA solían basarse en trabajo que no se había ligado al problema, más que en una nueva idea. En mi opinión esto tampoco le resta mucho valor.

En mi caso filtrando que estén relacionados con Galicia / España, que sean razonablemente verificables e interés personal, llegué a una lista de unos cuantos que me gustaría intentar resolver cuanto antes! En este post presento los resultados del primero de ellos, en el que debí trabajar unas 20 horas en total (incluyendo escribir el post), con cientos de horas en tiempo de agentes.

---

En el [_Prólogo apologético_](https://www.filosofia.org/bjf/bjft3p6.htm) del [Teatro crítico universal](https://www.filosofia.org/bjf/bjft000.htm) III (1729), §5, [Benito Jerónimo Feijoo](https://www.cervantesvirtual.com/portales/benito_jeronimo_feijoo/autor_biografia/) escribe (con ortografía modernizada):

> «ni un párrafo solo, ni aun cuatro líneas, que sean traslado, o traducción de ellos [...] quiero que todos tres los des al fuego, y me obligo a restituirte el dinero que te han costado»

![El reto de Feijoo en el prólogo del tomo III, primera edición de 1729](/data/feijoo-reto-1729.jpg)
[Fuente: Biblioteca Nacional de España, primera edición del tomo III (1729), imagen 18, CC BY 4.0.](https://bnedigital.bne.es/bd/es/viewer?id=911fba8d-7ad3-4d7e-9332-a05cb636e5a9)

Si te llama la atención que la "s" parece una "f", se conoce como la S larga y tiene una [historia fascinante](https://typefoundry.blogspot.com/2008/01/long-s.html), relacionada con las imprentas de la época, pero si me paro en cada detalle así no acabaría esto nunca. Lo sé porque cometí ese error en un [post anterior](https://blog.m19182.dev/writings/Consciousness-is-hard/) que nunca llegué a acabar.

El primer reto está claro: comparar los tomos I–III del _Teatro crítico universal_ (TCU de aquí en adelante) con las _Memorias de Trévoux_ y el tomo del _Journal des Sçavans_ que Feijoo decía tener, y ver si encontramos pasajes copiados. [En 1733 lanzó otro reto](https://www.filosofia.org/bjf/bjft517.htm) que ampliaba la comparación a los tomos I–V y a las entregas posteriores de Trévoux. Comprobé también ese segundo reto.

Quiero tocar todos los palos, en la próxima sección hablaré del contexto histórico, que además de ser relevante para el problema, es muchísimo más interesante de lo que uno se espera de un monje del siglo XVIII. Después hablaré de la parte más técnica y finalmente de lo que fue el desarrollo del problema y resultados. Si no te interesa algo, saltátelo!

---

## Contexto histórico

Benito Jerónimo Feijoo nace en 1676 en Casdemiro, cerca de Ourense, primogénito de una familia acomodada de la nobleza media gallega. Entró pronto al monasterio benedictino de Samos, contradiciendo el camino natural del primer hijo (dentro del matrimonio). Estudió y ejerció de profesor en Galicia, Salamanca y León, y llegó a San Vicente de Oviedo en 1709, donde permaneció el resto de su vida (pese a múltiples invitaciones de moverse ciudades más relevantes). Allí compaginó su estudio y docencia universitaria con su carrera eclesiástica hasta su muerte a los 87 años. Su popularidad fue tal que recibía visitas de personas interesadas en conocerlo.

Los monasterios y universidades formaban una red de transmisión de conocimiento inigualable en esos momentos, se prestaban libros entre sí y se ayudaban a conseguir novedades. Feijoo leía latín y francés. A menudo conocía las ideas inglesas o alemanas por su versión francesa. En esta época (finales del siglo XVII) comienza una suerte de ilustración española, médicos, matemáticos y filósofos (llamados «novatores») que instaban a atender a la observación y a los conocimientos llegados de Europa.[^3] Mientras que no fue el primero en discutir estas ideas "racionalistas", se le considera el líder intelectual dada su enorme influencia.

La llegada del primer Borbón, Felipe V, provocó la Guerra de Sucesión, y los cambios que siguieron fueron generalmente en favor de la expansión de  estos ideales. Se crearon nuevos lugares para reunir libros y discutir la lengua (La Biblioteca Real abrió en Madrid en 1712; la Real Academia Española, empezó a publicar su _Diccionario de autoridades_ en 1726.)  Los libros extranjeros circulaban, pero conseguirlos exigía dinero, contactos y tiempo. Lo que él podía acceder desde Oviedo no tenía comparación con Madrid.

El primer tomo de TCU se publica en 1726, con Feijoo todavía con 49 años y España con un cuarto de siglo de dinastía borbónica. El nombre del título engaña, no tiene nada que ver con el teatro, eran más bien «discursos varios en todo género de materias, para desengaño de errores comunes». Medicina, astrología, música de iglesia, lenguas... uno de sus argumentos más polémicos fue la "_Defensa de las mujeres_".

La publicación de estos tomos venía en gran parte instada por sus superiores eclesiásticos, lo cual fue especialmente relevante ya que los impresos seguían necesitando aprobaciones y licencias (más de 10 primeras páginas de la primera edición son aprobaciones de los diferentes reguladores implicados, refernce, photo gallery?). Estas licencias son muy útiles para reconstruir su carácter y estatus en esos momentos. Hasta ocho tomos fueron publicados entre 1726 y 1739.

Gran parte de sus escritos se han perdido con el tiempo, en primera instancia debido a las medidas desamortizadoras, y lo quedaban tras el regreso de los benedictinos en 1880 ardió en su mayoría en un incendio en 1951 sobre el monasterio.

Se me hace curiosa la rutina diaria de un monje benedictino como el, a la que fue aparentemente leal toda su vida. Sabemos de ella a través escritos de sus muchos amigos, y en particular una pequeña autobiografía que escribió instado por un barón alemán y sus honras fúnebres. Curiosamente, una de las mejores recolecciones de su vida y obra fue realizada por Ramón Otero Pedrayo (1972), y está llena de curiosidades que dejó para una footnote[^7]

Es razonable declarar que fue escritor español más reconocido dentro y fuera de España. Probablemente mi descripción aquí haya sido escueta para dar a entender la magnitud de la influencia y difusión de su obra y pensamiento. Una estimación cifra la difusión de su obra en unos 440 000 volúmenes impresos, un número inédito para el momento.[^6]

Es relevante detallar que escribía en castellano, cuando el formato tradicional para discusiones de este calibre era típicamente en latín. Esto le permitía dirigir su obra a toda la sociedad española, pero como consecuencia indirecta dividió a sus lectores en dos grupos bastante diferenciados, aquellos de acuerdo con sus ideas, entre los que se contaban miembros de la realeza y de gran importancia políticas; y sus detractores, a los cuales también responde a lo largo de su obra.

### Polémica

Pocas semanas tras la publicación, ya circulaban "folletos" (explicar formatín) de distintos autores respondiendo a sus escritos, a los que varios de sus amigos salieron en defensa. Ya hay alguna acusación, pero no es hasta 1728 en la _Tertulia histórica y apologética_, un canónigo que asegura haber estudiado en París dice que el TCU es una traducción de varias obras francesas, sin muchos más detalles.

Me resulta especialmente elegante la forma en la que se acusaban entre sí, en el caso de _Estrado crítico_  (1727), es una conversación entre cuatro señoras, en _Tertulia histórica y apologética_, uno de sus personajes se queja de que, después de su esposa leer a Feijoo, el matrimonio fue arruinado y la mujer ha empezado a estudiar latín y francés y a hablar de Descartes.

A este último responde Feijoo en el prólogo del tercer tomo (1729), donde dice tener cien tomos de Trévoux, pero distinguiendo entre aprovechar un libro y copiarlo. Aquí es donde también plantea la apuesta pública que este post estudia.

Ese mismo año, Salvador José Mañer hizo lo que yo presento aquí con pipelines de agentes a mano, y en _Anti-Teatro_ (1729) señaló lugares concretos. Feijoo le respondió, y Mañer volvió en 1731. La pelea siguió durante décadas, con nuevos adversarios y nuevos defensores. En 1750, una insólita Real Orden de Fernando VI prohibió publicar el tercer tomo de uno de los críticos de Feijoo, así como posteriores impugnaciones. Aquí dejo mi intento de reconstrucción de las acusaciones hechas hasta ese momento:

<details markdown="1">
<summary>Cronología completa de la polémica (1726–1750)</summary>

| Date                                | Author (real)                                                                                                     | Side             | Work                                                                                                                                       | What it charged / did                                                                                                                                                                                                                                                                                                                                                                             | Digitized                                                           |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Sep 1726                            | Feijoo                                                                                                            | —                | TCU I (Mojados; censors Antonio Sarmiento, Campo-Verde SJ, Losada OFM; letter of Salazar y Castro)                                         | 16 discourses; 4 on astrology, 2 on medicine, "Defensa de las mujeres"                                                                                                                                                                                                                                                                                                                            | filosofia.org                                                       |
| 1726                                | Martín Martínez                                                                                                   | pro              | *Carta defensiva*                                                                                                                          | defends medical scepticism                                                                                                                                                                                                                                                                                                                                                                        | filosofia.org bjft2p7; BDH 0000093762                               |
| Oct 1726                            | Pedro Aquenza (protomédico)                                                                                       | anti             | *Breves apuntamientos en defensa de la medicina*                                                                                           | medicine is God-made; Feijoo insults the faculty                                                                                                                                                                                                                                                                                                                                                  | —                                                                   |
| 23–29 Oct 1726                      | J. F. de Isla SJ (attr.)                                                                                          | pro              | *Blanda, suave y melosa respuesta a los ferinos y furiosos apuntamientos*                                                                  | burlesque                                                                                                                                                                                                                                                                                                                                                                                         | —                                                                   |
| 29 Oct 1726                         | Suárez de Ribera                                                                                                  | mixed            | *Templador médico de la furia vulgar*                                                                                                      | defends the bezoar against TCU                                                                                                                                                                                                                                                                                                                                                                    | —                                                                   |
| late 1726                           | Torres Villarroel                                                                                                 | anti             | *Posdatas de Torres a Martínez*; *Montante christiano*                                                                                     | astrology                                                                                                                                                                                                                                                                                                                                                                                         | filosofia.org imp/1726dtpo                                          |
| 1726                                | Manco de Olivares / Irún y Adecha / "Marica la Tonta" (1727)                                                      | anti / pro / pro | the women's pamphlet war                                                                                                                   | TCU I.16                                                                                                                                                                                                                                                                                                                                                                                          | —                                                                   |
| Feb 1727                            | Juan Antonio Santareli                                                                                            | anti             | ***Estrado crítico en defensa de las mugeres***                                                                                            | women's dialogue for the traditional ideal. Delpy says it charged the Bellegarde material as known only via Trévoux Apr 1702. **Read 2026-09-25 (C016): p. 20 just repeats Feijoo's own 1726 acknowledgement; Moréri jab p. 15**                                                                                                                                                                  | BDH 0000083299                                                      |
| 1727                                | Martín Martínez                                                                                                   | pro              | *Juicio final de la astrología*                                                                                                            |                                                                                                                                                                                                                                                                                                                                                                                                   | IA A1090721                                                         |
| 1727                                | Torres; Salinero                                                                                                  | anti             | *Entierro del Juicio final*; *Pragmática del tiempo*                                                                                       |                                                                                                                                                                                                                                                                                                                                                                                                   | filosofia.org imp/1727dten                                          |
| 1727                                | "Ernesto Frayer" = Martín de Mendoza de Pina                                                                      | anti             | *Discurso philológico crítico sobre el corolario del Discurso XV*                                                                          | TCU I.15, Galician = Portuguese                                                                                                                                                                                                                                                                                                                                                                   | filosofia.org aut/005/1727fra                                       |
| 1728 (by late Feb)                  | Medrano OP                                                                                                        | anti             | *Vida de Santa Inés* (aside on Savonarola)                                                                                                 | **origin of the Naudé "al pie de la letra" charge** (the Tertulia vindicates this digression, per its pp. 7, 23, 51–52)                                                                                                                                                                                                                                                                           | GB 5Sjk50f-evkC (blocked; wishlist C8)                              |
| 20 Apr 1728 (text after 1 Mar 1728) | "Jaime Ardanaz y Centellas" (pseud.?; persona a Dominican tertiary, Aragonese, in Madrid)                         | anti             | ***Tertulia histórica y apologética***                                                                                                     | **Read 2026-09-25 (notes/08 addendum).** Unlicensed (no aprobación/licencia/printer). Naudé charge = Medrano's (pp. 17–23, 51–52). JdS/Trévoux = one generic sentence by Don Miguel, p. 9 ("traduccion de varias obras Francesas … vamos à la Bibliotheca Real … Journal de Scavans, y … Memorias de Treboux"), **no locus**; attacks Defensa de las mujeres (pp. 9–11, 36); closing sonnet p. 57 | BDH 0000077283 (read; data/accusers/tertulia1728/); GB qub2aCY8BzwC |
| May 1728                            | Brizeño y Zúñiga (censura by Torres)                                                                              | anti             | *Juicio particular del Juicio Universal*                                                                                                   | TCU II.9                                                                                                                                                                                                                                                                                                                                                                                          | —                                                                   |
| 1728                                | Lessaca                                                                                                           | anti             | *Apología escolástica* (Alcalá vs. Martínez)                                                                                               |                                                                                                                                                                                                                                                                                                                                                                                                   | GB fwPtNEfJKiUC                                                     |
| Nov 1728                            | Mémoires de Trévoux p. 2140                                                                                       | —                | "DE MADRID" notice                                                                                                                         | "la guerre s'échauffe"                                                                                                                                                                                                                                                                                                                                                                            | —                                                                   |
| 1729                                | Feijoo                                                                                                            | —                | **TCU III, *Prólogo apologético*** (dedicated to Samos)                                                                                    | **the four-line dare**                                                                                                                                                                                                                                                                                                                                                                            | filosofia.org                                                       |
| 7 Jun 1729                          | Mañer                                                                                                             | anti             | ***Anti-Theatro crítico*** I (26 discourses, "setenta descuidos"; dedicated to the Prince of Orange; approver a notario de la Inquisición) | first specific Trévoux charges (C001 Parent 1716, etc.)                                                                                                                                                                                                                                                                                                                                           | IA bub_gb_B3PVs3sLEroC; filosofia.org                               |
| 1729                                | Tejeda (alchemist)                                                                                                | anti             | *Apelación sobre la piedra filosofal*                                                                                                      | TCU III.8                                                                                                                                                                                                                                                                                                                                                                                         | —                                                                   |
| 10 Jan 1730                         | Feijoo                                                                                                            | —                | ***Ilustración apologética*** ("más de 400 descuidos … de los setenta se rebaxan los sesenta y nueve y medio")                             | answers Mañer                                                                                                                                                                                                                                                                                                                                                                                     | digibuo 10651/13197                                                 |
| Sep 1730                            | "letter from Zaragoza" (= Tejeda) in Trévoux pp. 1693–96                                                          | anti             |                                                                                                                                            | "a tiré de vos Mémoires ce qu'il a employé de meilleur"                                                                                                                                                                                                                                                                                                                                           | —                                                                   |
| 1731                                | Montoya y Uzueta vs. Sarmiento ("Sancho Revulgo")                                                                 | anti / pro       | *Crítico y cortés castigo de pluma*; reply                                                                                                 |                                                                                                                                                                                                                                                                                                                                                                                                   | —                                                                   |
| Jun 1731                            | J.-B. Boyer, *Mercure de France*                                                                                  | pro              | Lettre sur un ouvrage du R. P. Feijoo                                                                                                      | "plus generalement estimé"                                                                                                                                                                                                                                                                                                                                                                        | —                                                                   |
| Aug 1731                            | Mañer                                                                                                             | anti             | ***Anti-Theatro sobre el tomo tercero + Réplica satisfactoria*** ("998 errores")                                                           | **answers the dare** with C001; C008 charge                                                                                                                                                                                                                                                                                                                                                       | RUA hdl 10045/140067                                                |
| Dec 1732                            | Sarmiento                                                                                                         | pro              | ***Demostración crítico-apologética*** (2 vols)                                                                                            | common-source defence; ">100 papelones"; TCU IV print run 2,250                                                                                                                                                                                                                                                                                                                                   | IA demonstracioncr00/01sarmgoog; filosofia.org                      |
| 1733                                | Feijoo                                                                                                            | —                | TCU V disc. 17                                                                                                                             | refutes the Zaragoza letter; **second dare** (124 owned; 128 published)                                                                                                                                                                                                                                                                                                                                          | filosofia.org bjft517                                               |
| 1733                                | Jacinto Segura                                                                                                    | anti             | *Norte crítico*                                                                                                                            | the Savonarola prologue                                                                                                                                                                                                                                                                                                                                                                           | —                                                                   |
| 1734                                | Mañer                                                                                                             | anti             | ***Crisol crítico*** (2 parts; approbation by Medrano: "tiranía de la razón")                                                              | against Sarmiento                                                                                                                                                                                                                                                                                                                                                                                 | rhinoresourcecenter PDF; GB OMqJqnhWy6gC                            |
| Oct 1734                            | "Álvaro Menards" = Mañer                                                                                          | anti             | *El famoso hombre marino del P. M. Feijoo*                                                                                                 | TCU VI                                                                                                                                                                                                                                                                                                                                                                                            | —                                                                   |
| 1735–37                             | Ignacio de Armesto y Ossorio                                                                                      | anti             | ***Theatro anti-crítico universal*** (3 books; covers TCU I–II)                                                                            | self-appointed judge between Feijoo-Sarmiento and Mañer; Aristotelian                                                                                                                                                                                                                                                                                                                             | RUA hdl 10045/141582; HathiTrust 009312437                          |
| 1741–46                             | Rubiños (exorcisms); Zárate (*Bayles mal defendidos*); Pasqual and Fornés (Lullists); Arango (Flores de San Luis) | anti             |                                                                                                                                            | the later branches                                                                                                                                                                                                                                                                                                                                                                                | —                                                                   |
| 1748–49                             | Soto y Marne OFM                                                                                                  | anti             | ***Reflexiones crítico-apologéticas*** I–II (Salamanca; approver Izquierdo OP)                                                             | discourse-by-discourse **plagiarism list** (t. I nn. 36–41), C001, C002                                                                                                                                                                                                                                                                                                                           | IA b30526863_0001/0002                                              |
| 7 Nov 1748                          | Fernando VI                                                                                                       | —                | Feijoo made Consejero Real                                                                                                                 |                                                                                                                                                                                                                                                                                                                                                                                                   | —                                                                   |
| 23 Sep 1749                         | Feijoo                                                                                                            | —                | ***Justa repulsa*** (approbation: "Es fábula ridícula cuanto del plagio se vocea")                                                         |                                                                                                                                                                                                                                                                                                                                                                                                   | filosofia.org bjfvjr5                                               |
| 23 Jun 1750                         | Real Orden (Carvajal)                                                                                             | —                | forbids Soto Marne's t. III: "no debe haber quien se atreva a impugnarlos"                                                                  |                                                                                                                                                                                                                                                                                                                                                                                                   | BNE ms. 10.579 ff. 31v–32r                                          |
| 1750                                | Soto Marne; Ramírez                                                                                               | anti / pro       | *Memorial* to the King; *Marianitas del Molar*; *La derrota de los alanos*                                                                 |                                                                                                                                                                                                                                                                                                                                                                                                   | —                                                                   |

</details>

revisar (Millares Carlo, 1923; Caso González-Cerra, 1981).


Algunos de mis títulos y pasajes favoritos incluyen:
- *Crítico y cortés castigo de pluma*
- el otro prólogo de feijoo
- _Justa repulsa de inicuas acusaciones_ (1749)
- _landa, suave y melosa respuesta a los ferinos y furiosos apuntamientos_
- _Contradefensa crítica a favor de los hombres_
- _Cantáridas amigables para remedio de sueños desvariados_

Ojalá más posts se titularan de esta forma!

---

## Definición del reto

Hay infinidad de sitios con referencias, citas y copias de feijoo del francés al español, [Rodrigo Olay (2019)](https://revistas.uca.es/index.php/cir/article/view/5224) describe cómo Feijoo, en sus ensayos, «traduce del francés las diferentes anécdotas de la _Menagiana_», adaptándolas a estilo (sátira más suave).

Esto no entra dentro del scope de este proyecto por ahora, me centraré en lo que el especifica como en su apuesta con alguna libertad:

Cuatro líneas ocupan unas 35–40 palabras en las primeras ediciones. Inicialmente comparé los tomos I, II y III con las entregas anteriores de las *Memorias de Trévoux* y con el único tomo del *Journal des Sçavans* que Feijoo decía tener. Después amplié la búsqueda a los tomos IV y V y a Trévoux hasta 1732 para comprobar el reto de 1733, que ya no mencionaba el *Journal* ni fijaba cuatro líneas. Para comparar los resultados mantuve ese umbral como regla propia.

Hay una infinidad de coincidencias temáticas, pero para contar un pasaje tiene que ser una traducción clara o una paráfrasis con alguna señal concreta de dependencia: mismo error, misma secuencia poco habitual de datos...

## Cómo

### Pipeline

Un precedente cercano de este proyecto es el [trabajo de Hinderks, Ledins, Ginter & Tolonen, "Translation mining"](https://doi.org/10.1080/01615440.2026.2675558) (_Historical Methods_, June 2026), que encontré después de elegir el método. En resumen, puedes encontrar similitudes entre textos de distintos idiomas calculando embeddings sobre todo el corpus, y revisar aquellos que estén muy cerca. Esto funciona porque los embeddings representan el significado de una frase o fragmento, de una forma que permite comparar distintos idiomas. Others: Roe, Olsen & Morrissey (ARTFL, 2021/22) did Chambers → _Encyclopédie_ with MT + sequence alignment. Bamman & Crane (2009) did multilingual reuse (Vergil → Milton).

Esto tiene muchísimos detalles en que exploro por partes:

#### Corpus

Para el reto de 1729 comparé TCU I–III con Trévoux y el tomo del *Journal des Sçavans* que Feijoo decía tener. Después amplié la búsqueda para comprobar el reto de 1733.

<details markdown="1">
<summary>Fuentes originales, OCR y uso de cada documento</summary>

| Documento | Original escaneado | OCR / texto usado | Qué hicimos |
|---|---|---|---|
| *Teatro crítico universal* I (1726), II (1728), III (1729) | BNE: [I](https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44), [II](https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a), [III](https://bnedigital.bne.es/bd/es/viewer?id=911fba8d-7ad3-4d7e-9332-a05cb636e5a9) | OCR e imágenes de la BNE | Comprobamos cada candidato en la primera edición; 664 imágenes de dobles páginas. |
| TCU I–III, reimpresión de 1777–1779 | [Texto de filosofia.org](https://www.filosofia.org/bjf/bjft000.htm); edición indicada en cada tomo | Transcripción descargada → 2.594 párrafos | Texto de búsqueda: 358.547 palabras principales. Marcamos 25.930 palabras de adiciones posteriores; las reescrituras sin marca exigieron cotejo en la primera edición. |
| *Mémoires de Trévoux* 1701–1729 | [Getty / Internet Archive, ejemplo](https://archive.org/details/memoirespourlhis1701unse); inventario de los 117 tomos | ABBYY de IA y nuevo OCR kraken + PP-OCRv6 | Búsqueda inicial y repetición sobre 66.964 hojas reconocidas de nuevo. |
| Segundo ejemplar de Trévoux | [BSB/MDZ, ejemplo](https://www.digitale-sammlungen.de/en/view/bsb10539793); inventario | hOCR descargado de 11 tomos; [hOCR por página en MDZ, ejemplo](https://api.digitale-sammlungen.de/ocr/bsb10539793/1) | Cotejo de páginas; 113 tomos, con un hueco en 1727. |
| Reimpresión de Ámsterdam de Trévoux | [BSB/MDZ, primer tomo](https://www.digitale-sammlungen.de/en/view/bsb11040060) | [hOCR por página en MDZ, ejemplo](https://api.digitale-sammlungen.de/ocr/bsb11040060/1) | Testigo para pasajes de 1701–1704; nueve tomos, con artículos reordenados. |
| *Journal des Sçavans* de 1682, t. X de Ámsterdam (1683) | [BSB/MDZ](https://www.digitale-sammlungen.de/en/view/bsb10539522) | hOCR de hojas 1–60, Tesseract de 61–482 y texto ensamblado | Buscamos en las 482 hojas del único tomo que Feijoo decía tener. |

| Fuentes de contraste, fuera del reto | Original escaneado | OCR / texto usado | Qué hicimos |
|---|---|---|---|
| *Histoire de l'Académie royale des sciences* (1699–1728) | Inventario de ejemplares | 30 volúmenes | Búsqueda separada y control de fuentes comunes. Hay reimpresiones posteriores a Feijoo: cada coincidencia exige cotejo de fecha. |
| Bayle, *Dictionnaire historique et critique* (1702) | IA: [I](https://archive.org/details/bub_gb_9zPfImQPeQkC), [II](https://archive.org/details/b30456198_0001), [III](https://archive.org/details/bub_gb_Gqo-AAAAcAAJ) | Tres tomos | Búsqueda separada y control de atribuciones. |
| *Menagiana*; Fontenelle; Moréri | Inventario de los 13 tomos | Menagiana, Fontenelle, Moréri | Tres búsquedas separadas en TCU I–III. |
| *Dictionnaire de Trévoux* (1721); Montfaucon, *L'Antiquité expliquée* (1719) | Ejemplares y referencias | Diccionario; Montfaucon, diez tomos | Consultas puntuales; sin búsqueda completa. |
| Libros reseñados por Trévoux | Catálogo por caso e imágenes de cotejo | Textos disponibles por caso | Comprobamos si Feijoo pudo tomar el pasaje del libro reseñado. |
| Acusaciones y respuestas de la época | *Estrado*, *Tertulia*, Mañer 1731, catálogo completo | *Estrado*, *Tertulia*, Mañer 1729, Mañer 1731, Sarmiento, Soto Marne | Contrastamos las acusaciones anteriores con los casos encontrados. |

| Ampliación para el reto de 1733 | Original escaneado | OCR / texto usado | Qué hicimos |
|---|---|---|---|
| TCU IV (1730) y V (1733), primeras ediciones | [USC Minerva, PDF de varios tomos](https://hdl.handle.net/10347/7540); imágenes locales IV–V | Transcripción de trabajo, basada en [filosofia.org](https://www.filosofia.org/bjf/bjft000.htm) | Buscamos 2.062 párrafos y cotejamos los candidatos con los originales. Queda por cotejar un caso rechazado, D2-C004. |
| Trévoux 1730–1732 | [Getty / IA, ejemplo de 1730](https://archive.org/details/memoirespourlhis1730unse); inventario | ABBYY de IA y kraken + PP-OCRv6 | Añadimos doce tomos, unas 7.034 hojas, y buscamos TCU IV–V contra Trévoux 1701–1732. |

</details>

##### Benchmark OCR

Para este caso de uso, era crucial tener en cuenta las particularidades de las imprentas de la época, que ya mencioné anteriormente.



#### Matcheo

Aplicar esto de forma naive da muchísimos falsos positivos. Feijoo y las revistas francesas tenían muchísimo overlap temático,  LaBSE + margin scoring [explicar] (entrenado para minar pares de traducción) fue lo que mejor funcionó empíricamente en este caso. Los candidatos T/P pasaron por un verificador a ciegas; los más prometedores tuvieron además una revisión adversarial, y solo un pequeño porcentaje sobrevivía al escrutinio.

Las citas latinas fueron poco útiles para encontrar casos nuevos; el cruce de nombres propios y números sí ayudó en la tercera versión del detector.

Hice uso de mi portátil (AMD Strix Halo, Radeon 8050S, ROCm), y la mayoría del procesamiento en [mi servidor](https://blog.m19182.dev/writings/Building-my-Homelab/), que tiene una RTX 3090 compartida con otro servicio. El OCR corrió en la GPU y en la CPU, con algunas pausas, durante unos tres días. Inicialmente calculaba que iba a necesitar más de una semana pero varias optimizaciones permitieron bajar el tiempo.

previous art

### Trabajar con agentes

Al contrario de muchos de mis amigos, aún mantengo cierta reticencia a lanzar swarms de agentes contra una tarea con poca supervisión. La única razón es que, para mí, no funcionan igual de bien que llevándolos un poco de la mano.[^4] La tendencia es clara a que cada vez necesitan menor supervisión y son capaces de acometer tareas de mayor longitud, no me extrañaría que en unos meses este mismo blog lo pudiese replicar un prompt relativamente sencillo.

Una de las cosas que encuentro es que se centran y malgastan ingentes cantidades de tiempo y tokens en detalles, que a la primera revisión humana dejan de tener sentido. Pero sin duda el mayor problema fue lidiar con la pérdida de contexto a lo largo del tiempo. La forma en que acabé funcionando era con una agente principal que orquestaba múltiples subagentes (comúnmente unos 10) que eran los que hacían el trabajo real (revisar casos prometedores, monitorizar las runs de OCR, revisar literatura...). Usé tanto Opus5.5 como GPT-6Astra (ambos medium effort), con anecdóticamente mejores resultados con Opus.

El otro gran problema era la documentación, ya que la mayoría de los subagentes tenían una tarea definida y luego desaparecían, e intentaba evitar rellenar el contexto del los orquestadores con cosas no relevantes, documentaba casi todos los hechos relevantes en mds. Esto tuvo como consecuencia que tenía cientos de documentos, escritos en una prosa extremadamente incómoda de digerir, y gran parte de ellos con preguntas ya resueltas, hipótesis que ya probadas, datos que ya descubrimos como incorrectos...

La solución fue una mezcla de agentes que se encargaban de revisar rutinariamente la documentación, y mucha más revisión manual de la que está de moda admitir. Me hacen falta manos para contar la de veces que un subagente saltaba con un "descubrimiento rompedor" que se hundía al más mínimo escrutinio. Los LLMs tienden a sobreestimar su trabajo y a infravalorar sus capacidades al mismo tiempo.

Otra cosa a tener en cuenta en un set-up como este, es que va a sobreindexar sobre tus palabras de sobremanera, y es importante tenerlo en cuenta cada vez que hablas con el orquestador. Más de una ocasión comenzó a steerear a múltiples subagentes con instrucciones dirigidas a una tarea concreta. Al mismo tiempo, el tono que utilizas para hablar con el tiene un efecto enorme, el ejemplo más claro son los chats de Terence Tao, donde, sin hacer prompts realmente complejos, y con acceso a los mismos modelos que yo, consigue unos resultados increíbles.

Como casi todos los consejos en este campo, es complicado de probar, pero a mi sensación es que ayudó bastante, antes de proponer una nueva dirección de investigación o revisar una parte del trabajo, discutir primero la situación con un agente sin el mismo contexto. Lo mismo para todas las revisiones, a ciegas y con modelos diferentes.

---

desarrollo en el tiempo

La mayor parte de la dificultad vino en obtener los documentos que quiero comparar, con un buen OCR. Me puse en contacto con la biblioteca de Múnich para pedir acceso en bloque a sus ficheros OCR de Trévoux. Acabé rehaciendo el OCR de los escaneos de Internet Archive procedentes del Getty, cuyo texto existente era mucho peor. Varios otros documentos no tenían OCR, e incluso fui a buscar algunas primeras ediciones de Feijoo a los depósitos de varias bibliotecas de Galicia. No fue especialmente útil pero era una buena excusa para un road trip, y los bibliotecarios que me atendieron parecían realmente interesados!

También entré en contacto con Xaime, artículo ## «Murió en el asalto»... gran dureza!!!

El congreso del tricentenario (Oviedo, 24–25 de junio de 2026, unas 45 ponencias)
- articulo cutre repetido al respecto: [https://www.vozpopuli.com/historia/padre-feijoo-300-anos-del-primer-fact-checker-de-espana.html](https://www.vozpopuli.com/historia/padre-feijoo-300-anos-del-primer-fact-checker-de-espana.html)



---

## Resultados

Para el reto de 1729 encontré **nueve pasajes que superan el umbral** y **dos más en el límite**. En ocho casos adicionales hay dependencia posible o probable, pero no suficientes palabras exclusivas de Trévoux para contarlos igual. Feijoo tradujo otros cuatro pasajes citando la revista o el *Journal*; los muestro, pero no los cuento como aciertos de la apuesta. La búsqueda del reto de 1733 añadió **un caso estricto** en el tomo IV. En conjunto, TCU I–V da **10 + 2** con las mismas reglas; Feijoo no repitió en 1733 el umbral de «cuatro líneas».

| Búsqueda | Candidatos juzgados | Estrictos (A) | Dependientes o cortos (B/C) | Traducciones citadas (D) |
|---|---:|---:|---:|---:|
| Reto de 1729: TCU I–III frente a Trévoux y el tomo de 1682 del *Journal* | 633 veredictos | 9 + 2 en el límite | 4 B + 4 C | 4 |
| Ampliación de 1733: TCU IV–V frente a Trévoux hasta 1732 | 237 candidatos | 1 | 1 B + 2 C | 8 |

<details markdown="1">
<summary>Los doce casos estrictos: pasajes, fuentes y prueba decisiva</summary>

| Caso | Feijoo | Trévoux | Palabras estrictas | Por qué cuenta; qué se sabía |
|---|---|---|---:|---|
| C001, manchas solares | II.14, 1728 | Parent, feb. 1716 | ≈128 | Comparte un error sobre el libro de las *Geórgicas* y «Tum caput». Mañer ya señaló la reseña en 1729. |
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
| D2-C007, Behaim | IV.8, 1730 | Stuvenius, mayo 1716 | ≈98, mínimo 39 | Sigue el orden y detalles de la reseña que no están en el libro latino. Es el caso nuevo del segundo reto; quedan otras revistas por cotejar. |

</details>

### Los documentos frente a frente

Abre un caso para comparar los recortes de las primeras ediciones. Pulsa una imagen para leerla a tamaño completo; cuando un pasaje ocupa varias páginas, los recortes aparecen unidos en orden.

<details class="feijoo-case" open>
<summary>C001 · manchas solares</summary>
<div class="feijoo-compare">
<figure>
<a class="scan" href="/data/feijoo-results/C001_feijoo.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Feijoo para C001 a tamaño completo"><img src="/data/feijoo-results/C001_feijoo.jpg" alt="Recorte de Feijoo: manchas solares (C001)" loading="lazy" decoding="async"></a>
<figcaption><strong>Feijoo</strong> · II (1728), p. 250, n. 23 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<a class="scan" href="/data/feijoo-results/C001_trevoux.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Trévoux para C001 a tamaño completo"><img src="/data/feijoo-results/C001_trevoux.jpg" alt="Recorte de Trévoux: manchas solares (C001)" loading="lazy" decoding="async"></a>
<figcaption><strong>Trévoux</strong> · febrero 1716, art. XXIV, p. 331 · <a href="https://www.digitale-sammlungen.de/view/bsb10539854?page=345" target="_blank" rel="noopener noreferrer">BSB</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C002 · hierro en plantas</summary>
<div class="feijoo-compare">
<figure>
<a class="scan" href="/data/feijoo-results/C002_feijoo.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Feijoo para C002 a tamaño completo"><img src="/data/feijoo-results/C002_feijoo.jpg" alt="Recorte de Feijoo: hierro en plantas (C002)" loading="lazy" decoding="async"></a>
<figcaption><strong>Feijoo</strong> · II (1728), p. 258, n. 39 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<a class="scan" href="/data/feijoo-results/C002_trevoux.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Trévoux para C002 a tamaño completo"><img src="/data/feijoo-results/C002_trevoux.jpg" alt="Recorte de Trévoux: hierro en plantas (C002)" loading="lazy" decoding="async"></a>
<figcaption><strong>Trévoux</strong> · marzo 1707, art. XXXIV, p. 479 · <a href="https://www.digitale-sammlungen.de/view/bsb10539818?page=507" target="_blank" rel="noopener noreferrer">BSB</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C003 · abadesa de Fontevrault</summary>
<div class="feijoo-compare">
<figure>
<a class="scan" href="/data/feijoo-results/C003_feijoo.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Feijoo para C003 a tamaño completo"><img src="/data/feijoo-results/C003_feijoo.jpg" alt="Recorte de Feijoo: abadesa de Fontevrault (C003)" loading="lazy" decoding="async"></a>
<figcaption><strong>Feijoo</strong> · I (1726), p. 361, n. 122 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<a class="scan" href="/data/feijoo-results/C003_trevoux.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Trévoux para C003 a tamaño completo"><img src="/data/feijoo-results/C003_trevoux.jpg" alt="Recorte de Trévoux: abadesa de Fontevrault (C003)" loading="lazy" decoding="async"></a>
<figcaption><strong>Trévoux</strong> · diciembre 1704, art. CLXXXIX, p. 2119 · <a href="https://www.digitale-sammlungen.de/view/bsb10539809?page=507" target="_blank" rel="noopener noreferrer">BSB</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C004 · Filipinas</summary>
<div class="feijoo-compare">
<figure>
<a class="scan" href="/data/feijoo-results/C004_feijoo.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Feijoo para C004 a tamaño completo"><img src="/data/feijoo-results/C004_feijoo.jpg" alt="Recorte de Feijoo: Filipinas (C004)" loading="lazy" decoding="async"></a>
<figcaption><strong>Feijoo</strong> · II (1728), p. 53, nn. 73–74 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<a class="scan" href="/data/feijoo-results/C004_trevoux.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Trévoux para C004 a tamaño completo"><img src="/data/feijoo-results/C004_trevoux.jpg" alt="Recorte de Trévoux: Filipinas (C004)" loading="lazy" decoding="async"></a>
<figcaption><strong>Trévoux</strong> · julio 1715, art. XCVII, pp. 1163–1164 · <a href="https://www.digitale-sammlungen.de/view/bsb10539852?page=71" target="_blank" rel="noopener noreferrer">BSB 1</a>; <a href="https://www.digitale-sammlungen.de/view/bsb10539852?page=72" target="_blank" rel="noopener noreferrer">BSB 2</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C005 · sectas médicas</summary>
<div class="feijoo-compare">
<figure>
<a class="scan" href="/data/feijoo-results/C005_feijoo.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Feijoo para C005 a tamaño completo"><img src="/data/feijoo-results/C005_feijoo.jpg" alt="Recorte de Feijoo: sectas médicas (C005)" loading="lazy" decoding="async"></a>
<figcaption><strong>Feijoo</strong> · TCU I (1726), p. 112 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<a class="scan" href="/data/feijoo-results/C005_trevoux.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Trévoux para C005 a tamaño completo"><img src="/data/feijoo-results/C005_trevoux.jpg" alt="Recorte de Trévoux: sectas médicas (C005)" loading="lazy" decoding="async"></a>
<figcaption><strong>Trévoux</strong> · nov. 1710, p. 1954 · <a href="https://archive.org/details/memoirespourlhi1710unse_2/page/n309" target="_blank" rel="noopener noreferrer">Internet Archive</a></figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C009 · modos musicales</summary>
<div class="feijoo-compare">
<figure>
<a class="scan" href="/data/feijoo-results/C009_feijoo.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Feijoo para C009 a tamaño completo"><img src="/data/feijoo-results/C009_feijoo.jpg" alt="Recorte de Feijoo: modos musicales (C009)" loading="lazy" decoding="async"></a>
<figcaption><strong>Feijoo</strong> · TCU I (1726), p. 274 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<a class="scan" href="/data/feijoo-results/C009_trevoux.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Trévoux para C009 a tamaño completo"><img src="/data/feijoo-results/C009_trevoux.jpg" alt="Recorte de Trévoux: modos musicales (C009)" loading="lazy" decoding="async"></a>
<figcaption><strong>Trévoux</strong> · abr. 1716, p. 597; abr. 1716, p. 598 · <a href="https://archive.org/details/memoirespourlhi1716unse_0/page/n54" target="_blank" rel="noopener noreferrer">Internet Archive 1</a>; <a href="https://archive.org/details/memoirespourlhi1716unse_0/page/n55" target="_blank" rel="noopener noreferrer">Internet Archive 2</a></figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C010 · longevidad</summary>
<div class="feijoo-compare">
<figure>
<a class="scan" href="/data/feijoo-results/C010_feijoo.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Feijoo para C010 a tamaño completo"><img src="/data/feijoo-results/C010_feijoo.jpg" alt="Recorte de Feijoo: longevidad (C010)" loading="lazy" decoding="async"></a>
<figcaption><strong>Feijoo</strong> · TCU I (1726), p. 234 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<a class="scan" href="/data/feijoo-results/C010_trevoux.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Trévoux para C010 a tamaño completo"><img src="/data/feijoo-results/C010_trevoux.jpg" alt="Recorte de Trévoux: longevidad (C010)" loading="lazy" decoding="async"></a>
<figcaption><strong>Trévoux</strong> · jul. 1702 (portada con errata «1701»), p. 78; sept.–oct. 1701, p. 299 · <a href="https://archive.org/details/memoirespourlhi1702unse_2/page/n81" target="_blank" rel="noopener noreferrer">Internet Archive 1</a>; <a href="https://archive.org/details/memoirespourlhi1701unse_1/page/n302" target="_blank" rel="noopener noreferrer">Internet Archive 2</a></figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C017 · anillos planetarios</summary>
<div class="feijoo-compare">
<figure>
<a class="scan" href="/data/feijoo-results/C017_feijoo.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Feijoo para C017 a tamaño completo"><img src="/data/feijoo-results/C017_feijoo.jpg" alt="Recorte de Feijoo: anillos planetarios (C017)" loading="lazy" decoding="async"></a>
<figcaption><strong>Feijoo</strong> · TCU III (1729), p. 25 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=911fba8d-7ad3-4d7e-9332-a05cb636e5a9" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<a class="scan" href="/data/feijoo-results/C017_trevoux.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Trévoux para C017 a tamaño completo"><img src="/data/feijoo-results/C017_trevoux.jpg" alt="Recorte de Trévoux: anillos planetarios (C017)" loading="lazy" decoding="async"></a>
<figcaption><strong>Trévoux</strong> · feb. 1718, p. 334; feb. 1718, p. 336 · <a href="https://archive.org/details/memoirespourlhis1718unse/page/n342" target="_blank" rel="noopener noreferrer">Internet Archive 1</a>; <a href="https://archive.org/details/memoirespourlhis1718unse/page/n344" target="_blank" rel="noopener noreferrer">Internet Archive 2</a></figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C020 · mano de gigante</summary>
<div class="feijoo-compare">
<figure>
<a class="scan" href="/data/feijoo-results/C020_feijoo.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Feijoo para C020 a tamaño completo"><img src="/data/feijoo-results/C020_feijoo.jpg" alt="Recorte de Feijoo: mano de gigante (C020)" loading="lazy" decoding="async"></a>
<figcaption><strong>Feijoo</strong> · I.12, §VIII, n. 23, p. 243 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<a class="scan" href="/data/feijoo-results/C020_trevoux.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Trévoux para C020 a tamaño completo"><img src="/data/feijoo-results/C020_trevoux.jpg" alt="Recorte de Trévoux: mano de gigante (C020)" loading="lazy" decoding="async"></a>
<figcaption><strong>Trévoux</strong> · septiembre–octubre 1701, p. 291 · <a href="https://www.digitale-sammlungen.de/view/bsb10539794?page=543" target="_blank" rel="noopener noreferrer">BSB</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C012 · vidas de santos (límite)</summary>
<div class="feijoo-compare">
<figure>
<a class="scan" href="/data/feijoo-results/C012_feijoo.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Feijoo para C012 a tamaño completo"><img src="/data/feijoo-results/C012_feijoo.jpg" alt="Recorte de Feijoo: vidas de santos (límite) (C012)" loading="lazy" decoding="async"></a>
<figcaption><strong>Feijoo</strong> · III.6, §I, n. 5, p. 99 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=911fba8d-7ad3-4d7e-9332-a05cb636e5a9" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<a class="scan" href="/data/feijoo-results/C012_trevoux.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Trévoux para C012 a tamaño completo"><img src="/data/feijoo-results/C012_trevoux.jpg" alt="Recorte de Trévoux: vidas de santos (límite) (C012)" loading="lazy" decoding="async"></a>
<figcaption><strong>Trévoux</strong> · mayo–junio 1701, p. 62 · <a href="https://www.digitale-sammlungen.de/view/bsb10539793?page=524" target="_blank" rel="noopener noreferrer">BSB</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C038 · modas (límite)</summary>
<div class="feijoo-compare">
<figure>
<a class="scan" href="/data/feijoo-results/C038_feijoo.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Feijoo para C038 a tamaño completo"><img src="/data/feijoo-results/C038_feijoo.jpg" alt="Recorte de Feijoo: modas (límite) (C038)" loading="lazy" decoding="async"></a>
<figcaption><strong>Feijoo</strong> · II.6, §II, n. 6, p. 141 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<a class="scan" href="/data/feijoo-results/C038_trevoux.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Trévoux para C038 a tamaño completo"><img src="/data/feijoo-results/C038_trevoux.jpg" alt="Recorte de Trévoux: modas (límite) (C038)" loading="lazy" decoding="async"></a>
<figcaption><strong>Trévoux</strong> · febrero 1702, pp. 10–11 · <a href="https://www.digitale-sammlungen.de/view/bsb10539798?page=226" target="_blank" rel="noopener noreferrer">BSB 1</a>; <a href="https://www.digitale-sammlungen.de/view/bsb10539798?page=227" target="_blank" rel="noopener noreferrer">BSB 2</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>D2-C007 · Behaim (reto de 1733)</summary>
<div class="feijoo-compare">
<figure>
<a class="scan" href="/data/feijoo-results/D2-C007_feijoo.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Feijoo para D2-C007 a tamaño completo"><img src="/data/feijoo-results/D2-C007_feijoo.jpg" alt="Recorte de Feijoo: Behaim (reto de 1733) (D2-C007)" loading="lazy" decoding="async"></a>
<figcaption><strong>Feijoo</strong> · IV.8, §XXXIX, n. 85, p. 210 (concludes on p. 211) · <a href="https://hdl.handle.net/10347/7540" target="_blank" rel="noopener noreferrer">USC Minerva</a></figcaption>
</figure>
<figure>
<a class="scan" href="/data/feijoo-results/D2-C007_trevoux.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir recorte original de Trévoux para D2-C007 a tamaño completo"><img src="/data/feijoo-results/D2-C007_trevoux.jpg" alt="Recorte de Trévoux: Behaim (reto de 1733) (D2-C007)" loading="lazy" decoding="async"></a>
<figcaption><strong>Trévoux</strong> · May 1716, art. LVI, pp. 849–850 · <a href="https://www.digitale-sammlungen.de/view/bsb10539855?page=315" target="_blank" rel="noopener noreferrer">BSB 1</a>; <a href="https://www.digitale-sammlungen.de/view/bsb10539855?page=316" target="_blank" rel="noopener noreferrer">BSB 2</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

Las cifras son un **mínimo**, no una lista cerrada. En una prueba con veinte párrafos que los detectores no habían propuesto apareció C038. El resultado depende además de distinguir una reseña de su libro original y de comprobar que el pasaje existía en la primera edición de Feijoo. Los niveles B y C recogen las dependencias más cortas o compartidas con otras fuentes; las traducciones citadas están en D.

Puedo incluso comprar los libros para buscar a sus herederos y pedir el reembolso :)






---

primer post que escribo originalmente en inglés, con miedo a dejar a un LLM traducirlo

mejor resultado es inspirar a peña pa que haga lo mismo !


---

[^1]: la razón es una mezcla entre [Reality has a surprising amount of detail](https://johnsalvatier.org/blog/2017/reality-has-a-surprising-amount-of-detail) y infravalorar la fricción del mundo real. Llevo con un draft atascado sobre esto varios meses, háblame si te interesa el tema! el mapa no es el territorio, borges map guy thing

[^2]: por mucho que me joda, ni siquiera creo que haya excepciones... todos los ejemplos que se me ocurren no es el software en si mismo el diferenciador, si no una idea / diseño de producto / algoritmo... Es posible que esto ya pasara antes de la IA y yo estaba empanado.

[^3]: otros nombres relevantes incluyen a Martín Martínez o Tomás Vicente Tosca. Comenzaba a circular las ideas de Descartes, Newton, el atomismo, los nuevos métodos médicos...

[^4]: (Por referencia, Opus5.5 salió hace una semana de cuando escribo esto, y para mi fue un salto notable en capacidades. No estoy seguro si podría replicar este experimento con Opus 5.)


[^6]: estimación de Rodríguez Cepeda (2008), citada en la [biografía de Feijoo de la Biblioteca Virtual Miguel de Cervantes](https://www.cervantesvirtual.com/portales/benito_jeronimo_feijoo/autor_biografia/).

[^7]: desde su celda de San Vicente midió el calor de Oviedo con un termómetro en el balcón, vigiló el hielo que se formaba dentro de los cristales, experimentó con la conservación del tabaco y el chocolate y usaba un microscopio traído de Holanda. Convenció a la comunidad de que Bartolín, ayudante de cocina a quien intentaban exorcizar, sufría epilepsia. En la hambruna de 1741–42, como no podía salir de la clausura, tiraba por la ventana dinero envuelto en papeles a los pobres.

    Fuente: Dongil 2017 (preprint [https://doi.org/10.5281/zenodo.8105802](https://doi.org/10.5281/zenodo.8105802), pp. 7–9), que remite a biografías anteriores (Otero Pedrayo, Canella); conviene verificar en ellas antes de citar.
