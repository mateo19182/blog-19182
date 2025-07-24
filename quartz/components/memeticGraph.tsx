// quartz/components/MemeticNetworkViz.tsx
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

// Configuration options for the component
interface Options {
  width?: string
  height?: string
  showControls?: boolean
}

const defaultOptions: Options = {
  width: "100%", 
  height: "600px",
  showControls: true
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  function MemeticNetworkViz({ fileData, cfg }: QuartzComponentProps) {
    return (
      <div class="memetic-network-container">
        <iframe 
          src="https://your-domain.com/memetic-network-viz/" 
          width={opts.width}
          height={opts.height}
          frameborder="0"
          style="border: 1px solid #e5e7eb; border-radius: 8px;"
          title="Interactive Memetic Network Visualization"
        />
        <p class="visualization-caption">
          Interactive memetic network showing anonymous nodes with friction indices and idea connections.
          Click and drag to explore the network structure.
        </p>
      </div>
    )
  }

  MemeticNetworkViz.css = `
    .memetic-network-container {
      margin: 2rem 0;
      width: 100%;
    }

    .memetic-network-container iframe {
      display: block;
      margin: 0 auto;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .visualization-caption {
      margin-top: 1rem;
      font-size: 0.9em;
      color: var(--gray);
      text-align: center;
      font-style: italic;
    }
  `

  return MemeticNetworkViz
}) satisfies QuartzComponentConstructor