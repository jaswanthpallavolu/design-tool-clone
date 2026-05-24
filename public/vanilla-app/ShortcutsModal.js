/**
 * ShortcutsModal - Manages the keyboard shortcuts modal
 */
export class ShortcutsModal {
  constructor() {
    this.modal = document.getElementById("shortcuts-modal")
    this.shortcutsButton = document.getElementById("shortcuts-button")
    this.closeModalButton = document.getElementById("close-modal")

    this.init()
  }

  /**
   * Initialize modal event listeners
   */
  init() {
    // Button click listeners
    this.shortcutsButton.addEventListener("click", () => this.open())
    this.closeModalButton.addEventListener("click", () => this.close())

    // Close modal when clicking outside
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.close()
      }
    })

    // Keyboard shortcuts for modal
    document.addEventListener("keydown", (e) => {
      // Open modal with '?' key
      if (e.key === "?" && !this.isOpen()) {
        e.preventDefault()
        this.open()
        return
      }

      // Close modal with Escape key
      if (e.key === "Escape" && this.isOpen()) {
        e.preventDefault()
        this.close()
        return
      }
    })

    console.log("⌨️ Press '?' to view keyboard shortcuts")
  }

  /**
   * Open the modal
   */
  open() {
    this.modal.classList.add("show")
    document.body.style.overflow = "hidden"
  }

  /**
   * Close the modal
   */
  close() {
    this.modal.classList.remove("show")
    document.body.style.overflow = ""
  }

  /**
   * Check if modal is open
   */
  isOpen() {
    return this.modal.classList.contains("show")
  }
}

// Made with Bob
