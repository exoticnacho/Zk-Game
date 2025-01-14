import init, { GameWrapper } from "../../out/game_wasm.js";
import { submitProof } from "./proofs";
import { Action, ProofData } from "./types";
import { verifyProof } from "./wagmi-config";

export default async function startGame() {
  await init();

  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  if (!canvas) {
    console.error("Canvas not found");
    return;
  } else {
    let game = new GameWrapper(canvas);
    let currentControl = "None";
    let gameStarted = false;

    // Handle keyboard inputs
    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        currentControl = "Left";
      } else if (event.key === "ArrowRight") {
        currentControl = "Right";
      }
    });

    document.addEventListener("keyup", (event) => {
      if (
        (event.key === "ArrowLeft" && currentControl === "Left") ||
        (event.key === "ArrowRight" && currentControl === "Right")
      ) {
        currentControl = "None";
      }
    });

    // handle start game button
    const startButton = document.getElementById("start-game")!;
    startButton.addEventListener("click", () => {
      gameStarted = true;
      startButton.style.display = "none";
    });

    // handle play again button
    handlePlayNewGame(startButton);

    async function gameLoop() {
      game.update(currentControl, gameStarted);

      if (!game.is_game_over()) {
        requestAnimationFrame(gameLoop);
      } else {
        const results = game.get_results();
        const actions = game.get_recorded_actions();
        spawnProofPrompt(actions, results[0], results[1]);
      }
    }

    requestAnimationFrame(gameLoop);
  }
}

function spawnProofPrompt(actions: Action[], score: number, time: number) {
  const orText = document.getElementById("or")!;
  const saveOnChainText = document.getElementById("save-on-chain")!;
  const playAgainText = document.getElementById("play-again")!;

  handleSetup(playAgainText, orText, saveOnChainText);

  saveOnChainText.addEventListener("click", async () => {
    await onSaveScore(
      playAgainText,
      orText,
      saveOnChainText,
      actions,
      score,
      time
    );
  });
}

async function onSaveScore(
  playAgainText: HTMLElement,
  orText: HTMLElement,
  saveOnChainText: HTMLElement,
  actions: Action[],
  score: number,
  time: number
) {
  const createProofContainer = document.getElementById(
    "create-proof-container"
  )!;
  const verifyProofContainer = document.getElementById(
    "verify-proof-container"
  )!;

  playAgainText.style.display = "none";
  orText.style.display = "none";
  createProofContainer.style.display = "flex";
  saveOnChainText.style.display = "none";
  const proofData = await submitProof(actions, score, time);
  if (!proofData || !proofData.public_values || !proofData.proof) {
    console.log("Missing proof data");
    return;
  }
  const verifyProofText = document.getElementById("verify-proof")!;
  const verifyProofLoader = document.getElementById("verify-proof-loader")!;
  handleGotProofData(verifyProofContainer, verifyProofText, verifyProofLoader);
  try {
    await handleVerifyProof(
      proofData,
      verifyProofLoader,
      verifyProofContainer,
      verifyProofText,
      playAgainText
    );
  } catch (error) {
    handleGeneralError(
      error,
      verifyProofLoader,
      verifyProofContainer,
      verifyProofText,
      playAgainText
    );
  }
}

function handleSetup(
  playAgainText: HTMLElement,
  orText: HTMLElement,
  saveOnChainText: HTMLElement
) {
  playAgainText.style.display = "block";
  playAgainText.innerText = "PLAY AGAIN";
  orText.style.display = "block";
  saveOnChainText.style.display = "block";
}

async function handleVerifyProof(
  proofData: ProofData,
  verifyProofLoader: HTMLElement,
  verifyProofContainer: HTMLElement,
  verifyProofText: HTMLElement,
  playAgainText: HTMLElement
) {
  const result = await verifyProof(
    `0x${proofData.public_values}`,
    `0x${proofData.proof}`
  );
  if (!result) {
    handleVerifyProofError(
      verifyProofLoader,
      verifyProofContainer,
      verifyProofText,
      playAgainText
    );
    return;
  }
  verifyProofLoader!.style.display = "none";
  verifyProofContainer!.style.display = "none";
  playAgainText.style.display = "block";
  playAgainText.innerText = `✔️ SAVED ON CHAIN. PLAY AGAIN?`;
}

function handleVerifyProofError(
  verifyProofLoader: HTMLElement,
  verifyProofContainer: HTMLElement,
  verifyProofText: HTMLElement,
  playAgainText: HTMLElement
) {
  console.log("Proof verification failed");
  verifyProofLoader.style.display = "none";
  verifyProofContainer.style.display = "none";
  verifyProofText.innerText = "VERIFY PROOF";
  playAgainText.style.display = "block";
}

function handleGotProofData(
  verifyProofContainer: HTMLElement,
  verifyProofText: HTMLElement,
  verifyProofLoader: HTMLElement
) {
  const createProofText = document.getElementById("create-proof");
  const createProofLoader = document.getElementById("create-proof-loader");
  createProofText!.style.display = "none";
  createProofLoader!.style.display = "none";
  verifyProofContainer.style.display = "flex";
  verifyProofText.innerText = "STEP 2: VERIFYING PROOF";
  verifyProofLoader.style.display = "block";
}

function handleGeneralError(
  error: unknown,
  verifyProofLoader: HTMLElement,
  verifyProofContainer: HTMLElement,
  verifyProofText: HTMLElement,
  playAgainText: HTMLElement
) {
  verifyProofLoader.style.display = "none";
  verifyProofContainer.style.display = "none";
  verifyProofText.innerText = "VERIFY PROOF";
  playAgainText.style.display = "block";
  console.log("ERROR VERIFYING PROOF:", error);
}
function handlePlayNewGame(startButton: HTMLElement) {
  const newGameButton = document.getElementById("play-again")!;
  newGameButton.addEventListener("click", () => {
    startGame();
    startButton.style.display = "block";
    newGameButton.style.display = "none";
    const orText = document.getElementById("or");
    const saveOnChainText = document.getElementById("save-on-chain");
    if (orText && saveOnChainText) {
      orText.style.display = "none";
      saveOnChainText.style.display = "none";
    }
  });
}
