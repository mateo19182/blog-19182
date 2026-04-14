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
        let frameCounter = 0;

        // --- Win Animation State ---
        let isWinAnimationPlaying = false;
        let winAnimationPath = [];
        let winAnimationStep = 0;
        let winSquarePos = { x: 0, y: 0 };
        
        // Pixel pattern for "gj". Coordinates are pre-calculated for the canvas size.
        const gjPattern = [
          // Letter 'g'
          {x: 9, y: 12}, {x: 10, y: 12}, {x: 11, y: 12},
          {x: 8, y: 13}, 
          {x: 8, y: 14}, {x: 11, y: 14},
          {x: 8, y: 15}, {x: 11, y: 15},
          {x: 9, y: 16}, {x: 10, y: 16}, {x: 11, y: 16},

          // Letter 'j'
          {x: 20, y: 12},
          {x: 20, y: 13},
          {x: 20, y: 14},
          {x: 20, y: 15},

          {x: 18, y: 16}, {x: 18, y: 17},
          {x: 19, y: 17}
        ];

        function startWinAnimation() {
            isWinAnimationPlaying = true;
            winAnimationStep = 0;
            frameCounter = 0;
            grid = createGrid(); // Clear the grid for the animation
            winAnimationPath = gjPattern;
            if (winAnimationPath.length > 0) {
              winSquarePos = { x: winAnimationPath[0].x, y: winAnimationPath[0].y };
            }
        }

        function getMousePos(evt) {
            const rect = sandCanvas.getBoundingClientRect();
            return {
                x: Math.floor((evt.clientX - rect.left) / resolution),
                y: Math.floor((evt.clientY - rect.top) / resolution),
            };
        }

        function addSand(e) {
            if (isWinAnimationPlaying) return;
            const mousePos = getMousePos(e);
            if (mousePos.x >= 0 && mousePos.x < cols && mousePos.y >= 0 && mousePos.y < rows) {
                grid[mousePos.x][mousePos.y] = 1;
            }
        }

        sandCanvas.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            addSand(e);
        });

        sandCanvas.addEventListener('mousemove', (e) => {
            if (isMouseDown) {
                addSand(e);
            }
        });

        window.addEventListener('mouseup', () => { isMouseDown = false; });
        
        resetButton.addEventListener('click', () => {
            grid = createGrid();
            isWinAnimationPlaying = false;
            winAnimationStep = 0;
            frameCounter = 0;
        });

        function isGridFull() {
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    if (grid[i][j] === 0) {
                        return false;
                    }
                }
            }
            return true;
        }

        function update() {
            if (isWinAnimationPlaying) {
                frameCounter++;
                // Update animation every 4 frames to make it visible
                if (frameCounter % 32 === 0 && winAnimationStep < winAnimationPath.length) {
                    const pos = winAnimationPath[winAnimationStep];
                    if (pos && grid[pos.x] && grid[pos.x][pos.y] !== undefined) {
                        winSquarePos = { x: pos.x, y: pos.y };
                        grid[pos.x][pos.y] = 2; // Leave a trail
                        winAnimationStep++;
                    }
                }
            } else {
                if (isGridFull()) {
                    startWinAnimation();
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
            // Black background for both game and animation
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, sandCanvas.width, sandCanvas.height);

            // Draw the grid content (sand and "gj" trail)
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    if (grid[i][j] === 1) { // Sand
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(i * resolution, j * resolution, resolution, resolution);
                    } else if (grid[i][j] === 2) { // "gj" trail
                        ctx.fillStyle = '#ffffffff'; // Lime green
                        ctx.fillRect(i * resolution, j * resolution, resolution, resolution);
                    }
                }
            }
            
            // Draw the moving square during the win animation
            if (isWinAnimationPlaying && winAnimationStep < winAnimationPath.length) {
                ctx.fillStyle = '#ffffffff'; // 
                ctx.fillRect(winSquarePos.x * resolution, winSquarePos.y * resolution, resolution, resolution);
            }
        }

        update();
    });
    `

    return (
      <footer class={`${displayClass ?? ""}`}>
        <div class="footer-container">
          <p>
            <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0</a> ·{" "}
            {i18n(cfg.locale).components.footer.createdWith}{" "}
            <a href="https://quartz.jzhao.xyz/">Quartz v{version}</a> © {year}
          </p>

          <div class="desktop-only">
            <details>
              <summary style="cursor: pointer;"></summary>
              <div
                id="sand-garden-container"
                style="margin-top: 0.5rem; padding: 0.5rem; border: 1px solid var(--gray); border-radius: 8px; background-color: #111;"
              >
                <canvas
                  id="sand-canvas"
                  width="200"
                  height="150"
                  style="cursor: crosshair; width: 200px; height: 150px;"
                ></canvas>
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
