---

---
#Writing 
---
## Introduction and Motivation

This post will detail my process for building a homer server, and hopefully help anyone looking to do something similar. Be aware this is my first build ever, and my knowledge is limited.

The first thing I needed to figure out was what I was going to use it for. I had been playing with the idea for a long time and had done some explorations with a raspberry PI, but I wanted this to be the real thing.

I have an [XMG Core 15](https://www.xmg.gg/en/xmg-core-15-amd-m20/) that I got when I started college and still serves me well. I use a dual-boot configuration with Windows and Ubuntu that has given me lots of headaches over the years but now seems to be stable. I can't really get rid of windows since most of my audio and video software is not available for Linux (Ableton, Touchdesigner...). 

My intention is to use the laptop exclusively on windows and remote into my server for any computer science related work. One of the main reasons to build the system is my thesis (TFG) (Ophthalmological image registration using Implicit Neural Representations), which requires me to do a bunch of training that my laptop isn't really suited for (my GPU only has 6Gb of VRAM). Annoyingly, I haven't been given access to the college compute center.

The objective is to build a system that will allow me to experiment, mainly around machine learning, but also with some other services. I settled pretty early on using [Proxmox](https://www.proxmox.com/en/) instead of a traditional operating system. It allows you to manage VMs and containers easily and connect via a web interface, so it seemed perfect for my needs. I also have friends that use it in their personal setups and could help me when I got stuck. Another of the objectives of this build was to familiarize myself more with servers and virtualization environments, so I also plan to build a NAS and host my own [Jellyfinn](https://jellyfin.org/) and [Home-Assistant](https://www.home-assistant.io/) instances.

Another of the things that motivated this project was being able to run my own LLMs locally, particularly now that [open source has almost catched up to the state of the art](https://chat.lmsys.org/?leaderboard). I have seen [many accounts](https://www.reddit.com/r/LocalLLaMA/) of people running [Llama3 70b Instruct](https://llama.meta.com/llama3/) on a dual 3090 setup and it´s the cheapest VRAM/euro that I could find. I know that in terms of money it's probably better to rent a cloud server for all my needs, but I prefer to [self-host everything that I can](https://sive.rs/ti) and the experience gained from this is non-trivial.

I ended up getting just one GPU for the time being but planning my rig as if I had 2, so I can add another one later on. I chose the 3090s since they still support NVLink, but recently found that [tinygrad](https://tinygrad.org/) released a patch to [add P2P support](https://github.com/tinygrad/open-gpu-kernel-modules) to 4090s, so in retrospective I would have chosen to build a dual 4090 system (even thought it would have taken more time).

With that said, I would like to mention some builds and resources I found that helped inform my choices:

With that said, I would like to mention some builds and resources I found that helped inform my choices:

- [Sam's Rig Blog (Part 1 & 2)](https://samsja.github.io/blogs/rig/part_1/) - 2x3090, open-air.
- [IVA: Mini Deep Learning Rig](https://medium.com/@chankhavu/meet-iva-my-mini-deep-learning-rig-f5588588ca8a) - 2x3090, open-air.
- [Den's Deep Learning Rig](https://den.dev/blog/deep-learning-rig/) - 2x3090, case.
- [Detailed Explanation on YouTube](https://youtu.be/OWvy-fCWTBQ) - 2x3090, case.
- [Deep Learning Hardware Guide (2018)](https://timdettmers.com/2018/12/16/deep-learning-hardware-guide/), [Consumer Hardware and GPUs (2023)](https://timdettmers.com/2023/01/30/which-gpu-for-deep-learning/) - Best resource by far, slightly out of date.
- [My Deep Learning Rig](https://nonint.com/2022/05/30/my-deep-learning-rig/) - 8x3090 !, open-air.
- [Dual RTX 4090 Workstation](https://github.com/eul94458/Memo/blob/main/dual_rtx4090workstation_for_machine_learning_202401.md) - 2x4090.

---

## Build

Here is my  <a href="https://pcpartpicker.com/list/FYgDHG">PCPartPicker Part List:</a>
<table class="pcpp-part-list">
  <thead>
    <tr>
      <th>Type</th>
      <th>Item</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="pcpp-part-list-type">CPU</td>
      <td class="pcpp-part-list-item"><a href="https://pcpartpicker.com/product/Qk2bt6/amd-ryzen-9-5950x-34-ghz-16-core-processor-100-100000059wof">AMD Ryzen 9 5950X 3.4 GHz 16-Core Processor</a></td>
    </tr>
    <tr>
      <td class="pcpp-part-list-type">CPU Cooler</td>
      <td class="pcpp-part-list-item"><a href="https://pcpartpicker.com/product/R6kgXL/noctua-nh-d15s-chromaxblack-8251-cfm-cpu-cooler-nh-d15s-chromaxblack">Noctua NH-D15S chromax.black 82.51 CFM CPU Cooler</a></td>
    </tr>
    <tr>
      <td class="pcpp-part-list-type">Motherboard</td>
      <td class="pcpp-part-list-item"><a href="https://pcpartpicker.com/product/CLkgXL/asus-rog-strix-x570-e-gaming-atx-am4-motherboard-rog-strix-x570-e-gaming">Asus ROG Strix X570-E Gaming ATX AM4 Motherboard</a></td>
    </tr>
    <tr>
      <td class="pcpp-part-list-type">Memory</td>
      <td class="pcpp-part-list-item"><a href="https://pcpartpicker.com/product/Yg3mP6/corsair-vengeance-lpx-32-gb-2-x-16-gb-ddr4-3600-memory-cmk32gx4m2d3600c18">Corsair Vengeance LPX 32 GB (2 x 16 GB) DDR4-3600 CL18 Memory</a></td>
    </tr>
    <tr>
      <td class="pcpp-part-list-type">Storage</td>
      <td class="pcpp-part-list-item"><a href="https://pcpartpicker.com/product/DyhFf7/western-digital-black-sn850x-1-tb-m2-2280-pcie-40-x4-nvme-solid-state-drive-wds100t2x0e">Western Digital Black SN850X 1 TB M.2-2280 PCIe 4.0 X4 NVME Solid State Drive</a></td>
    </tr>
    <tr>
      <td class="pcpp-part-list-type">Storage</td>
      <td class="pcpp-part-list-item"><a href="https://pcpartpicker.com/product/MwW9TW/western-digital-internal-hard-drive-wd10ezex">Western Digital Caviar Blue 1 TB 3.5" 7200 RPM Internal Hard Drive</a></td>
    </tr>
    <tr>
      <td class="pcpp-part-list-type">Video Card</td>
      <td class="pcpp-part-list-item"><a href="https://pcpartpicker.com/product/C7bTwP/nvidia-geforce-rtx-3090-ti-24-gb-founders-edition-video-card-9001g1362505000">NVIDIA Founders Edition GeForce RTX 3090 Ti 24 GB Video Card</a></td>
    </tr>
    <tr>
	<td class="pcpp-part-list-type">Case</td>
      <td class="pcpp-part-list-item"><a href="https://pcpartpicker.com/product/Ykytt6/lian-li-o11-dynamic-evo-atx-mid-tower-case-pc-o11dex">Lian Li O11 Dynamic EVO ATX Mid Tower Case</a></td>
    </tr>
    <tr>
      <td class="pcpp-part-list-type">Power Supply</td>
      <td class="pcpp-part-list-item"><a href="https://pcpartpicker.com/product/z6GnTW/evga-supernova-g-1300-w-80-gold-certified-fully-modular-atx-power-supply-220-gp-1300-x1">EVGA SuperNOVA 1300 G+ 1300 W 80+ Gold Certified Fully Modular ATX Power Supply</a></td>
    </tr>
  </tbody>
</table>


Except the case, the power supply and the storage drives, everything else was bought second hand or refurbished. Right now is not a particularly good time to buy computer parts (as new generations for CPUs and GPUs are supposed to be coming soon), but thanks to the crypto boom and bust, there is a lot of people selling their mining rigs for parts. Mining rigs are really similar to rig built for machine leaning, since they mostly care about GPU performance, and crypto tasks are typically lighter than gaming or rendering.

That's why some of the example builds are open-air, apart from the aesthetics, it allows for much better air-cooling and temperatures, leading to better performance. The catch is that it's much more vulnerable, either to dust or anything else happening around it. Another option was to use a water-cooled solution (3090s can get really hot depending on the model), but since this was my first build so I didn't want to push it. I don't really want to take any chances so I opted for a big PC case. I could have used a server case, but apparently they handle air ventilation a bit worse and are not really built to house consumer hardware. I chose the Lian Li O11 Evo after researching all the options that could fit 2x3090s.

The rest of the components were chosen based mostly on what I found on the second hand market. I picked the AMD Ryzen 9 5950X even thought it uses the older AM4 socket since it has 16 cores and I won't be needing a lot of CPU power anyway. I had limited choices for a motherboard since it needed to have 4-slot spacing between two PCIe x16 slots (in order for the two 3090s to fit) and operate at least in x8/x8 mode (from what I've seen you don't need more than that to avoid bottlenecks)[^1]. I ended up settling for the Asus X570-E, which works but turns out to be a bit too small to allow for good airflow between two graphic cards. I plan to add the second card using a PCIe riser and a vertical mount in the case to avoid that problem.

Because this setup will be pretty thermally intensive when I get the second card, I am planning on capping their power consumption, that's why I didn't go with a bigger power supply. Once I do that, I'm planning on running test to see whether it's worth it for me to get a NVLink connector, as depending on the task it might not improve my performance any significant amount. Surprisingly the computer turned on my first attempt (thought I had to wait until my GPU arrived since my CPU doesn't have integrated graphics), but quickly started to bump into some problems.

## Setup

I was able to set up proxnox after solving some conflicts in the BIOS configuration and using the 'nomodeset' argument (in order for the kernel to not initialize the video drivers), and quickly got some machines up and running. I started running into problems when configuring the PCIe passthrough to use the GPU directly from the virtual machine, and after quite some time managed to get it kind of working.

After that I set up a VPN to connect to my server from anywhere without having to expose it to the internet. Here I also run to quite a few problems since my router is behind a switch and the main home router, effectively under a [double NAT](https://kb.netgear.com/30186/What-is-double-NAT-and-why-is-it-bad). Also my ISP doesn't allow for static ip addresses in our current plan, so I planned to use a DDNS to work around that. After configuring some port forwards both routers and some troubleshooting, I also got that working with my OpenVPN server running on a proxmox container. However this setup was quite convoluted, and started running into problems once I started running a NAS (TrueNas container) and started messing with the firewall.

After some research and deliberation, I ended up surrendering to the circumstances and decided to abandon proxmox (for now) and install Ubuntu Server. The main reason behind the change was that, while a helpful experience, I don't really want to spend too much time on setting up and arranging my home network and devices, I mostly want them to work and be able to invest my time in the things I really care about, like computer vision, music or writing this blog. I don't regret doing this and I suspect that if I hand't set my priorities straight at that point I could have been gone off the deep end and wasted all my summer on this project. Also I can always come back to it whenever I'm interested again so it's not that big of a loss.

Ubuntu Server was much more easy to setup from the begging, I briefly pondered on using Debian as my distro, as I had some experience thanks to [a subject I took on my 3rd year](https://github.com/alvaro-freire/LSI), but then started remembering all the random pains that I suffered during that course (manually setting up firewalls, apache serversa and log collection among many other things). 

Skipped all my VPN problems by using [Tailscale](https://tailscale.com/)(I also tried [ZeroTier](https://www.zerotier.com/)but found it a bit more cumbersome) and quickly created a [Nextcloud](https://nextcloud.com/) instance to satisfy my NAS needs. Typically I use [vscode server](https://code.visualstudio.com/docs/remote/vscode-server) or ssh to connect to the machine but I also have physical access in case it's needed. I plan on using a [cloudflare tunel](https://www.cloudflare.com/products/tunnel/) whenever I need to open a service to the internet.  I also got [Netdata](https://www.netdata.cloud/) working for all my monitoring. Other than that, I'm slowly migrating everything that I need there so I can format my laptop. I used to do that regularly (at least once a year) since I felt like it helped me reorganize my life (usually at the end of summer), but stopped doing it a couple years ago because of uni and fear of losing some weird configurations that I wasn't sure I would be able to replicate.

I plan on updating this post when I get the second GPU, until then, any comments or suggestions are always welcomed at mateoamadoares@gmail.com

---

[^1]: Usually this is not displayed on product pages, so a good trick to find motherboards like this is to sort by Nvidia-SLI support.

