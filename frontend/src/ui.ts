import { GetAccountReturnType, watchAccount } from "@wagmi/core";
import {
  config,
  connectWithSSO,
  disconnectWallet,
  getHighScores,
  getPlayerAccount,
  getPlayerHighScore,
} from "./wagmi-config";
import { DraggableWindow, getHighestZIndex, handleCloseButtons, handleDoubleClick, handleDoubleClicks, handleLogIn, handleZIndex, setupDialogs } from "./ui-utils";
import startGame from "./game";
import { Score } from "./types";

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize windows
  const windows = document.querySelectorAll(
    ".window"
  ) as NodeListOf<HTMLElement>;
  windows.forEach((window) => {
    new DraggableWindow(window, "h2", ".screen");
  });

  // Initialize account info
  let playerAccount = getPlayerAccount();
  const accountInfoAddress = document.getElementById(
    "account-info-address"
  ) as HTMLElement;
  accountInfoAddress.innerText =
    playerAccount.address?.toString() ?? "Not logged in";

  watchAccount(config, {
    async onChange(data) {
      if (!playerAccount.address && data.address) {
        handleLogIn();
      }
      playerAccount = data;
      if (playerAccount.address) {
        handleDoubleClicksWithAccount(playerAccount);
        accountInfoAddress.innerText = playerAccount.address.toString();
      }
    },
  });

  await setupUI(playerAccount, windows);
});

async function setupUI(playerAccount: GetAccountReturnType, windows: NodeListOf<HTMLElement>) {
  setupDialogs("finder", "openAbout");
  setupDialogs("account-info");
  handleDoubleClicks();
  handleCloseButtons();
  handleDoubleClicksWithAccount(playerAccount);
  handleZIndex(windows);
  await handleGame();
  await handleHighScores(playerAccount.address);
}

async function handleGame() {
  const bricklesFile = document.getElementById("brickles-file") as HTMLElement;
  if (bricklesFile) {
    bricklesFile.addEventListener("dblclick", () => {
      const zIndexHighest = getHighestZIndex();
      handleDoubleClick("brickles-window", zIndexHighest);
      startGame();
    });
  }
}

function handleDoubleClicksWithAccount(playerAccount: GetAccountReturnType) {
  document.querySelectorAll(".item").forEach((item) => {
    item.addEventListener("dblclick", async () => {
      const zIndexHighest = getHighestZIndex();

      switch (item.id) {
        case "my-account-folder":
          handleDoubleClick("account-info", zIndexHighest);
          break;
        case "high-scores-folder":
          await handleHighScores(playerAccount.address);
          await handlePlayerHighScore(playerAccount.address!);
          handleDoubleClick("high-scores-window", zIndexHighest);
          break;
        case "log-in-folder":
          if (playerAccount.address) {
            disconnectWallet();
            const logInIcon = document.getElementById("log-in-folder");
            const myAccount = document.getElementById("my-account-folder");
            logInIcon!.children[1].innerHTML = "Log In";
            myAccount!.style.display = "none";
          } else {
            connectWithSSO();
          }
          break;
        default:
      }
    });
  });
}
async function handleHighScores(playerAddress: `0x${string}` | undefined) {
  const highScores = await getHighScores();
  const highScoresList = document.getElementById("high-scores-list");

  Array.from(highScoresList!.children)
    .slice(1)
    .forEach((child) => child.remove());

  if (highScores && highScoresList) {
    highScores.forEach((scoreInfo) => {
      const listItem = document.createElement("div");
      const accountItem = document.createElement("div");
      const scoreItem = document.createElement("div");
      const timeItem = document.createElement("div");
      listItem.classList.add("high-scores-list-item");
      accountItem.innerText = `${scoreInfo.address.substring(
        0,
        10
      )}...${scoreInfo.address.substring(scoreInfo.address.length - 8)}`;
      scoreItem.innerText = scoreInfo.score.toString();
      const timeString = scoreInfo.time.toString();
      const endLimit = timeString.length - 3;
      timeItem.innerText = `${timeString.substring(
        0,
        timeString.length - endLimit - 1
      )}.${timeString.substring(endLimit)}`;
      listItem.appendChild(accountItem);
      listItem.appendChild(scoreItem);
      listItem.appendChild(timeItem);
      highScoresList.appendChild(listItem);
    });
  }

  if (playerAddress) {
    await handlePlayerHighScore(playerAddress);
  }
}

async function handlePlayerHighScore(playerAddress: `0x${string}`) {
  if (!playerAddress) {
    return;
  }
  const playerHighScore = await getPlayerHighScore(playerAddress);
  const scoreElement = document.getElementById(
    "my-account-high-score"
  ) as HTMLElement;
  const timeElement = document.getElementById("my-account-time") as HTMLElement;
  if (playerHighScore && scoreElement && timeElement) {
    const typedData: Score = playerHighScore as any;
    scoreElement.innerText = typedData.blocksDestroyed.toString();
    const timeString = typedData.timeElapsed.toString();
    const endLimit = timeString.length - 3;
    timeElement.innerText = `${timeString.substring(
      0,
      timeString.length - endLimit - 1
    )}.${timeString.substring(endLimit)}`;
  }
}

