---
title: Montando mi homelab
summary: "Elegir piezas y configurar Proxmox para mi primer servidor casero."
---


## Introducción y motivación

En este post voy a repasar el proceso que seguí para montar un servidor en casa, y con suerte le servirá a cualquiera que quiera hacer algo parecido. Ten en cuenta que es la primera vez que monto un ordenador, y mis conocimientos son limitados.

Lo primero que tenía que tener claro era para qué lo iba a usar. Llevaba mucho tiempo dándole vueltas a la idea y había hecho alguna prueba con una Raspberry PI, pero esta vez quería algo de verdad.

Ahora mismo uso un [XMG Core 15](https://www.xmg.gg/en/xmg-core-15-amd-m20/) que compré cuando empecé la carrera y que todavía me hace buen servicio. Tengo un dual-boot con Windows y Ubuntu que me ha dado muchísimos dolores de cabeza a lo largo de los años, pero que ahora parece estable. No me puedo deshacer de Windows porque casi todo mi software de audio y vídeo no está disponible para Linux (Ableton, Touchdesigner...). 

Mi intención es usar el portátil exclusivamente con Windows y conectarme en remoto al servidor para todo lo relacionado con informática. Una de las razones principales para montar el sistema es mi TFG (registro de imágenes oftalmológicas usando Implicit Neural Representations), que me obliga a hacer un montón de entrenamientos para los que mi portátil no está preparado (mi GPU solo tiene 6Gb de VRAM), y todavía no me han dado acceso al centro de computación de la universidad.

El objetivo es montar un sistema que me permita experimentar, sobre todo con machine learning, pero también con otros servicios. Bastante pronto decidí usar [Proxmox](https://www.proxmox.com/en/) en lugar de un sistema operativo tradicional. Te permite gestionar VMs y contenedores fácilmente y conectarte por una interfaz web, así que parecía perfecto para lo que necesitaba. Además tengo amigos que lo usan en sus propios setups y me podían echar una mano cuando me atascase. Otro de los objetivos de este proyecto era familiarizarme más con servidores y entornos de virtualización, así que debería venir genial para aprender sobre NAS o servidores multimedia.

Otra de las cosas que me motivaron fue poder correr mis propios LLMs en local, sobre todo ahora que [el open source casi ha alcanzado al estado del arte](https://chat.lmsys.org/?leaderboard). He visto [muchos casos](https://www.reddit.com/r/LocalLLaMA/) de gente corriendo [Llama3 70b Instruct](https://llama.meta.com/llama3/) con dos 3090, y es la VRAM/euro más barata que pude encontrar. Sé que, en términos de dinero, probablemente me sale mejor alquilar un servidor en la nube para todo lo que necesito, pero prefiero [hacer self-hosting de todo lo que pueda](https://sive.rs/ti) y la experiencia que saco de esto no es poca cosa.

Al final de momento me hice solo con una GPU, pero planifiqué el equipo como si tuviera 2, para poder añadir otra más adelante. Elegí las 3090 porque todavía soportan NVLink, pero hace poco vi que [tinygrad](https://tinygrad.org/) sacó un parche para [añadir soporte P2P](https://github.com/tinygrad/open-gpu-kernel-modules) a las 4090, así que en retrospectiva habría montado un sistema con dos 4090 (aunque me hubiera llevado más tiempo).

Dicho esto, me gustaría mencionar algunos builds y recursos que encontré y que me ayudaron a decidir:

- [Sam's Rig Blog (Part 1 & 2)](https://samsja.github.io/blogs/rig/part_1/) - 2x3090, open-air.
- [IVA: Mini Deep Learning Rig](https://medium.com/@chankhavu/meet-iva-my-mini-deep-learning-rig-f5588588ca8a) - 2x3090, open-air.
- [Den's Deep Learning Rig](https://den.dev/blog/deep-learning-rig/) - 2x3090, con caja.
- [Explicación detallada en YouTube](https://youtu.be/OWvy-fCWTBQ) - 2x3090, con caja.
- [Deep Learning Hardware Guide (2018)](https://timdettmers.com/2018/12/16/deep-learning-hardware-guide/), [Consumer Hardware and GPUs (2023)](https://timdettmers.com/2023/01/30/which-gpu-for-deep-learning/) - El mejor recurso con diferencia, aunque algo desactualizado.
- [My Deep Learning Rig](https://nonint.com/2022/05/30/my-deep-learning-rig/) - 8x3090 !, open-air.
- [Dual RTX 4090 Workstation](https://github.com/eul94458/Memo/blob/main/dual_rtx4090workstation_for_machine_learning_202401.md) - 2x4090.

---

## Build

Aquí está mi  <a href="https://pcpartpicker.com/list/FYgDHG">lista de componentes en PCPartPicker:</a>
<table class="pcpp-part-list">
  <thead>
    <tr>
      <th>Tipo</th>
      <th>Componente</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="pcpp-part-list-type">CPU</td>
      <td class="pcpp-part-list-item"><a href="https://pcpartpicker.com/product/Qk2bt6/amd-ryzen-9-5950x-34-ghz-16-core-processor-100-100000059wof">AMD Ryzen 9 5950X 3.4 GHz 16-Core Processor</a></td>
    </tr>
    <tr>
      <td class="pcpp-part-list-type">Disipador de CPU</td>
      <td class="pcpp-part-list-item"><a href="https://pcpartpicker.com/product/R6kgXL/noctua-nh-d15s-chromaxblack-8251-cfm-cpu-cooler-nh-d15s-chromaxblack">Noctua NH-D15S chromax.black 82.51 CFM CPU Cooler</a></td>
    </tr>
    <tr>
      <td class="pcpp-part-list-type">Placa base</td>
      <td class="pcpp-part-list-item"><a href="https://pcpartpicker.com/product/CLkgXL/asus-rog-strix-x570-e-gaming-atx-am4-motherboard-rog-strix-x570-e-gaming">Asus ROG Strix X570-E Gaming ATX AM4 Motherboard</a></td>
    </tr>
    <tr>
      <td class="pcpp-part-list-type">Memoria</td>
      <td class="pcpp-part-list-item"><a href="https://pcpartpicker.com/product/Yg3mP6/corsair-vengeance-lpx-32-gb-2-x-16-gb-ddr4-3600-memory-cmk32gx4m2d3600c18">Corsair Vengeance LPX 32 GB (2 x 16 GB) DDR4-3600 CL18 Memory</a></td>
    </tr>
    <tr>
      <td class="pcpp-part-list-type">Almacenamiento</td>
      <td class="pcpp-part-list-item"><a href="https://pcpartpicker.com/product/DyhFf7/western-digital-black-sn850x-1-tb-m2-2280-pcie-40-x4-nvme-solid-state-drive-wds100t2x0e">Western Digital Black SN850X 1 TB M.2-2280 PCIe 4.0 X4 NVME Solid State Drive</a></td>
    </tr>
    <tr>
      <td class="pcpp-part-list-type">Almacenamiento</td>
      <td class="pcpp-part-list-item"><a href="https://pcpartpicker.com/product/MwW9TW/western-digital-internal-hard-drive-wd10ezex">Western Digital Caviar Blue 1 TB 3.5" 7200 RPM Internal Hard Drive</a></td>
    </tr>
    <tr>
      <td class="pcpp-part-list-type">Tarjeta gráfica</td>
      <td class="pcpp-part-list-item"><a href="https://pcpartpicker.com/product/C7bTwP/nvidia-geforce-rtx-3090-ti-24-gb-founders-edition-video-card-9001g1362505000">Asus TUF GeForce RTX 3090 24Gb</a></td>
    </tr>
    <tr>
	<td class="pcpp-part-list-type">Caja</td>
      <td class="pcpp-part-list-item"><a href="https://pcpartpicker.com/product/Ykytt6/lian-li-o11-dynamic-evo-atx-mid-tower-case-pc-o11dex">Lian Li O11 Dynamic EVO ATX Mid Tower Case</a></td>
    </tr>
    <tr>
      <td class="pcpp-part-list-type">Fuente de alimentación</td>
      <td class="pcpp-part-list-item"><a href="https://pcpartpicker.com/product/z6GnTW/evga-supernova-g-1300-w-80-gold-certified-fully-modular-atx-power-supply-220-gp-1300-x1">EVGA SuperNOVA 1300 G+ 1300 W 80+ Gold Certified Fully Modular ATX Power Supply</a></td>
    </tr>
  </tbody>
</table>


Salvo la caja, la fuente de alimentación y los discos, todo lo demás lo compré de segunda mano o reacondicionado. Ahora mismo no es un momento especialmente bueno para comprar componentes (se supone que pronto salen nuevas generaciones de CPUs y GPUs), pero gracias al boom y posterior hundimiento de las cripto, hay mucha gente vendiendo sus rigs de minería por piezas. Los rigs de minería se parecen a los que se montan para machine learning, ya que lo que más importa es el rendimiento de la GPU, y las tareas de cripto suelen ser más ligeras que gaming o renderizado. 

Por eso algunos de los builds de ejemplo son open-air: aparte de la estética, permite una refrigeración por aire y unas temperaturas mucho mejores, lo que se traduce en mejor rendimiento. La pega es que es mucho más vulnerable, ya sea al polvo o a cualquier otra cosa que pase alrededor. Otra opción era la refrigeración líquida (las 3090 se pueden calentar muchísimo según el modelo), pero como era mi primer build no quería complicarme y  me decidí por una caja de PC grande. Podría haber usado un rack, pero por lo visto ventilan un poco peor y son más caros, ruidosos y consumen más. Elegí la Lian Li O11 Evo después de investigar todas las opciones en las que cabían 2x3090.

El resto de componentes los elegí sobre todo en función de lo que encontraba en el mercado de segunda mano. Cogí el AMD Ryzen 9 5950X aunque use el socket AM4, más antiguo, porque tiene 16 núcleos y de todas formas no voy a necesitar mucha potencia de CPU. Tenía pocas opciones de placa base, porque necesitaba una separación de 4 slots entre dos ranuras PCIe x16 (para que entren las dos 3090) y que funcionase como mínimo en modo x8/x8 (por lo que he visto no hace falta más para evitar cuellos de botella)[^1]. Al final me quedé con la Asus X570-E, que funciona pero resulta ser un poco pequeña para que haya buen flujo de aire entre dos tarjetas gráficas. Tengo pensado añadir la segunda tarjeta con un riser PCIe y un soporte vertical en la caja para evitar ese problema.

Como este setup va a generar bastante calor cuando tenga la segunda tarjeta, tengo pensado limitar su consumo, y por eso no fui a por una fuente más grande. Cuando lo haga, quiero hacer una prueba para ver si me compensa comprar un conector NVLink, ya que según la tarea puede que no mejore el rendimiento de forma significativa. Sorprendentemente el ordenador encendió a la primera (pensaba que tendría que esperar a que llegase la GPU, porque mi CPU no tiene gráficos integrados), pero enseguida empecé a toparme con algunos problemas.

![el build en todo su esplendor parcial](https://i.imgur.com/1VUaPOP.jpeg)

Tiene algo de RGB en la placa base y la RAM que todavía no consigo apagar. Después ordené los cables y sigo esperando a unos ventiladores que quiero añadir.

---

## Setup

Conseguí instalar proxnox después de resolver algunos conflictos en la configuración de la BIOS y usar el argumento 'nomodeset' (para que el kernel no inicialice los drivers de vídeo), y enseguida tuve algunas máquinas funcionando. Los problemas empezaron al configurar el PCIe passthrough para usar la GPU directamente desde la máquina virtual, y después de bastante tiempo conseguí que más o menos funcionase.

Después monté una VPN para conectarme al servidor desde cualquier sitio sin tener que exponerlo a internet. Aquí también me encontré con bastantes problemas, porque mi router está detrás de un switch y del router principal de casa, o sea, en la práctica bajo un [doble NAT](https://kb.netgear.com/30186/What-is-double-NAT-and-why-is-it-bad). Además, mi ISP no permite IPs estáticas con la tarifa que tenemos, así que pensé en usar un DDNS para solucionarlo. Después de abrir algunos puertos en los dos routers y un poco de troubleshooting, también conseguí que funcionase con mi servidor OpenVPN corriendo en un contenedor de proxmox. Sin embargo, este setup era bastante enrevesado y empezó a dar problemas en cuanto puse a funcionar un NAS (un contenedor de TrueNas) y empecé a toquetear el firewall.

Después de investigar y pensarlo un poco, acabé rindiéndome a las circunstancias y decidí abandonar proxmox (por ahora) e instalar Ubuntu Server. La razón principal del cambio fue que, aunque la experiencia me sirvió, no quiero pasarme tanto tiempo configurando y organizando la red y los dispositivos de casa; lo que quiero sobre todo es que funcionen y poder invertir mi tiempo en las cosas que de verdad me importan, como la visión por computador, la música o escribir este blog. No me arrepiento de haberlo hecho y sospecho que si no hubiera tenido claras mis prioridades en ese momento me podría haber obsesionado y haber tirado todo el verano en este proyecto. Además, siempre puedo volver a ello cuando me vuelva a interesar, así que tampoco es una gran pérdida.

Ubuntu Server fue mucho más fácil de configurar desde el principio. Me planteé un momento usar Debian como distro, ya que tenía algo de experiencia gracias a [una asignatura que cursé en 3º](https://github.com/alvaro-freire/LSI), pero entonces empecé a acordarme de todos los sufrimientos aleatorios que pasé en esa asignatura (configurar firewalls a mano, servidores apache y recolección de logs, entre muchas otras cosas). 

Me salté todos mis problemas con la VPN usando [Tailscale](https://tailscale.com/)(también probé [ZeroTier](https://www.zerotier.com/) pero me pareció algo más engorroso) y enseguida creé una instancia de [Nextcloud](https://nextcloud.com/) para usarla como NAS. Normalmente uso [vscode server](https://code.visualstudio.com/docs/remote/vscode-server) o ssh para conectarme a la máquina, pero también tengo acceso físico por si hace falta. Tengo pensado usar un [cloudflare tunel](https://www.cloudflare.com/products/tunnel/) cuando necesite abrir algún servicio a internet.

También probé tanto [Netdata](https://www.netdata.cloud/) como Graphana+Prometheus para toda la monitorización, pero acabé quedándome con lo segundo, porque me resultó mucho más fácil de personalizar y fue mucho más sencillo sacar [métricas de la gpu](https://github.com/utkuozdemir/nvidia_gpu_exporter/tree/master). Aparte de eso, poco a poco estoy migrando ahí todo lo que necesito para poder formatear el portátil. Antes lo hacía con regularidad (al menos una vez al año) porque sentía que me ayudaba a reorganizar mi vida (normalmente a finales de verano), pero dejé de hacerlo hace un par de años por la uni y por miedo a perder alguna configuración rara que no tenía claro si iba a poder replicar.

Otras cosas con las que empecé a trastear fueron [AUTO1111](https://github.com/AUTOMATIC1111/stable-diffusion-webui) y [ComfyUI](https://github.com/comfyanonymous/ComfyUI). Con el primero tengo experiencia y tenía muchas ganas de probar el segundo, y de momento estoy disfrutando mucho de no tener que estresarme por el tiempo que le queda a mi instancia en la nube. También empecé a usar [Ollama](https://ollama.com/) para montar un chatbot RAG con documentos locales. Fue fácil tener algo funcionando gracias a la cantidad de ejemplos que hay, pero aún me queda trabajo para adaptarlo a lo que necesito; puede que acabe escribiendo un post sobre eso si sale bien.


![Dashboards de Grafana y AUTO1111](https://i.imgur.com/oQ12n4c.png)

Tengo pensado actualizar este post cuando tenga la segunda GPU; hasta entonces, cualquier comentario o sugerencia es siempre bienvenido en mateoamadoares@gmail.com

---

[^1]: Normalmente esto no aparece en las páginas de producto, así que un buen truco para encontrar placas así es ordenar por soporte de Nvidia-SLI.

