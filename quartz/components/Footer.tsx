import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []

    // JavaScript for the Sand Garden Automata.
    const gameScript = `
      document.addEventListener('DOMContentLoaded', () => {
        const sandCanvas = document.getElementById('sand-canvas');
        if (!sandCanvas) return; // Exit if canvas not found

        const ctx = sandCanvas.getContext('2d');
        const resetButton = document.getElementById('sand-reset-button');
        
        ctx.imageSmoothingEnabled = false;

        const resolution = 5;
        const cols = sandCanvas.width / resolution;
        const rows = sandCanvas.height / resolution;

        let grid;
        function createGrid() {
            return new Array(cols).fill(null).map(() => new Array(rows).fill(0));
        }
        grid = createGrid();

        let isMouseDown = false;
        let isSansPlaying = false;
        let sansFrame = 0;
        let frameCounter = 0;

        // Compressed data for a short "Sans" animation loop (40x30)
        const sansData = [
            // Frame 1: Neutral
            ["0000000000000000000000000000000000000000", "0000000000001111111111111111000000000000", "0000000000111111111111111111110000000000", "0000000001111111111111111111111000000000", "0000000011111111111111111111111100000000", "0000000111111111111111111111111110000000", "0000001111111111111111111111111111000000", "0000011111111111111111111111111111100000", "0000111111111111111111111111111111110000", "0000111111111111111111111111111111110000", "0001111111111111111111111111111111111000", "0001111111110011111111110011111111111000", "0001111111100001111111100001111111111000", "0001111111100001111111100001111111111000", "0001111111110011111111110011111111111000", "0001111111111111111111111111111111111000", "0000111111111111111111111111111111110000", "0000111111111111111111111111111111110000", "0000011111111111111111111111111111100000", "0000001111111111111111111111111111000000", "0000000111111111111111111111111110000000", "0000000011111111111111111111111100000000", "0000000001111111111111111111111000000000", "0000000000011111111111111111110000000000", "0000000000000111111111111111000000000000", "000000000000000111111111110000000000000", "0000000000000000011111111000000000000000", "0000000000000000000111110000000000000000", "0000000000000000000001100000000000000000", "0000000000000000000000000000000000000000"],
            // Frame 2: Eye Flash
            ["0000000000000000000000000000000000000000", "0000000000001111111111111111000000000000", "0000000000111111111111111111110000000000", "0000000001111111111111111111111000000000", "0000000011111111111111111111111100000000", "0000000111111111111111111111111110000000", "0000001111111111111111111111111111000000", "0000011111111111111111111111111111100000", "0000111111111111111111111111111111110000", "0000111111111111111111111111111111110000", "0001111111111111111111111111111111111000", "0001111111110011111111110011111111111000", "0001111111101101111111100001111111111000", "0001111111101101111111100001111111111000", "0001111111110111111111110011111111111000", "0001111111111111111111111111111111111000", "0000111111111111111111111111111111110000", "0000111111111111111111111111111111110000", "0000011111111111111111111111111111100000", "0000001111111111111111111111111111000000", "0000000111111111111111111111111110000000", "0000000011111111111111111111111100000000", "0000000001111111111111111111111000000000", "0000000000011111111111111111110000000000", "0000000000000111111111111111000000000000", "000000000000000111111111110000000000000", "0000000000000000011111111000000000000000", "0000000000000000000111110000000000000000", "0000000000000000000001100000000000000000", "0000000000000000000000000000000000000000"],
        ];

        function getMousePos(evt) {
            const rect = sandCanvas.getBoundingClientRect();
            return {
                x: Math.floor((evt.clientX - rect.left) / resolution),
                y: Math.floor((evt.clientY - rect.top) / resolution),
            };
        }

        function addSand(e) {
            if (isSansPlaying) return;
            const mousePos = getMousePos(e);
            if (mousePos.x >= 0 && mousePos.x < cols && mousePos.y >= 0 && mousePos.y < rows) {
                grid[mousePos.x][mousePos.y] = 1;
            }
        }

        sandCanvas.addEventListener('mousedown', (e) => {
            if (isSansPlaying) return;
            isMouseDown = true;
            addSand(e);
        });

        sandCanvas.addEventListener('mousemove', (e) => {
            if (isMouseDown && !isSansPlaying) {
                addSand(e);
            }
        });

        window.addEventListener('mouseup', () => { isMouseDown = false; });
        
        resetButton.addEventListener('click', () => {
            grid = createGrid();
            isSansPlaying = false;
            sansFrame = 0;
            frameCounter = 0;
        });

        function isGridFull() {
          for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
              if (grid[i][j] === 0) {
                return false; // Found an empty cell
              }
            }
          }
          return true; // All cells are full
        }

        function update() {
          if (isSansPlaying) {
            // Slow down the animation
            frameCounter++;
            if (frameCounter % 15 === 0) { // A bit faster for the wink
              sansFrame = (sansFrame + 1) % sansData.length;
            }
          } else {
            if (isGridFull()) {
              isSansPlaying = true;
            } else {
              const nextGrid = createGrid();
              for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                  if (grid[i][j] === 0) continue;
                  const belowY = j + 1;
                  if (belowY >= rows) { nextGrid[i][j] = 1; continue; }
                  if (grid[i][belowY] === 0) { nextGrid[i][belowY] = 1; continue; }
                  const dir = Math.random() < 0.5 ? 1 : -1;
                  const newColA = i + dir;
                  const newColB = i - dir;
                  if (newColA >= 0 && newColA < cols && grid[newColA][belowY] === 0) {
                    nextGrid[newColA][belowY] = 1;
                  } else if (newColB >= 0 && newColB < cols && grid[newColB][belowY] === 0) {
                    nextGrid[newColB][belowY] = 1;
                  } else {
                    nextGrid[i][j] = 1;
                  }
                }
              }
              grid = nextGrid;
            }
          }
          draw();
          requestAnimationFrame(update);
        }

        function draw() {
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, sandCanvas.width, sandCanvas.height);
          
          if(isSansPlaying) {
            const frameData = sansData[sansFrame];
            for (let j = 0; j < frameData.length; j++) {
              const row = frameData[j];
              for (let i = 0; i < row.length; i++) {
                const isPixelOn = row[i] === '1';
                // For Sans, we need black and blue pixels on a white background
                if (frameData === sansData[1] && j >= 12 && j <= 14 && i >= 11 && i <= 13) {
                    ctx.fillStyle = isPixelOn ? '#00FFFF' : '#FFF'; // Glowing eye
                } else {
                    ctx.fillStyle = isPixelOn ? '#000' : '#FFF'; // Standard pixels
                }
                // Only draw the lit pixels
                if (isPixelOn) {
                    ctx.fillRect(i * resolution, j * resolution, resolution, resolution);
                }
              }
            }
          } else {
            for (let i = 0; i < cols; i++) {
              for (let j = 0; j < rows; j++) {
                if (grid[i][j] === 1) {
                  ctx.fillStyle = '#ffffffff'; 
                  ctx.fillRect(i * resolution, j * resolution, resolution, resolution);
                }
              }
            }
          }
        }

        update();
      });
    `;

    return (
      <footer class={`${displayClass ?? ""}`}>
        <div class="footer-container">
          <p>
            {i18n(cfg.locale).components.footer.createdWith}{" "}
            <a href="https://quartz.jzhao.xyz/">Quartz v{version}</a> © {year}
          </p>

          <div class="desktop-only">
             <details>
                <summary style="cursor: pointer;"></summary>
                <div id="sand-garden-container" style="margin-top: 0.5rem; padding: 0.5rem; border: 1px solid var(--gray); border-radius: 8px; background-color: #111;">
                  <canvas id="sand-canvas" width="200" height="150" style="cursor: crosshair; width: 200px; height: 150px;"></canvas>
                  <div style="text-align: center; margin-top: 0.5rem;">
                     <button id="sand-reset-button">Clear</button>
                  </div>
                </div>
              </details>
          </div>
        </div>
        <ul>
          {Object.entries(links).map(([text, link]) => (
            <li>
              <a href={link}>{text}</a>
            </li>
          ))}
        </ul>
        {/* This script tag injects the game logic into the final HTML page */}
        <script dangerouslySetInnerHTML={{ __html: gameScript }}></script>
      </footer>
    )
  }

  Footer.css = `
    ${style}
    .footer-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
  `
  return Footer
}) satisfies QuartzComponentConstructor