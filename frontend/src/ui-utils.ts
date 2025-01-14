export function getHighestZIndex(): number {
  const windows = document.querySelectorAll(
    "#systemDisk, #gamesDisk, #trashDisk"
  );
  let highest = 8;

  windows.forEach((window) => {
    const zIndex = parseInt(getComputedStyle(window).zIndex || "0", 10);
    if (zIndex > highest) {
      highest = zIndex;
    }
  });

  return highest;
}

export class DraggableWindow {
  private element: HTMLElement;
  private handle: HTMLElement;
  private container: HTMLElement;
  private isDragging: boolean = false;
  private currentX: number = 0;
  private currentY: number = 0;
  private initialX: number = 0;
  private initialY: number = 0;
  private xOffset: number = 0;
  private yOffset: number = 0;

  constructor(
    element: HTMLElement,
    handleSelector: string,
    containerSelector: string
  ) {
    this.element = element;
    this.handle = element.querySelector(handleSelector) as HTMLElement;
    this.container = document.querySelector(containerSelector) as HTMLElement;
    this.setupDragging();
  }

  private setupDragging(): void {
    this.handle.addEventListener("mousedown", (e: MouseEvent) =>
      this.dragStart(e)
    );
    document.addEventListener("mousemove", (e: MouseEvent) => this.drag(e));
    document.addEventListener("mouseup", () => this.dragEnd());
  }

  private dragStart(e: MouseEvent): void {
    this.initialX = e.clientX - this.xOffset;
    this.initialY = e.clientY - this.yOffset;

    if (e.target === this.handle) {
      this.isDragging = true;
      this.element.style.zIndex = getHighestZIndex() + 1 + "";
    }
  }

  private drag(e: MouseEvent): void {
    if (this.isDragging) {
      e.preventDefault();

      this.currentX = e.clientX - this.initialX;
      this.currentY = e.clientY - this.initialY;

      this.xOffset = this.currentX;
      this.yOffset = this.currentY;

      const containerRect = this.container.getBoundingClientRect();
      const elementRect = this.element.getBoundingClientRect();

      // Constrain to container
      const maxX = containerRect.width - elementRect.width;
      const maxY = containerRect.height - elementRect.height;

      this.currentX = Math.min(Math.max(this.currentX, 0), maxX);
      this.currentY = Math.min(Math.max(this.currentY, 0), maxY);

      this.setTranslate(this.currentX, this.currentY);
    }
  }

  private dragEnd(): void {
    this.initialX = this.currentX;
    this.initialY = this.currentY;
    this.isDragging = false;
  }

  private setTranslate(xPos: number, yPos: number): void {
    this.element.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  }
}


export function handleDoubleClick(
  id: string,
  zIndexHighest: number,
  display: string = "block"
) {
  const element = document.getElementById(id);
  if (element) {
    element.style.zIndex = (zIndexHighest + 1).toString();
    element.style.display = display;
    pulsateElement(element);
  }
}

function pulsateElement(element: HTMLElement, times: number = 3): void {
  let count = 0;
  const interval = setInterval(() => {
    element.style.opacity = count % 2 === 0 ? "0.5" : "1";
    count++;
    if (count >= times * 2) {
      clearInterval(interval);
      element.style.opacity = "1";
    }
  }, 100);
}

export function handleDoubleClicks() {
  document.querySelectorAll(".item").forEach((item) => {
    item.addEventListener("dblclick", async () => {
      const zIndexHighest = getHighestZIndex();

      switch (item.id) {
        case "system":
          handleDoubleClick("systemDisk", zIndexHighest);
          break;
        case "games":
          handleDoubleClick("gamesDisk", zIndexHighest);
          break;
        case "trash":
          handleDoubleClick("trashDisk", zIndexHighest);
          break;
        default:
      }
    });
  });
}

export function setupDialogs(dialogId: string, openId?: string) {
  const dialog = document.getElementById(dialogId);

  if (dialog) {
    if (openId) {
      const openBtn = document.getElementById(openId);
      if (openBtn) {
        openBtn.addEventListener("click", () => {
          dialog.style.display = "block";
          pulsateElement(dialog);
        });
      }
    }

    hideOnClick(dialog);
  }
}

function hideOnClick(dialog: HTMLElement) {
  dialog.addEventListener("click", () => {
    dialog.style.display = "none";
  });
}


export function handleCloseButtons() {
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("mouseup", () => {
      const thisWindow = closeBtn.closest(".window") as HTMLElement;
      if (thisWindow) {
        thisWindow.style.display = "none";
        pulsateElement(thisWindow);
      }
    });
  });
}


export function handleZIndex(windows: NodeListOf<HTMLElement>) {
  windows.forEach((window) => {
    window.addEventListener("click", () => {
      window.classList.add("zind");
      windows.forEach((otherWindow) => {
        if (otherWindow !== window) {
          otherWindow.classList.remove("zind");
        }
      });
    });
  });
}

export function handleLogIn() {
  const logInIcon = document.getElementById("log-in-folder");
  const myAccount = document.getElementById("my-account-folder");
  logInIcon!.children[1].innerHTML = "Log Out";
  myAccount!.style.display = "flex";
}
