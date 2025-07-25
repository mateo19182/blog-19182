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

    // JavaScript for the coin game. This will be injected into the page.
    const gameScript = `
      document.addEventListener('DOMContentLoaded', () => {
        // Ensure the game elements exist before adding listeners
        const flipButton = document.getElementById('flip-coin-button');
        if (!flipButton) return; // If the game isn't on the page (e.g. mobile), do nothing

        const coinResult = document.getElementById('coin-result');
        const headsCountEl = document.getElementById('heads-count');
        const tailsCountEl = document.getElementById('tails-count');
        const guessHeadsButton = document.getElementById('guess-heads');
        const guessTailsButton = document.getElementById('guess-tails');
        const gameAnswerEl = document.getElementById('game-answer');
        const resetButton = document.getElementById('reset-game-button');

        let headsCount = 0;
        let tailsCount = 0;
        let isGameOver = false;

        // Randomly determine the bias when the game loads.
        const bias = Math.random() < 0.5 ? 'Heads' : 'Tails';
        const BIAS_PROBABILITY = 0.6; // 70% chance of landing on the biased side

        function flipCoin() {
          if (isGameOver) return;

          let result;
          const random = Math.random();

          if (bias === 'Heads') {
            result = random < BIAS_PROBABILITY ? 'Heads' : 'Tails';
          } else {
            result = random < BIAS_PROBABILITY ? 'Tails' : 'Heads';
          }

          coinResult.textContent = \`Landed on: \${result}\`;

          if (result === 'Heads') {
            headsCount++;
            headsCountEl.textContent = headsCount;
          } else {
            tailsCount++;
            tailsCountEl.textContent = tailsCount;
          }
        }

        function makeGuess(guess) {
          if (isGameOver) return;
          isGameOver = true;
          flipButton.disabled = true;
          guessHeadsButton.disabled = true;
          guessTailsButton.disabled = true;

          if (guess === bias) {
            gameAnswerEl.textContent = \`Correct! Biased towards \${bias}.\`;
            gameAnswerEl.style.color = 'var(--tertiary)';
          } else {
            gameAnswerEl.textContent = \`Wrong! It was biased towards \${bias}.\`;
            gameAnswerEl.style.color = 'var(--secondary)';
          }
          resetButton.style.display = 'inline-block';
        }
        
        function resetGame() {
            headsCount = 0;
            tailsCount = 0;
            isGameOver = false;
            headsCountEl.textContent = '0';
            tailsCountEl.textContent = '0';
            coinResult.textContent = 'Flip to start!';
            gameAnswerEl.textContent = '';
            flipButton.disabled = false;
            guessHeadsButton.disabled = false;
            guessTailsButton.disabled = false;
            resetButton.style.display = 'none';
        }

        flipButton.addEventListener('click', flipCoin);
        guessHeadsButton.addEventListener('click', () => makeGuess('Heads'));
        guessTailsButton.addEventListener('click', () => makeGuess('Tails'));
        resetButton.addEventListener('click', resetGame);
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
                <summary style="cursor: pointer;">Play a Game</summary>
                <div id="coin-game" style="margin-top: 0.5rem; padding: 0.5rem 1rem; border: 1px solid var(--gray); border-radius: 8px;">
                  <p style="margin: 0.5rem 0;">Guess the coin's 60% bias in the least amount of guesses</p>
                  <button id="flip-coin-button">Flip</button>
                  <p id="coin-result" style="font-weight: bold; min-height: 1.5em; display: inline-block; margin-left: 1rem;">Flip to start!</p>
                  <div>
                    <span>H: <span id="heads-count">0</span></span> | 
                    <span>T: <span id="tails-count">0</span></span>
                  </div>
                  <div style="margin-top: 0.5rem;">
                    <p style="margin-bottom: 0.5rem;">Guess:</p>
                    <button id="guess-heads">Heads</button>
                    <button id="guess-tails">Tails</button>
                    <button id="reset-game-button" style="display: none; margin-left: 10px;">Reset</button>
                  </div>
                  <p id="game-answer" style="margin-top: 0.5rem; font-weight: bold;"></p>
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

  // Add styles for the new footer layout
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