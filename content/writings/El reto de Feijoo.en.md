---
title: Feijoo's Challenge
---

<div class="post-tldr" markdown="1">
<p class="post-tldr-label">TL;DR</p>

Father Feijoo challenged his readers to find lines translated from French journals in his works. Almost three centuries later, I found about ten cases that meet his conditions.

</div>

## Intro

Ever since I read [AI labs need to start funding historical research](https://resobscura.substack.com/p/ai-labs-need-to-start-funding-historical) a few days ago, I've been obsessed with the implications. In short, current frontier models have reached the point where they can produce original historical knowledge on their own, and the author's conclusion is that labs should fund collaborations with historians and archivists to push the frontier.

If you look past the incentives (the person writing it is a historian by profession), what I take from it is that we're at a unique moment where anyone sharp enough can make novel discoveries, before the labs start tying up all the remaining loose ends for a bit of promo.

I'm not the first to think this, it's heavily inspired by the project of [Daniel Bourdeau](https://dbourdeau.github.io/cyphersolver/index.html) (forgive him the slop website...) who is [deciphering WWII messages](https://www.cryptocellar.org/bgac/the-mvueh-break.html) [faster than they can be checked](https://cryptiana.web.fc2.com/code/unsolved.htm), and [a new eyewitness account of the dodo](https://resobscura.substack.com/p/using-opus-55-to-discover-a-new-eyewitness) among others.

Similar to what's happening in mathematics, there's some uncertainty when it comes to verifying that the discoveries are correct. Several of the first Erdős problems solved by LLMs [already had solutions in the literature that hadn't been linked to the problem](https://github.com/teorth/erdosproblems/wiki/AI-contributions-to-Erd%C5%91s-problems), rather than a new idea behind them. This exact skill seems especially valuable for the study of history, because of the huge amount of digitized documents (and the many still missing). Just like in software, the bottleneck moves to verification.

To find topics to explore, I looked for options related to Galicia / Spain that I could reasonably verify on my own. I ended up with a list of a few that I'd like to tackle as soon as possible. In this post I present the results of the first one, to which I devoted a couple dozen hours of my own and several hundred hours of agents. This is a somewhat long post, since I try to talk about everything I find interesting. I encourage using the table of contents to skip anything you're not interested in.

### The challenge

In the [_Prólogo apologético_](https://www.filosofia.org/bjf/bjft3p6.htm) of [Teatro crítico universal](https://www.filosofia.org/bjf/bjft000.htm) III (1729), §5, [Benito Jerónimo Feijoo](https://www.cervantesvirtual.com/portales/benito_jeronimo_feijoo/autor_biografia/) throws down this challenge to all his readers:

> «Lector mío, si estás en Madrid, y entiendes el Francés, ruégote que busques las Memorias de Trevoux, y el Journal des Sçavans, que no pueden faltar en la Biblioteca Real, y en otras; que unos, y otros libros vuelvas, y revuelvas bien; y cuando halles ni un párrafo sólo, ni aun cuatro líneas, que sean traslado, o traducción de ellos, o en este Tomo, o en alguno de los antecedentes, quiero que todos tres los des al fuego, y me obligo a restituirte el dinero que te han costado.»

![Feijoo's challenge in the prologue of volume III, first edition of 1729, with the passage underlined](/data/feijoo-preview/blog/documents/web/01_reto_tcu3_1729_ni_aun_quatro_lineas.jpg)
[Source: Biblioteca Nacional de España, first edition of volume III (1729), image 18, CC BY 4.0.](https://bnedigital.bne.es/bd/es/viewer?id=911fba8d-7ad3-4d7e-9332-a05cb636e5a9).

If it catches your eye that the "s" looks like an "f", it's known as the long S and it has a [fascinating history](https://typefoundry.blogspot.com/2008/01/long-s.html), related to the printing presses of the time, but if I stop at every detail like this I'd never finish. I know because I made that mistake in a [previous post](https://blog.m19182.dev/writings/Consciousness-is-hard/) that I never got around to finishing.

The original idea is to compare volumes I–V (Feijoo himself extended the challenge [in 1733](https://www.filosofia.org/bjf/bjft517.htm) to his new works) of the _Teatro crítico universal_ (TCU from here on) with the _Memorias de Trévoux_ and the volume of the _Journal des Sçavans_ that Feijoo said he had, and see if we find copied passages.

> «Solo me resta un recurso; y es el que propondré ahora. Desafío al Anónimo Autor de la Carta, (sea el que se fuere) y a todos los demás que quieran conspirar con él, para que en una o muchas hojas volantes den al público señalados los lugares de las Memorias de Trevoux, de donde pretenden que haya sacado yo lo mejor que he empleado para el fondo de mi Obra. En vista de las citas ofrezco exhibir las Memorias de Trevoux, (ciento y veinte y cuatro tomos son los que tengo) ante dos Caballeros de los principales de esta Ciudad, y dos Eclesiásticos de la primera distinción, que unos y otros entienden bien el Francés, los cuales, leídos con exactitud los lugares señalados, darán certificación pública, firmada de sus nombres, de que es falsa la acusación, y fingido el robo que me imputan.»

![Feijoo's second challenge, volume V, first edition of 1733, page 388, number 44](/data/feijoo-preview/blog/documents/web/06_segundo_reto_1733_p388.jpg)
*TCU V, discourse XVII, no. 44, p. 388. [First edition, Universidade de Santiago de Compostela](https://hdl.handle.net/10347/7540); [transcription](https://www.filosofia.org/bjf/bjft517.htm).

## Historical context

Benito Jerónimo Feijoo was born in 1676 in Casdemiro, near Ourense, the firstborn of a well-off family of the Galician middle nobility. He entered the Benedictine monastery of Samos early, going against the natural path of the first son (within the marriage). He studied and taught in Galicia, Salamanca and León, and arrived at San Vicente de Oviedo in 1709, where he stayed for the rest of his life (despite multiple invitations to move to more important cities). There he combined his study and university teaching with his ecclesiastical career until his death at 87. His wake and burial [drew huge crowds](https://musarqourense.xunta.gal/sites/default/files/doc/peza_mes/pm_2025_04_esp_0.pdf). His fame attracted many visitors and, many years after his death, [people were still visiting the places where he had lived](https://www.cervantesvirtual.com/portales/benito_jeronimo_feijoo/autor_biografia/).

![Portrait of Feijoo engraved by Juan Bernabé Palomino](https://www.cervantesvirtual.com/images/portales/benito_jeronimo_feijoo/graf/retratos/01_benito_jeronimo_feijoo_s.jpg)
[Source: Biblioteca Virtual Miguel de Cervantes. Palomino engraved it from a portrait made around 1733–1734.](https://www.cervantesvirtual.com/portales/benito_jeronimo_feijoo/imagenes_retratos/imagen/01_benito_jeronimo_feijoo/)

There's quite a lot of information about his life, since he was one of the most celebrated people of the time. He wrote a short autobiography, at the request of a German baron, which along with the funeral honours and testimonies like [Campomanes' *Noticia de la vida de Feijoo*](https://www.filosofia.org/bjf/bjft1p1.htm), as well as letters and news, helps us get a good idea of the life he lived[^7]. Even so, a large part of his papers were lost with [the disentailment](https://es.wikipedia.org/wiki/Desamortizaci%C3%B3n_espa%C3%B1ola), and many of the ones left in the monastery of Samos burned in a fire in 1951.

Monasteries and universities formed an unmatched network for passing knowledge around at the time, they lent books to each other and helped each other get hold of new releases. Feijoo read Latin and French. He often knew English or German ideas through their French version. In this period (late 17th century) a sort of Spanish enlightenment begins, physicians, mathematicians and philosophers (called ["novatores"](https://revistas.usal.es/uno/index.php/Studia_Historica/article/view/2729)) who urged people to pay attention to observation and to the knowledge coming from Europe.[^3] Feijoo wasn't one of the first to discuss these ideas, but he helped bring them to a much wider audience.

The first volume of TCU, his first big essay, came out in 1726, when he was 49 and Spain had had a quarter century of Bourbon dynasty. The title is misleading, it has nothing to do with theatre, they were «discursos varios en todo género de materias, para desengaño de errores comunes». Medicine, astrology, church music, languages... In [*Paralelo de las lenguas*](https://www.filosofia.org/bjf/bjft115.htm) he argued that Galician and Portuguese were actually the same language. One of the most controversial was the [*Defensa de las mujeres*](https://www.filosofia.org/bjf/bjft116.htm).

![Title pages of the first three volumes of the Teatro crítico universal](/data/feijoo-preview/blog/documents/web/05_portadas_tcu_I-III_triptico.jpg)
[BNE first editions: volume I, 1726](https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44), [II, 1728](https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a) and [III, 1729](https://bnedigital.bne.es/bd/es/viewer?id=911fba8d-7ad3-4d7e-9332-a05cb636e5a9).

The publication of these volumes was largely pushed by his ecclesiastical superiors, which is especially relevant since printed works needed approvals and licenses, which in turn are useful to reconstruct his character and standing at the time.[^censura]

<details markdown="1">
<summary>approvals and permissions for volume I</summary>

![Preliminaries of volume I, with the license from the Benedictine order](/data/feijoo-preview/data/feijoo/firsted_scans/I/009.jpg)
The order's license authorized Feijoo to print the book after its examination.

![Approval by Domingo de Lossada in the preliminaries of volume I](/data/feijoo-preview/data/feijoo/firsted_scans/I/011.jpg)
One of the approvals, written by Domingo de Lossada. Besides the judgement on the book, it contains praise for the author.

![Preliminaries of volume I, with the summary of the Council's license](/data/feijoo-preview/data/feijoo/firsted_scans/I/013.jpg)
The summary of the license records the Council's authorization to print it according to the approved original.

[Source: Biblioteca Nacional de España, first edition of volume I, 1726.](https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44)


</details>

Up to eight volumes were published between 1726 and 1739. After that he continued with the [*Cartas eruditas y curiosas*](https://www.filosofia.org/bjf/bjfc000.htm), published in five volumes between 1742 and 1760. One estimate puts the circulation of his work at about 440,000 volumes.[^6] My description here probably falls short of getting across how important he was, he must have been the most recognized Spanish writer inside and outside Spain at the time, he wrote in Castilian when this kind of content was usually in Latin, and his ideas were extremely controversial.

Funnily enough, this year Oviedo hosted a [conference for the three centuries of the first volume](https://ifesxviii.uniovi.es/actividades/congresos).

### Controversy

Living in Oviedo, getting hold of foreign novelties was really hard. An important contact was [Martín Sarmiento](https://consellodacultura.gal/album-de-galicia/detalle.php?persoa=1331), also a Galician Benedictine, who supplied him with materials from Madrid, corrected his texts and defended his positions. Journals like the [*Memorias de Trévoux*](https://catalogue.bnf.fr/ark%3A/12148/cb32813492j), which since 1701 had been collecting reviews and news on all kinds of subjects, were especially relevant.

A few weeks after TCU was published, writings by different authors responding to it were already going around, and several of his friends came out in his defense. There's already the odd accusation, but it isn't [until 1728](https://www.filosofia.org/bjf/bjft1p1.htm), in the _Tertulia histórica y apologética_, that a canon who claims to have studied in Paris says TCU is a translation of several French works, without many more details.

![Accusation of translating French works in the Tertulia histórica y apologética of 1728](/data/feijoo-preview/blog/documents/web/02_tertulia1728_pp8-9_acusacion.jpg)
*Tertulia histórica y apologética*, 1728, pp. 8–9. The canon proposes checking the French sources in the Royal Library.

I find the way they accused each other especially elegant, in the case of _Estrado crítico_  (1727), it's a conversation between four ladies, in _Tertulia histórica y apologética_, one of the characters complains that, after his wife read Feijoo, the marriage was ruined and the woman started studying Latin and French and talking about Descartes.

![Title page of the Estrado crítico en defensa de las mujeres contra el Teatro crítico universal, 1727](/data/feijoo-preview/data/accusers/estrado1727/img/p-01.jpg)
*Estrado crítico*, 1727. The title page is on the right of the scan. [Biblioteca Nacional de España, copy 3/32988(11)](/data/feijoo-preview/data/accusers/estrado1727/estrado_critico_bne_3-32988-11.pdf).

Feijoo answers this last one in the [prologue of the third volume, in 1729](https://www.filosofia.org/bjf/bjft3p6.htm), where he says he has a hundred volumes of Trévoux, but distinguishes between making use of a book and copying it. This is also where he sets out the public wager this post looks into.

That same year, Salvador José Mañer did exactly that, and in _Anti-Teatro_ (1729) pointed to specific places. Feijoo answered him, and Mañer came back in 1731. The fight went on for decades, with new opponents and defenders. In 1750, a Royal Order from Fernando VI banned the publication of the third volume by one of Feijoo's critics, as well as any further rebuttals. This is my attempt at reconstructing the accusations made up to that point:

<details markdown="1">
<summary>Extended timeline of the controversy (1726–1750)</summary>

| Date | Author | Position | Work or intervention | What it questions or contributes | Digitization / text |
| --- | --- | --- | --- | --- | --- |
| 3 Sep. 1726 | Feijoo | Author | *Teatro crítico universal*, I | Sixteen discourses, including the ones on medicine, astrology and the defense of women. | [Scan, BNE](https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44); [transcription](https://www.filosofia.org/bjf/bjft100.htm) |
| 5 Oct. 1726 | Martín Martínez | For | *Carta defensiva sobre el primer tomo del Teatro crítico* | Praises Feijoo's work and discusses his skepticism about medicine. | [Transcription](https://www.filosofia.org/bjf/bjft2p7.htm); [BNE](https://bdh-rd.bne.es/viewer.vm?id=0000093762) |
| 22 Oct. 1726 | Pedro Aquenza | Against | *Breves apuntamientos en defensa de la medicina y de los médicos* | Considers that Feijoo insults physicians and a faculty created by God. | [Reproduction, BVMC/UCM](https://cervantesvirtual.com/portales/maria_jose_alonso_seoane/obra/breves-apuntamientos-en-defensa-de-la-medicina-i-de-los-medicos-contra-el-theatro-critico-universal/) |
| Oct. 1726, according to Caso y Cerra | José Francisco de Isla, attributed | For | *Blanda, suave y melosa respuesta a los ferinos y furiosos apuntamientos* | Burlesque reply to Aquenza. | [Facsimile, Biblioteca de Bizkaia](https://liburutegibiltegi.bizkaia.eus/handle/20.500.11938/76301) |
| 29 Oct. 1726 | Francisco Suárez de Ribera | Mixed | *Templador médico de la furia vulgar* | Defends Martínez and Feijoo against Aquenza, but disagrees with the discourse on medicine and defends the bezoar. | [Scan, Wellcome](https://wellcomecollection.org/works/mupc5k65) |
| Nov. 1726 | Feijoo | Author | *Respuesta a los doctores Martínez, Aquenza y Ribera* | Answers the first interventions on his medicine discourse. | [Reply to Martínez, transcription of a later edition](https://www.filosofia.org/bjf/bjft2p8.htm) |
| 3 Dec. 1726 | Eustaquio Cerbellón de la Vera | Against | *Diálogo harmónico* | Defends church music against Feijoo's criticism. | — |
| 17 Dec. 1726 | «Laurencio Manco de Olivares», pseudonym | Against | *Contradefensa crítica a favor de los hombres* | Contests the defense of women in the first volume. | — |
| 24 Dec. 1726 | Francisco Suárez de Ribera | Against | *Medicina cortesana satisfactoria* | Replies to Feijoo and sticks to his defense of the bezoar. | — |
| late 1726 | Diego de Torres Villarroel | Against | *Posdatas de Torres a Martínez*; *Montante christiano y político* | Steps into the dispute over medicine and astrology. | [Posdatas, transcription](https://www.filosofia.org/bjf/imp/1726dtpo.htm) |
| 1726–1727 | Jorge Irún y Adecha | For | *Desengaño de delirios* | Replies to Manco de Olivares in defense of women. | — |
| 4 Jan. 1727, date of the text | Agustín Castejón, attributed | Against | *Dudas y reparos sobre que consulta un Escrupuloso* | Questions Feijoo's medical opinions and his defense of women. | — |
| 4 Feb. 1727 | Martín Martínez | For | *Juicio final de la astrología* | Contests astrology and replies to Torres. | [Scan](https://archive.org/details/A1090721); [Transcription](https://www.filosofia.org/bjf/apo/1727mmju.htm) |
| 4 Feb. 1727 | «Ernesto Frayer», Martín de Mendoza de Pina | Specific disagreement | *Discurso philológico crítico sobre el corolario del Discurso XV* | Disputes the identification of Galician and Portuguese. | [Transcription](https://www.filosofia.org/aut/005/1727fra.htm) |
| 16 Feb. 1727 | Juan Antonio Santareli | Against | *Estrado crítico en defensa de las mugeres* | Dialogue defending the traditional ideal of woman. The reference to Bellegarde on p. 20 repeats a quotation Feijoo acknowledged; it doesn't prove hidden copying. | [BNE](https://bdh-rd.bne.es/viewer.vm?id=0000083299) |
| 25 Feb. 1727 | Jerónimo Zafra | Against | *Antiteatro del Teatro crítico* | Contests the first volume, before Mañer's *Anti-Theatros*. | — |
| 25 March 1727 | Ignacio Ximénez Saforcada, as «Geminiano Zafra Ciscodexa» | Against | *Antitheatro délfico judicial jocoserio* | Another rebuttal of the first volume. | — |
| 25 March 1727 | Bernardo López de Araujo | Against | *Residencia médico-cristiana* | Defends traditional medicine against Feijoo. | — |
| 6 May 1727 | Ignacio García Ros | Against | *Medicina vindicata* | Weighs in against Feijoo's criticism of medicine. | — |
| 1 Jul. 1727 | Anonymous | Against | *Cátedra de desengaños médicos* | Continues the medical rebuttals of the first volume. | — |
| 1727 | Anonymous | For | *Papel de Marica la Tonta en defensa de su sexo* | Another reply to Manco de Olivares. | — |
| 1727 | Diego de Torres Villarroel; Julián Salinero | Against | *Entierro del Juicio final y vivificación de la astrología*; *Pragmática del tiempo* | Replies to Martínez's *Juicio final*. | [Entierro, transcription](https://www.filosofia.org/bjf/imp/1727dten.htm) |
| 1727 | Anonymous | For | *Blanda, suave y melosa curación del Escrupuloso y de sus flatos espirituales* | Satirical reply to the Escrupuloso. Feijoo disapproves of its insults. | [Facsimile, Biblioteca de Bizkaia](https://liburutegibiltegi.bizkaia.eus/handle/20.500.11938/76327) |
| 1727 | Feijoo, attributed | Author | *Satisfacción al Escrupuloso* | Answers the objections and rejects the anonymous defender's tone. | [Transcription](https://www.filosofia.org/bjf/bjfvsat.htm) |
| 1727 | «José Madaria», attributed to Feijoo | Author | *Respuesta al señor Asiodoro* | Musical reply to the *Diálogo harmónico*. | — |
| 1727 | Eustaquio Cerbellón de la Vera, attributed | Specific disagreement | *Respuesta de Asiodoro a Madaria* | Continues the technical discussion on music. | — |
| 1727 | Francisco Dorado; Feijoo | Against / author | *Discurso fisiológico-médico*; *Respuesta al discurso fisiológico-médico* | Dorado criticizes Feijoo's medical opinions; Feijoo replies. | [Feijoo's reply, transcription](https://www.filosofia.org/bjf/bjfvre2.htm) |
| 1727 | Francisco García Cabero | Spin-off dispute | *Templador veterinario de la furia vulgar* | Defends farriers against Suárez de Ribera. | [Google Books](https://books.google.com/books?id=67l8TjsaKo8C) |
| 6 Apr. 1728 | Feijoo | Author | *Teatro crítico universal*, II | Second volume, also targeted by Mañer's *Anti-Theatro*. | [Scan, BNE](https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a); [transcription](https://www.filosofia.org/bjf/bjft200.htm) |
| 20 Apr. 1728 | «Jaime Ardanaz y Centellas», unidentified author | Against | *Tertulia histórica y apologética* | Accuses Feijoo of copying Naudé and of translating French journals. The accusation about Trévoux and the *Journal des Sçavans* on p. 9 doesn't point to specific passages. | [BNE](https://bnedigital.bne.es/bd/es/viewer?id=2e8cf240-4b84-4e8f-8702-eecc26a93a7a); [Google Books](https://books.google.com/books?id=qub2aCY8BzwC) |
| 1728, licenses from May | Felipe Brizeño y Zúñiga | Against | *Juicio particular del Juicio Universal* | Contests the discourse on the antipathy between the French and the Spanish. Includes a censure by Torres. | — |
| Nov. 1728 | *Mémoires de Trévoux* | News | «De Madrid», p. 2140 | Reports on how the controversy is growing and on its replies and defenses. | — |
| 1728 | Manuel José de Medrano | Against | *Vida de Santa Inés de Monte-Policiano* | Criticizes the passage on Savonarola. The *Tertulia* picks up his accusation of copying Naudé. | [Google Books](https://books.google.com/books?id=5Sjk50f-evkC) |
| 1728 | Juan Martín de Lessaca | Against | *Apología escolástica en defensa de la Universidad de Alcalá* | Defends scholastic medicine against Martínez and Feijoo. | [Google Books](https://books.google.com/books?id=fwPtNEfJKiUC) |
| 31 May 1729 | Feijoo | Author | *Teatro crítico universal*, III, «Prólogo apologético» | Replies to the *Tertulia* and sets the four-line challenge. | [Scan, BNE](https://bnedigital.bne.es/bd/es/viewer?id=911fba8d-7ad3-4d7e-9332-a05cb636e5a9); [Transcription](https://www.filosofia.org/bjf/bjft3p6.htm) |
| 7 Jun. 1729 | Salvador José Mañer | Against | *Anti-Theatro crítico*, on volumes I and II | Points out seventy oversights and specific passages supposedly taken from Trévoux, among them the Parent one from 1716. | [Scan](https://archive.org/details/bub_gb_B3PVs3sLEroC); [Bibliographic record](https://www.filosofia.org/bjf/imp/smat1.htm) |
| 6 Sep. 1729 | Francisco Antonio de Tejeda, attributed | Against | *Apelación sobre la piedra filosofal* | Contests the discourse on the philosopher's stone in volume III. | — |
| 1729 | José Ortiz Barroso | Against | *Reflexiones physico-curiosas* | Discusses, among other things, the discourse on the old rooster's egg in volume II. | — |
| 1729 | Antonio Heredia y Ampuero | Against | *El estudiante preguntón* | Contests Feijoo, Martínez and the piscatores. | [Transcription](https://www.filosofia.org/bjf/imp/1729eles.htm) |
| 10 Jan. 1730 | Feijoo | Author | *Ilustración apologética* | Replies to Mañer and refutes his seventy oversights. The title page says 1729. | [Scan, Universidad de Oviedo](https://digibuo.uniovi.es/dspace/handle/10651/13197) |
| Sep. 1730 | Letter from Zaragoza, attributed to Tejeda by Feijoo | Against | Letter in Trévoux, pp. 1693–1696 | Claims Feijoo took the best of his work's content from the journal. | — |
| 1730 | Lucas Montoya y Rada | For | *Rebeses al estudiante preguntón* | Defense of Feijoo against Heredia by way of an allegorical play. | — |
| 1730 | Diego de Torres Villarroel | Against | *Último sacudimiento de botarates y tontos; y si me vuelven a enfadar no será el último* | Attacks, among others, the defender Lucas Montoya y Rada. | — |
| 30 Jan. / March 1731 | Carlos de Montoya y Uzueta; Martín Sarmiento | Against / for | *Crítico y cortés castigo de pluma*; *Carta a don Carlos Montoya* | Montoya attacks Feijoo and Sarmiento. Sarmiento replies as «Sancho Revulgo y Cantalapiedra». | — |
| Jun. 1731 | Jean-Baptiste Boyer | For | «Lettre sur un ouvrage du R. P. Feijoo», *Mercure de France* | Praises the reception and standing of the *Teatro crítico*. | — |
| 7 Aug. 1731 | Salvador José Mañer | Against | *Anti-Theatro sobre el tomo tercero* and *Réplica satisfactoria* | Announces 998 errors and responds explicitly to the challenge. Repeats the accusation about Parent and adds others. | [Scan, Universidad de Alicante](https://hdl.handle.net/10045/140067) |
| Apr. 1732 | Jean-Baptiste Boyer | For | Review in the *Mercure de France*, pp. 743–752 | Comments on volume III and the *Ilustración apologética*. | — |
| 23 Dec. 1732 | Martín Sarmiento | For | *Demostración crítico-apologética*, two volumes | Defends Feijoo, among other ways by explaining common sources. Talks about more than a hundred «papelones» against him. | [Volume I](https://archive.org/details/demonstracioncr00sarmgoog); [volume II](https://archive.org/details/demonstracioncr01sarmgoog); [transcription](https://www.filosofia.org/bjf/apo/sardc.htm) |
| 7 Jul. 1733 | Feijoo | Author | *Teatro crítico universal*, V, discourse 17 | Replies to the Zaragoza letter and renews the challenge. States he owns 124 volumes of Trévoux out of the 128 published. | [Transcription](https://www.filosofia.org/bjf/bjft517.htm) |
| 1733 | Jacinto Segura | Against | *Norte crítico* | Disputes the treatment of Savonarola in the prologue of volume III. | [Google Books](https://books.google.com/books?id=EYWQm2Oc4aIC) |
| 14 Sep. 1734 | Manuel Mariano Ballester y de la Torre | Against | *Combate intelectual* | Contests three discourses of the *Teatro crítico*. | — |
| 19 Oct. 1734 | «Álvaro Menards», Salvador José Mañer | Against | *El famoso hombre marino del P. M. Feijoo* | Attacks the account of the Liérganes man in volume VI. | — |
| 7 Dec. 1734 | Manuel Marién y Rubio | Against | *Primera parte de la singular vida de don Alonso Pérez de Saabedra, falso nuncio en Portugal* | Contradicts Feijoo's account of how the Inquisition was introduced in Portugal. | — |
| 1734 | Salvador José Mañer | Against | *Crisol crítico*, two parts | Replies to Sarmiento's *Demostración*. | [PDF scan](https://rhinoresourcecenter.com/wp-content/uploads/2016/03/1459160064.pdf); [Google Books](https://books.google.com/books?id=OMqJqnhWy6gC) |
| 1735–1737 | Ignacio de Armesto y Ossorio | Mixed | *Theatro anti-crítico universal*, three books | Presents himself as arbiter of the dispute between Feijoo, Sarmiento and Mañer. | [Scan, Universidad de Alicante](https://hdl.handle.net/10045/141582); [HathiTrust catalog](https://catalog.hathitrust.org/Record/009312437) |
| 1735 | Jacinto Segura | Against | *Vindicias históricas por la inocencia de fray Gerónimo Savonarola* | Keeps up the defense of Savonarola against Feijoo. | — |
| 1741 | Alonso Rubiños | Against | *Theatro de la verdad* | Defends the exorcism of animals against volume VIII. | — |
| 1742 | Nicasio de Zárate | Against | *Bayles mal defendidos y Señeri sin razón impugnado* | Contests Feijoo's defense of dances. | [Google Books](https://books.google.com/books?id=yyEaJ0411WEC) |
| 1743–1744, bibliographic dating | Francisco Arango | Against | *Carta apologética en favor del anual milagro de las flores* | Defends the supposed miracle of the flowers of San Luis. | — |
| 1744 | Antonio Raymundo Pasqual | Against | *El milagro de la sabiduría del B. Raymundo Lulio* | Defends Ramón Llull against Feijoo. Sermon preached in 1743. | [Scan, BNE](https://bdh-rd.bne.es/viewer.vm?id=0000062624) |
| 1744 | Joaquín Javier de Aguirre | Against | *El príncipe de los poetas Virgilio, mantenido en su soberanía* | Defends Virgil against Feijoo's preference for Lucan. | — |
| 1744 | Juan Ros | Against | *Relación histórica de la portentosa anual maravilla de las flores de San Luis* | Another defense of the supposed miracle. | — |
| 1745 | Feijoo | Author | *Hecho y derecho en la famosa cuestión de las flores de San Luis* | Replies to the defenders of the miracle, in letter II.29. | [Transcription](https://www.filosofia.org/bjf/bjfc229.htm) |
| 1746 | Bartolomé Fornés | Against | *Liber apologeticus Artis Magnae B. Raymundi Lulli* | Defense of Ramón Llull, written in Latin. | — |
| 7 Nov. 1748 | Fernando VI | For | Royal decree appointing Feijoo royal councillor | Royal recognition of Feijoo. | — |
| 6 May 1749 | Francisco de Soto y Marne | Against | *Reflexiones crítico-apologéticas*, two volumes | Lists plagiarism accusations discourse by discourse, among them Parent and the iron in plants. The licenses are from 1748. | [Volume I](https://archive.org/details/b30526863_0001); [volume II](https://archive.org/details/b30526863_0002) |
| 23 Sep. 1749 | Feijoo | Author | *Justa repulsa de inicuas acusaciones* | Replies to Soto y Marne and rejects his plagiarism accusations. | [Transcription](https://www.filosofia.org/bjf/bjfvjr5.htm) |
| 23 Jun. 1750 | José de Carvajal y Lancáster, by order of Fernando VI | For | Royal order on the rebuttals of Feijoo | Bans Soto y Marne's third volume and any new rebuttals. Original cited: BNE, ms. 10.579, ff. 31v–32r. | [Transcription in Caso y Cerra, no. 283](https://digibuo.uniovi.es/dspace/handle/10651/78468) |
| Sep. 1750 | Francisco de Soto y Marne | Against | *Memorial a la Majestad Católica* | Reacts to the ban on his rebuttals. | — |
| 1750 | Lucas Ramírez, attributed | For | *La derrota de los alanos* | Reply to Soto y Marne's *Reflexiones*. | [Scan, BNE](https://bdh-rd.bne.es/viewer.vm?id=0000106623) |

Sources: [Caso González and Cerra Suárez, *Bibliografía feijoniana* (1981)](https://digibuo.uniovi.es/dspace/handle/10651/78468); [Campomanes, *Noticia de la vida y obras* (1765)](https://www.filosofia.org/bjf/bjft1p1.htm).

</details>

This whole debate is pretty unfair to Feijoo, who [made it clear that he read these texts and took inspiration from them](https://www.filosofia.org/bjf/bjft3p6.htm), although he distinguished between making use of a book and translating it. Anyway, I'll leave some of my incredible titles, like:

- [*Crítico y cortés castigo de pluma*](https://digibuo.uniovi.es/dspace/bitstream/handle/10651/78468/1b-Ediciones-Feijoo-Obras-completas-t-I-Bibliografia-o.pdf?sequence=1)
- [*Justa repulsa de inicuas acusaciones*](https://www.filosofia.org/bjf/bjfvjr5.htm) (1749)
- [*Blanda, suave y melosa respuesta a los ferinos y furiosos apuntamientos*](https://liburutegibiltegi.bizkaia.eus/handle/20.500.11938/76301)
- [*Contradefensa crítica a favor de los hombres*](https://digibuo.uniovi.es/dspace/bitstream/handle/10651/78468/1b-Ediciones-Feijoo-Obras-completas-t-I-Bibliografia-o.pdf?sequence=1)
- [*Cantáridas amigables para remedio de sueños desvariados*](https://cervantesvirtual.com/obra/cantaridas-amigables-para-remedio-de-suenos-desvariados-i-consejos-de-coromias-a-torres-dormido-sobre-le-montante-que-manejo-en-la-pendencia-musica-sonada-988743/)
- [*Blanda, suave y melosa curación del Escrupuloso y de sus flatos espirituales*](https://liburutegibiltegi.bizkaia.eus/handle/20.500.11938/76327)
- [*Montante christiano, y político, en pendencia Música-Médica-Diabólica*](https://digibuo.uniovi.es/dspace/bitstream/handle/10651/78468/1b-Ediciones-Feijoo-Obras-completas-t-I-Bibliografia-o.pdf?sequence=1)
- [*Templador médico de la furia vulgar*](https://wellcomecollection.org/works/mupc5k65)

I wish more posts had titles like these!

## Process

Four lines take up about 35–40 words in the first editions. At first I compared volumes I, II and III with the earlier issues of the *Memorias de Trévoux* and with the only volume of the *Journal des Sçavans* that Feijoo said he had. Then I extended the search to volumes IV and V and to Trévoux up to 1732 to check the 1733 challenge, which no longer mentioned the *Journal* or set a four-line limit. The search grew whenever I found promising cases, since I also went looking for the books mentioned in the corresponding journal article.

There are endless thematic overlaps, but for a passage to count it has to be a clear translation or a paraphrase with some concrete sign of dependence: same error, same unusual sequence of facts...

### Corpus

Getting the documents with good OCR was not trivial at all. The [Munich Digitization Center (MDZ)](https://www.digitale-sammlungen.de/en/contact) kindly gave me access to their files, but I ended up redoing the OCR of Internet Archive scans for better quality.

<details markdown="1">
<summary>Downloaded documents and OCR</summary>

| Document | Downloaded | OCR |
|---|---|---|
| TCU I–V | [Transcriptions](https://www.filosofia.org/bjf/bjft000.htm); first editions [I](https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44), [II](https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a) and [III](https://bnedigital.bne.es/bd/es/viewer?id=911fba8d-7ad3-4d7e-9332-a05cb636e5a9), 664 openings; PDF and images of [IV–V](https://hdl.handle.net/10347/7540) | BNE OCR for I–III; working transcriptions for I–V |
| Trévoux, Getty / [Internet Archive](https://archive.org/details/memoirespourlhis1701unse), 1701–1732 | 129 volumes: images and ABBYY text | Redone with Kraken + PP-OCRv6-medium: 66,964 leaves from 1701–1729 and about 7,034 from 1730–1732 |
| Trévoux, [BSB/MDZ](https://www.digitale-sammlungen.de/en/view/bsb10539793), 1701–1732, and [Amsterdam reprint](https://www.digitale-sammlungen.de/en/view/bsb11040060) | 134 volumes, including nine from Amsterdam; occasional images. July–September 1727 is missing | 78,908 hOCR pages downloaded |
| [Journal des Sçavans of 1682](https://www.digitale-sammlungen.de/en/view/bsb10539522), Amsterdam, 1683 | 482 images | BSB OCR for 60; Tesseract for the other 422 |
| Histoire de l'Académie royale des sciences, 1699–1728 | Text of 30 volumes | Existing OCR |
| Bayle, Dictionnaire historique et critique, 1702 | Three volumes: [I](https://archive.org/details/bub_gb_9zPfImQPeQkC), [II](https://archive.org/details/b30456198_0001), [III](https://archive.org/details/bub_gb_Gqo-AAAAcAAJ) | Existing OCR |
| Menagiana, 1729 | Four volumes | Existing OCR |
| Fontenelle, Œuvres diverses, 1728–1729 | Three volumes | Existing OCR |
| Moréri | Four volumes from 1717 and two of the 1716 Supplément | Existing OCR |
| Montfaucon, L'Antiquité expliquée, 1719 | Ten volumes | Existing text |
| Dictionnaire de Trévoux, 1721 | Text | Existing text |
| Writings from the controversy | PDFs, images or texts of Estrado, Tertulia, Mañer 1729/1731/1734, Sarmiento 1732, Soto Marne 1749, Feijoo's replies and Bibliografía feijoniana | OCR or transcriptions, depending on the document |
| Sources for each case | Reviewed books, scientific memoirs and other texts: PDFs, images or transcriptions | Depending on availability |

</details>

### OCR

Most of the documents have online versions, but they usually carry corrections from later editions and changes to make them easier to read, so we need the first edition. I did most of the processing on [my server](https://blog.m19182.dev/writings/Building-my-Homelab/) with an RTX 3090. The OCR ran on the GPU and the CPU in parallel for about three days. At first I figured it would need more than a week, but several optimizations along the way brought the time down.

After trying a few I went with [Kraken](https://dh-abstracts.library.virginia.edu/works/9912), a very flexible model specialized in historical texts, to locate the lines on each page, and PP-OCRv6-medium to recognize the text. The [Kraken documentation](https://kraken.re/main/index.html) explains the two stages.

It was important to take into account the quirks of the printing presses of the time that I mentioned before. The Internet Archive text already had OCR, but with quite a few problems (long s -> f, lots of split words...). I made a benchmark with a few pages from each volume where I had a reference transcription to compare against. Multimodal LLMs all worked really badly (gpt6, moondreamV2, Gemini 3.8) and the cost wasn't viable.

![Character error rate of the OCR engines on the Trévoux sample](/data/feijoo-preview/blog/figures/fig7_ocr.png)

![Comparison of the underlined Trévoux passage with the old and the new OCR](/data/feijoo-preview/blog/documents/web/ocr_1716_comparacion.png)


<details markdown="1">
<summary>Examples</summary>

![Faded scan of Trévoux from 1703, page 202](/data/feijoo-preview/blog/documents/web/ocr_1703_p202.jpg)
*1703, p. 202: faded scan and names in italics. [Internet Archive original](https://archive.org/download/memoirespourlhis1703unse/page/leaf212.jpg).*

![Trévoux from 1729, page 1410, with italics and tight spacing](/data/feijoo-preview/blog/documents/web/ocr_1729_p1410.jpg)
*August 1729, p. 1410: italics, ligatures and tight spacing. [Internet Archive original](https://archive.org/download/memoirespourlhi1729unse_1/page/leaf260.jpg).*

</details>

### Matching

With the texts available, we have to look for copied passages and verify them. The [work by Hinderks, Ledins, Ginter and Tolonen on "translation mining"](https://doi.org/10.1080/01615440.2026.2675558) is very close to this. The idea is to compute embeddings of the fragments, which represent their content as vectors and let you compare texts in different languages. Two sentences that say something similar should end up close together regardless of the language. There are other precedents, like [Roe, Olsen and Morrissey](https://hal.science/hal-03740005), who looked for translations of the *Cyclopaedia* in the *Encyclopédie* using machine translation and text alignment.

Applying this naively gives a ton of false positives. Feijoo and the French journals were constantly talking about the same topics, citing the same authors and works. I tried several models and the one that gave the best results by far was [LaBSE](https://huggingface.co/sentence-transformers/LaBSE). This model was [trained specifically for translations](https://aclanthology.org/2022.acl-long.62/). I considered retraining it with Feijoo-specific data, but that stays as possible future work, I don't think it's worth it.

A high score on its own said little, so I used [margin scoring](https://aclanthology.org/P19-1309/). It compared the similarity of each pair with the similarity both fragments had to their closest alternatives in the other language. If they were very similar to each other, but also to lots of others, the score went down, and vice versa. This helped pick which matches were worth reviewing.
I also looked at proper names and numbers, which tend to survive a translation, to find regions of interest. Latin quotations weren't useful since they tended to repeat in many places.

To complement this, I also machine-translated Feijoo's text into French and compared rare words. The kind of false positives it found was different from the embeddings', but it turned up some extra case like the planets one I go into later. A lot of duplicates had to be cleaned up, because I was doing the analysis at the same time as I was processing the data.

Finally, to check how well this process worked, I planted artificial cases in Feijoo's text. In the hardest examples, it got up to 42 out of 50, the ones it missed being mostly paraphrases of the machine translation. I'm sure I haven't detected every possible case.
### Verifying

This is where most of the work went. The detectors turned up a lot of cases but each candidate was quite open to interpretation.

A first agent read the fragments and classified them as translation, close paraphrase, shared fact or noise. The most promising cases got an adversarial review, and any disagreement went back to the first step to be reclassified. If it passed this first filter, it was compared again against the first editions and the other sources mentioned. Trévoux was a review journal, the parallel usually came from the book being reviewed, and I wanted to identify those cases as such. Same with translations that had already been identified, Mañer, Sarmiento, Soto Marne and the later literature backed up many of the cases I found.

Finally, I checked by hand every one that made it through the whole process, which took a good while, but in exchange I come away with the ability to read 18th-century books fairly fluently.

![Full pipeline: download, OCR, text preparation, two search paths, evaluation, source review and case classification](/data/feijoo-preview/blog/figures/fig6_pipeline.png)

### Working with agents

Unlike a lot of my friends, I'm still somewhat reluctant to throw swarms of agents at a task with little supervision. In my experience, they still don't work as well as when you hold their hand a bit.[^4] The trend is clearly toward them needing less and less supervision and being able to take on longer tasks, I wouldn't be surprised if in a few months this very blog could be replicated with a relatively simple prompt, but for now I had to be pretty involved in the process.

One thing I notice is that they fixate on details and waste huge amounts of time and tokens on them, details that fall apart with the slightest bit of big-picture view. But by far the biggest problem was dealing with context loss over time. The way I ended up working was a main agent orchestrating multiple subagents (usually around 10) á la cursor projects, which were the ones doing the actual work (reviewing promising cases, monitoring the OCR runs, reviewing literature...). I used both Opus5.5 and GPT-6Astra, with anecdotally better results with Opus.

The other big problem was documentation, since most of the subagents had a defined task and then disappeared, and I was trying to avoid filling the orchestrators' context with irrelevant stuff, I documented almost every relevant fact in mds. The result was that I had hundreds of documents, written in prose that is extremely uncomfortable to digest, and a lot of them full of questions already answered, hypotheses already tested, data we had already found out was wrong...

The solution was a mix of agents tasked with routinely reviewing the documentation, and a lot more manual review than I'd like to admit. I don't have enough hands to count the times a subagent jumped in with a "groundbreaking discovery" that sank under the slightest scrutiny. LLMs tend to overrate their work and underrate their capabilities at the same time.

Another thing to keep in mind in a set-up like this is that it's going to overindex on your words massively, and it's important to keep that in mind every time you talk to the orchestrator. More than once it started steering multiple subagents with instructions meant for one specific task. At the same time, the way you talk to it has a huge effect, the clearest example being [Terence Tao's chats](https://chatgpt.com/share/6a5fdc7a-d6f8-83e8-bbea-8deb42cfed56), where, without really complex prompts, and with access to the same models as me, he gets incredible results.

They were pretty useless for writing this post, but they did help quite a bit with fixing errors and suggesting places where the prose could be better. As I wrote more, the suggestions got quite a bit sharper but never quite hit the mark. Having a corpus of your own writing is useful for keeping a similar voice, however I do find that sometimes my way of writing (even of talking!) starts to look like an LLM's. I had already noticed this in colleagues before, but writing here I caught myself correcting myself several times. It worries me that this is happening at a large scale.

## Results

So far I've found about 10 places where I'm fairly sure they settle the challenge, plus several more that could count depending on how you read the rules.

| Search | Candidates judged | Strict (A) | Dependent or short (B/C) | Cited translations (D) |
|---|---:|---:|---:|---:|
| 1729 challenge: TCU I–III against Trévoux and the 1682 volume of the *Journal* | 633 | 9 + 2 borderline | 4 B + 4 C | 4 |
| 1733 extension: TCU IV–V against Trévoux up to 1732 | 237 | 1 | 1 B + 2 C | 8 |

<details markdown="1">
<summary>Table of challenge cases</summary>

| Case | Feijoo | Trévoux | Strict words | Why it counts; what was known |
|---|---|---|---:|---|
| C001, sunspots | II.14, 1728 | Parent, Feb. 1716 | ≈128 | Shares an error about the book of the *Georgics* and «Tum caput». Mañer already pointed out the article in 1729. |
| C002, iron in plants | II.14, 1728 | Lémery, Mar. 1707 | ≈180 | Follows the syntax of the review and details missing from the original memoir. Soto Marne pointed out part of the passage. |
| C003, abbess of Fontevrault | I.16, 1726 | Dec. 1704 | ≈54 | The combination of queen, king and burned verses is missing from Moréri. I found no earlier identification. |
| C004, Philippines | II.2, 1728 | Taillandier, Jul. 1715 | ≈127 | Calques and the same geographical error: Dapitan becomes Magallanes. Mañer had already denounced it. |
| C005, medical sects | I.5, 1726 | Barchusen, Nov. 1710 | ≈120 | Follows the order and mergers of the review, not of the book. Feijoo revealed in 1727 that he had that extract from Trévoux. |
| C009, musical modes | I.14, 1726 | Bonnet, Apr. 1716 | 37–51 | Repeats a sequence of characterizations and «Subphrigio». I found no earlier identification. |
| C010, longevity | I.12, 1726 | Temple, Jul. 1702 | 43 | Keeps the review's «Nesmond» and the scope of «toute l'Angleterre». I found no earlier identification. |
| C017, planetary rings | III.2, 1729 | Feb. 1718 | ≈82 | Attributes the story to Camilo Leonardo, but his book doesn't contain those details; it follows the French review. I found no earlier identification. |
| C020, giant's hand | I.12, 1726 | Sep.–Oct. 1701 | 54 | Feijoo cites the English *Transactions*, but follows the French excerpt, which leaves out the porpoise. I found no earlier identification. |
| C012, saints' lives | III.6, 1729 | May–Jun. 1701 | ≈48–51, borderline | One sentence follows the reviewer's condensation; the dependence on Trévoux is close to the threshold. |
| C038, fashions | II.6, 1728 | Henrion, Feb. 1702 | 38, minimum 30 | Sentence translated clause by clause. It came out of a sample read by hand, not from the detectors; the *Mercure galant* still needs checking. |
| D2-C007, Behaim | IV.8, 1730 | Stuvenius, May 1716 | ≈98, minimum 39 | Follows the order and details of the review that aren't in the Latin book. No earlier identification found. Searches in the Journal and the Acta, including the supplements checked, found no other equivalent review. |

</details>

### The sunspots

Mañer had already pointed out this case in 1729. In the [*Paradojas físicas*](https://www.filosofia.org/bjf/bjft214.htm), Feijoo talks about sunspots, gathering stories and observations of enormous spots. This same topic shows up in an article by Antoine Parent in Trévoux 1716, twelve years before the second volume of TCU.

When it comes to Virgil, both texts put a few lines in the second book of the *Georgics*, when they're actually in [the first, lines 466–468](https://www.thelatinlibrary.com/vergil/geo1.shtml). Feijoo rearranges part of the explanation and fixes some other detail, but it's one of the clearest examples of how he was probably working off the French text and adapting it as he went.

[Passages and sources for case C001](/data/feijoo-evidence/cases/C001.html).

### A ring to get rich and read minds

This case came up through the other search path, after translating Feijoo's text into French. In [*Secretos de Naturaleza*](https://www.filosofia.org/bjf/bjft302.htm), Feijoo attributes to Camilo Leonardo a list of seven stones, seven metals and their corresponding planets. Then he explains how to make a ring that would bring wealth. The Trévoux review from February 1718 says the same thing, but it's talking about three authors. The first is Camilo Leonardo; the list of correspondences comes from the second, Pierre d'Arleu; the ring example, from the third, Albinius. Feijoo keeps the name that shows up at the start and attributes the whole block to him.

[Passages, original books and sources for case C017](/data/feijoo-evidence/cases/C017.html).

### Examples

These are the clippings from the first editions. Open each case to compare them.

<details class="feijoo-case">
<summary>C001 · sunspots</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C001_feijoo.jpg" alt="Feijoo clipping: sunspots (C001)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · II (1728), p. 250, n. 23 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C001_trevoux.jpg" alt="Trévoux clipping: sunspots (C001)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · February 1716, art. XXIV, p. 331 · <a href="https://www.digitale-sammlungen.de/view/bsb10539854?page=345" target="_blank" rel="noopener noreferrer">BSB</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C002 · iron in plants</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C002_feijoo.jpg" alt="Feijoo clipping: iron in plants (C002)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · II (1728), p. 258, n. 39 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C002_trevoux.jpg" alt="Trévoux clipping: iron in plants (C002)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · March 1707, art. XXXIV, p. 479 · <a href="https://www.digitale-sammlungen.de/view/bsb10539818?page=507" target="_blank" rel="noopener noreferrer">BSB</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C003 · abbess of Fontevrault</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C003_feijoo.jpg" alt="Feijoo clipping: abbess of Fontevrault (C003)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · I (1726), p. 361, n. 122 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C003_trevoux.jpg" alt="Trévoux clipping: abbess of Fontevrault (C003)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · December 1704, art. CLXXXIX, p. 2119 · <a href="https://www.digitale-sammlungen.de/view/bsb10539809?page=507" target="_blank" rel="noopener noreferrer">BSB</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C004 · Philippines</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C004_feijoo.jpg" alt="Feijoo clipping: Philippines (C004)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · II (1728), p. 53, nn. 73–74 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C004_trevoux.jpg" alt="Trévoux clipping: Philippines (C004)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · July 1715, art. XCVII, pp. 1163–1164 · <a href="https://www.digitale-sammlungen.de/view/bsb10539852?page=71" target="_blank" rel="noopener noreferrer">BSB 1</a>; <a href="https://www.digitale-sammlungen.de/view/bsb10539852?page=72" target="_blank" rel="noopener noreferrer">BSB 2</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C005 · medical sects</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C005_feijoo.jpg" alt="Feijoo clipping: medical sects (C005)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · TCU I (1726), p. 112 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C005_trevoux.jpg" alt="Trévoux clipping: medical sects (C005)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · Nov. 1710, p. 1954 · <a href="https://archive.org/details/memoirespourlhi1710unse_2/page/n309" target="_blank" rel="noopener noreferrer">Internet Archive</a></figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C009 · musical modes</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C009_feijoo.jpg" alt="Feijoo clipping: musical modes (C009)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · TCU I (1726), p. 274 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C009_trevoux.jpg" alt="Trévoux clipping: musical modes (C009)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · Apr. 1716, p. 597; Apr. 1716, p. 598 · <a href="https://archive.org/details/memoirespourlhi1716unse_0/page/n54" target="_blank" rel="noopener noreferrer">Internet Archive 1</a>; <a href="https://archive.org/details/memoirespourlhi1716unse_0/page/n55" target="_blank" rel="noopener noreferrer">Internet Archive 2</a></figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C010 · longevity</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C010_feijoo.jpg" alt="Feijoo clipping: longevity (C010)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · TCU I (1726), p. 234 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C010_trevoux.jpg" alt="Trévoux clipping: longevity (C010)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · Jul. 1702 (title page misprinted «1701»), p. 78; Sep.–Oct. 1701, p. 299 · <a href="https://archive.org/details/memoirespourlhi1702unse_2/page/n81" target="_blank" rel="noopener noreferrer">Internet Archive 1</a>; <a href="https://archive.org/details/memoirespourlhi1701unse_1/page/n302" target="_blank" rel="noopener noreferrer">Internet Archive 2</a></figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C017 · planetary rings</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C017_feijoo.jpg" alt="Feijoo clipping: planetary rings (C017)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · TCU III (1729), p. 25 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=911fba8d-7ad3-4d7e-9332-a05cb636e5a9" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C017_trevoux.jpg" alt="Trévoux clipping: planetary rings (C017)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · Feb. 1718, p. 334; Feb. 1718, p. 336 · <a href="https://archive.org/details/memoirespourlhis1718unse/page/n342" target="_blank" rel="noopener noreferrer">Internet Archive 1</a>; <a href="https://archive.org/details/memoirespourlhis1718unse/page/n344" target="_blank" rel="noopener noreferrer">Internet Archive 2</a></figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C020 · giant's hand</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C020_feijoo.jpg" alt="Feijoo clipping: giant's hand (C020)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · I.12, §VIII, n. 23, p. 243 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C020_trevoux.jpg" alt="Trévoux clipping: giant's hand (C020)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · September–October 1701, p. 291 · <a href="https://www.digitale-sammlungen.de/view/bsb10539794?page=543" target="_blank" rel="noopener noreferrer">BSB</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C012 · saints' lives (borderline)</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C012_feijoo.jpg" alt="Feijoo clipping: saints' lives (borderline) (C012)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · III.6, §I, n. 5, p. 99 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=911fba8d-7ad3-4d7e-9332-a05cb636e5a9" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C012_trevoux.jpg" alt="Trévoux clipping: saints' lives (borderline) (C012)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · May–June 1701, p. 62 · <a href="https://www.digitale-sammlungen.de/view/bsb10539793?page=524" target="_blank" rel="noopener noreferrer">BSB</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>C038 · fashions (borderline)</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/C038_feijoo.jpg" alt="Feijoo clipping: fashions (borderline) (C038)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · II.6, §II, n. 6, p. 141 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/C038_trevoux.jpg" alt="Trévoux clipping: fashions (borderline) (C038)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · February 1702, pp. 10–11 · <a href="https://www.digitale-sammlungen.de/view/bsb10539798?page=226" target="_blank" rel="noopener noreferrer">BSB 1</a>; <a href="https://www.digitale-sammlungen.de/view/bsb10539798?page=227" target="_blank" rel="noopener noreferrer">BSB 2</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

<details class="feijoo-case">
<summary>D2-C007 · Behaim (1733 challenge)</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/D2-C007_feijoo.jpg" alt="Feijoo clipping: Behaim (1733 challenge) (D2-C007)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · IV.8, §XXXIX, n. 85, p. 210 (continues on p. 211) · <a href="https://hdl.handle.net/10347/7540" target="_blank" rel="noopener noreferrer">USC Minerva</a></figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/D2-C007_trevoux.jpg" alt="Trévoux clipping: Behaim (1733 challenge) (D2-C007)" loading="lazy" decoding="async">
<figcaption><strong>Trévoux</strong> · May 1716, art. LVI, pp. 849–850 · <a href="https://www.digitale-sammlungen.de/view/bsb10539855?page=315" target="_blank" rel="noopener noreferrer">BSB 1</a>; <a href="https://www.digitale-sammlungen.de/view/bsb10539855?page=316" target="_blank" rel="noopener noreferrer">BSB 2</a> (NoC-NC 1.0)</figcaption>
</figure>
</div>
</details>

### Copies from other books

The challenge only mentioned Trévoux and the Journal, but since I had all this set up I ran it over other French sources (the *Histoire* of the Académie des sciences, Bayle's *Dictionnaire*, Moréri, the *Menagiana* and Fontenelle). About 17 passages come out, almost all from Moréri. Not surprising, Feijoo cites these works in several of his writings, but these are the places where he didn't:

<details markdown="1">
<summary>Table of examples from other books</summary>

| Case | Feijoo | Book | Uncited words | What gives it away |
|---|---|---|---:|---|
| [O153, the cavalier Borri](/data/feijoo-evidence/cases/O153.html) | III.2, 1729 | Bayle 1702 (Moréri reprints the main text) | ≈800 | Follows the article and its notes in the same order. In the whole discourse he only cites Moréri, and for something else. |
| [O508, the learned Italian women](/data/feijoo-evidence/cases/O508.html) | I.16, 1726 | Moréri, seven articles | ≈585 | Bucca, Nogarola, Cereti, Fidele, Cibo, Marchina and Cornaro. Moréri is the only text checked that has all seven. |
| [O526, Apollonius of Tyana](/data/feijoo-evidence/cases/O526.html) | II.5, 1728 | Du Pin 1705 | ≈420 | «Ciento y veinte años», like Du Pin's «six vingt ans»; Trévoux says 110. He cites Philostratus and Lucian, not Du Pin. |
| [O475, the Sibyls](/data/feijoo-evidence/cases/O475.html) | II.4, 1728 | Moréri | ≈330 | Tarquin's «trescientos escudos» and a counting error («Eliano cuatro») that comes from Moréri. |
| [O471, Delphi](/data/feijoo-evidence/cases/O471.html) | II.4, 1728 | Moréri | ≈320 | Echecrates and the maidens «consagradas a Diana», who aren't in Van Dale or in Fontenelle. |
| [O481, the women of Curzolari](/data/feijoo-evidence/cases/O481.html) | I.16, 1726 | Moréri | ≈75 | Two of Moréri's errors: it moves the Korčula story to the Lepanto islands, and the date «el año antecedente». |
| [O474, Poverty](/data/feijoo-evidence/cases/O474.html) | I.3, 1726 | Moréri, Paris edition | ≈48 | «Curio, y de Camila» for Camillus, which comes from the French «Camille». |

</details>

The errors he copies also give away which copy he had. For example, I had downloaded the Amsterdam Moréri (1716–17), but «Camila» and the Aristophanes line about Poverty are only in the Paris editions (1707 and 1718).

<details markdown="1">
<summary>Documents for the examples from other books</summary>

<details class="feijoo-case" open>
<summary>O153 · the cavalier Borri</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/O153_feijoo.jpg" alt="Feijoo clipping: the cavalier Borri (O153)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · III (1729), p. 37, n. 38 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=911fba8d-7ad3-4d7e-9332-a05cb636e5a9" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/O153_fuente.jpg" alt="Bayle clipping: the cavalier Borri (O153)" loading="lazy" decoding="async">
<figcaption><strong>Bayle</strong> · <i>Dictionaire</i>, 1702, t. I, p. 654, BORRI · <a href="https://archive.org/details/bub_gb_9zPfImQPeQkC/page/n693/mode/1up" target="_blank" rel="noopener noreferrer">Internet Archive</a></figcaption>
</figure>
</div>
<p><a href="/data/feijoo-evidence/cases/O153.html">Case sheet O153</a></p>
</details>

<details class="feijoo-case">
<summary>O508 · the learned Italian women (Casandra Fidele)</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/O508_feijoo.jpg" alt="Feijoo clipping: the learned Italian women (Casandra Fidele) (O508)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · I (1726), p. 364, n. 128 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/O508_fuente.jpg" alt="Moréri clipping: the learned Italian women (Casandra Fidele) (O508)" loading="lazy" decoding="async">
<figcaption><strong>Moréri</strong> · 1717, t. II, p. 71, FIDELE · <a href="https://archive.org/details/legranddictionai02mor/page/n78/mode/1up" target="_blank" rel="noopener noreferrer">Internet Archive</a></figcaption>
</figure>
</div>
<p><a href="/data/feijoo-evidence/cases/O508.html">Case sheet O508</a></p>
</details>

<details class="feijoo-case">
<summary>O526 · Apollonius of Tyana</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/O526_feijoo.jpg" alt="Feijoo clipping: Apollonius of Tyana (O526)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · II (1728), p. 110, n. 13 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/O526_fuente.jpg" alt="Du Pin clipping: Apollonius of Tyana (O526)" loading="lazy" decoding="async">
<figcaption><strong>Du Pin</strong> · <i>L'Histoire d'Apollone</i>, 1705, pp. 6–7 · <a href="https://www.digitale-sammlungen.de/view/bsb10773200?page=42" target="_blank" rel="noopener noreferrer">BSB</a></figcaption>
</figure>
</div>
<p><a href="/data/feijoo-evidence/cases/O526.html">Case sheet O526</a></p>
</details>

<details class="feijoo-case">
<summary>O475 · the Sibyls</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/O475_feijoo.jpg" alt="Feijoo clipping: the Sibyls (O475)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · II (1728), p. 78, n. 3 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/O475_fuente.jpg" alt="Moréri clipping: the Sibyls (O475)" loading="lazy" decoding="async">
<figcaption><strong>Moréri</strong> · 1717, t. IV, p. 386, SIBYLLES · <a href="https://archive.org/details/legranddictionai04mor/page/n393/mode/1up" target="_blank" rel="noopener noreferrer">Internet Archive</a></figcaption>
</figure>
</div>
<p><a href="/data/feijoo-evidence/cases/O475.html">Case sheet O475</a></p>
</details>

<details class="feijoo-case">
<summary>O471 · the oracle of Delphi</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/O471_feijoo.jpg" alt="Feijoo clipping: the oracle of Delphi (O471)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · II (1728), p. 82, n. 11 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=87a094e7-aa8b-4411-aa5e-2fb1081e571a" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/O471_fuente.jpg" alt="Moréri clipping: the oracle of Delphi (O471)" loading="lazy" decoding="async">
<figcaption><strong>Moréri</strong> · 1717, t. II, p. 335, DELPHES · <a href="https://archive.org/details/legranddictionai02mor/page/n342/mode/1up" target="_blank" rel="noopener noreferrer">Internet Archive</a></figcaption>
</figure>
</div>
<p><a href="/data/feijoo-evidence/cases/O471.html">Case sheet O471</a></p>
</details>

<details class="feijoo-case">
<summary>O481 · the women of Curzolari</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/O481_feijoo.jpg" alt="Feijoo clipping: the women of Curzolari (O481)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · I (1726), p. 332, n. 47 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/O481_fuente.jpg" alt="Moréri clipping: the women of Curzolari (O481)" loading="lazy" decoding="async">
<figcaption><strong>Moréri</strong> · 1717, t. II, p. 311, CURSOLAIRES · <a href="https://archive.org/details/legranddictionai02mor/page/n318/mode/1up" target="_blank" rel="noopener noreferrer">Internet Archive</a></figcaption>
</figure>
</div>
<p><a href="/data/feijoo-evidence/cases/O481.html">Case sheet O481</a></p>
</details>

<details class="feijoo-case">
<summary>O474 · Poverty</summary>
<div class="feijoo-compare">
<figure>
<img src="/data/feijoo-results/O474_feijoo.jpg" alt="Feijoo clipping: Poverty (O474)" loading="lazy" decoding="async">
<figcaption><strong>Feijoo</strong> · I (1726), p. 65, n. 38 · <a href="https://bnedigital.bne.es/bd/es/viewer?id=7b281e29-5af2-4c38-8c17-ec969f487f44" target="_blank" rel="noopener noreferrer">BNE</a> (CC BY 4.0)</figcaption>
</figure>
<figure>
<img src="/data/feijoo-results/O474_fuente.jpg" alt="Moréri clipping: Poverty (O474)" loading="lazy" decoding="async">
<figcaption><strong>Moréri</strong> · Paris, 1707, p. 181, PAUVRETÉ · <a href="https://archive.org/details/bub_gb_FEmV5fxZ9FQC/page/n193/mode/1up" target="_blank" rel="noopener noreferrer">Internet Archive</a></figcaption>
</figure>
</div>
<p><a href="/data/feijoo-evidence/cases/O474.html">Case sheet O474</a></p>
</details>

</details>

<details markdown="1">
<summary>Full table of other books</summary>

| Case | Feijoo | Book | Uncited | Only from that book | Citation |
|---|---|---|---:|---:|---|
| O153, the cavalier Borri | III.2 §XI, nn. 37–40, 1729 | Bayle 1702, BORRI; Moréri *Suppl.* 1716 | ≈800 | ≈80 | none |
| O508, the learned Italian women | I.16 §XVIII, nn. 124–131, 1726 | Moréri 1717, seven articles | ≈585 | ≈150 | none |
| O526, Apollonius of Tyana | II.5 §V, nn. 12–13, 1728 | Du Pin 1705 | ≈420 | ≈60 | inherited |
| C022, Elena Cornaro Piscopia | I.16, n. 131, 1726 | Moréri 1716, Trévoux Oct. 1713 and Leti | ≈355 | ≈35 | Leti, only for the praise of her |
| O475, the Sibyls | II.4 §I, nn. 3–5, 1728 | Moréri 1717 and *Suppl.* 1716 | ≈330 | ≈60 | inherited |
| O471, Delphi | II.4 §II, nn. 9–11, 1728 | Moréri 1717, two DELPHES articles | ≈320 | ≈80 | inherited |
| C007 + C021, the women painters and Madame Le Hay | I.16 §XXII, nn. 142–145, 1726 | Trévoux 1706 and 1713, Moréri 1716, Carducho 1633, Palomino 1715, Leti | ≈290 | 24 from Trévoux | none |
| O466, Sitti Maani | I.16 §XX, n. 135, 1726 | Moréri 1717 (Thévenot 1663, Rocchi 1627) | ≈280 | ≈15 | none |
| O467, Persian compliments | II.15, n. 11, 1728 | Moréri 1717, which abridges Olearius | ≈116 | ≈19 | none |
| O510, the Anca bird and Chederles | I.1 §VII, n. 20, 1726 | Moréri *Suppl.* 1716 (Bochart, Busbecq via Bayle) | ≈115 | 0–6 | none |
| C006, what different peoples eat | III.10, n. 10, 1729 | Lémery 1702 or its extract in Trévoux | ≈79 | | inherited |
| O481, the women of Curzolari | I.16 §VII, n. 47, 1726 | Moréri 1717 (Graziani 1624) | ≈75 | ≈25 | none |
| O476, diamond cutting | II.2, n. 66, 1728 | R. de Berquen 1661, Moréri *Suppl.* 1716 | ≈70 | 0–5 | none |
| O478, Ami Perrin | I.4, n. 41, 1726 | Moréri, which abridges Maimbourg 1682 | ≈58 | ≈20 | inherited (Maimbourg) |
| O474, Poverty | I.3, n. 38, 1726 | Moréri, Paris edition | ≈48 | ≈40 | inherited |
| O472, the god Terminus | I.4, n. 2, 1726 | Moréri | 44 | ≈14 | inherited |
| O017, Villemot's comets | I.10 §IV, n. 15, 1726 | Fontenelle, *Histoire* of the Académie 1707 | 35 (≈130–155 with nn. 13–14) | 35 | none |
| O512, councils against magic | II.5, nn. 63–64, 1728 | Thiers 1697, Moréri | ≈31 | 0 | below the threshold |
| C034, the modern medical sects | I.5, nn. 18–21, 1726 | Barchusen 1710 | ≈30 | | below the threshold |
| O469, the mottos of Saint Malachy | II.4 §VI, nn. 37–40, 1728 | Moréri *Suppl.* 1716 | ≈455 | | cites the work in n. 41, to criticize it |
| O234, Jacques Aymar's rod | III.5, nn. 17–18, 1729 | Bayle, ABARIS, and *Mercure galant* 1693 | ≈118 from the *Mercure* | | cites Bayle |
| O490, the Isle of Pines | I.12, nn. 20–22, 1726 | Moréri *Suppl.* 1716 | ≈230 | | cites the work |
| O157, Agrippa | II.5, nn. 23–27, 1728 | Bayle | ≈250 | | cites the work |
| O496, Nicolas Flamel | III.8, n. 30, 1729 | Moréri | ≈110 | | cites the work |
| O255, Gómez Pereira | III.9, nn. 11–12, 1729 | Bayle | ≈110 | | cites the author |
| C032, Homberg's gold | II.14, nn. 4–5, 1728 | *Histoire* of the Académie 1702 and 1707 | ≈120 | | cites the author |
| C033, Hecquet's trituration | I.6, n. 11, 1726 | Hecquet 1709 | ≈110–130 | | cites the author |
| C018, Duncan and coffee | I.6, n. 13, 1726 | Duncan 1705 | ≈50 | | cites the author |

"Inherited" means Feijoo only names the authorities the book he's copying already cited (Suidas, Maimbourg, Lucan…).

</details>

## Conclusions

We're at a unique moment in history. This is probably the closest a regular person is going to get to the frontier of models, and the gap will widen over time, a consequence of [scaling laws](https://arxiv.org/abs/2001.08361), frontier labs as [geopolitical actors](https://thezvi.substack.com/p/anthropic-officially-arbitrarily) and [AI existential risks](https://intelligence.org/2026/09/16/if-anyone-builds-it-everyone-dies-one-year-closer/) entering mainstream discourse.

This whole post is an arbitrage between what models can actually do and what most people think they can do. There are many more arbitrages like this with much greater financial returns, and contrary to what I thought in 2023 (I was an avid LessWrong reader lol), they'll last much longer than a technical person would think [^1].

![The Diffusion Gap: AI capabilities, adoption and opportunity](/data/feijoo-preview/blog/post/images/diffusion-gap.png)

---

Nothing I did here is technically complex or complicated. My biggest hope with this is to get more people to put some of their time and tokens into this, if you're interested please get in touch:) That said, I do worry that swamping historians with low-quality slop could trigger a backlash, like already happened with mathematics. While working on this, I tried to get in touch with several experts on the subject, most of them didn't reply, and with some interested ones I'm still in contact, but it's still an open front, since I wanted to get the post out as soon as possible.

Another important point is that this work depends on being able to access scans of the relevant documents. There's so much left to digitize! A [2017 European survey](https://pro.europeana.eu/files/Europeana_Professional/Projects/Project_list/Europeana_DSI-2/Deliverables/d4.4-report-on-enumerate-core-survey-4.pdf#page=28) estimated that archives had digitized 10% of their holdings, and libraries 17%.

Google Books did a lot for digitization. The labs are in a race to get more data, with very strong incentives. Projects like the [digitization of the Boston Public Library's collections](https://www.bpl.org/news/boston-public-library-expands-access-to-collections-through-ai-enhanced-digitization/), or the fact that Anthropic [bought millions of books, scanned them and threw away the originals](https://cases.justia.com/federal/district-courts/california/candce/3%3A2024cv05417/434709/231/0.pdf#page=4), give an idea of where we're headed. As I already argued in [how AI might help save copyright](https://blog.m19182.dev/writings/How-AI-might-help-save-copyright/) 3 years ago, intellectual property laws urgently need reform, information deserves to be free and the second-order consequences are huge.

That's all, here's [the code and relevant files](https://github.com/mateo19182/feijoo), I'll edit the post if I find anything else related to this challenge. Thanks for reading.

[^1]: The reason is a mix of [Reality has a surprising amount of detail](https://johnsalvatier.org/blog/2017/reality-has-a-surprising-amount-of-detail) and underestimating real-world friction. Something being technically possible isn't the most relevant factor for having an impact. I've had a draft stuck on this for several months, talk to me if you're interested in the topic! On that note, [Del rigor en la ciencia, by Borges](https://ciudadseva.com/texto/del-rigor-en-la-ciencia/), .

[^2]: As much as it pisses me off, I'm finding it harder and harder to come up with exceptions... In every example I can think of, the differentiator is an idea, a product design, an algorithm or something around the software. It's possible this was already the case before AI and I just wasn't paying attention.

[^3]: Other relevant names include Martín Martínez and Tomás Vicente Tosca. For context, [Antonio Mestre Sanchís, *Los novatores como etapa histórica*](https://revistas.usal.es/uno/index.php/Studia_Historica/article/view/2729).

[^4]: When I did this work, Opus 5.5 had just come out and for me it was a notable jump in capabilities. I'm not sure I could replicate this post with Opus 5, I really hated that model, 0 soul.

[^6]: Rodríguez Cepeda's 2008 estimate, in [Inmaculada Urzainqui's biography of Feijoo](https://www.cervantesvirtual.com/portales/benito_jeronimo_feijoo/autor_biografia/). It refers to volumes, not readers or copies sold of a single title.

[^7]: From his cell he measured the heat in Oviedo with a thermometer on the balcony, experimented with preserving tobacco and chocolate, used a microscope, argued that a kitchen helper they were trying to exorcise had epilepsy. [*Vida del Padre Feijoo en la comunidad monástica de San Vicente de Oviedo*](https://doi.org/10.5281/zenodo.8105802), 2017, pp. 7–9 of the preprint.

[^censura]: He didn't always escape censorship. In 1739 the Inquisition [ordered two paragraphs of volume VIII to be struck out](https://doi.org/10.3989/revliteratura.2022.02.025).
