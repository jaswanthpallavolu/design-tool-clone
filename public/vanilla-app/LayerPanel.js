export class LayerPanel {
  editor
  layer
  constructor(editor, layer) {
    this.editor = editor
    this.layer = layer
    this.init()
  }

  init() {
    this.editor.on("document:modified", () => {
      this.renderLayerTree()
    })

    // Re-render on selection change
    this.editor.on("selection:changed", () => {
      this.renderLayerTree()
    })

    // Re-render on hover change
    this.editor.on("hover:changed", () => {
      this.renderLayerTree()
    })
  }
  isNodeOrParentSelected = (nodeId) => {
    // Check if the node itself is selected
    if (this.editor.selection.isSelected(nodeId)) {
      return true
    }

    // Check if any parent is selected
    let currentNode = this.editor.document.getNode(nodeId)
    while (currentNode?.parentId) {
      if (this.editor.selection.isSelected(currentNode.parentId)) {
        return true
      }
      currentNode = this.editor.document.getNode(currentNode.parentId)
    }

    return false
  }

  getNodeItem = (nodeId) => {
    const node = this.editor.document.getNode(nodeId)
    if (!node) return null

    const li = document.createElement("li")
    const span = document.createElement("span")
    span.textContent = node.name
    span.className = "layer-item"
    span.dataset.nodeId = nodeId

    // Apply selection state - check if this node or any parent is selected
    if (this.isNodeOrParentSelected(nodeId)) {
      span.classList.add("selected")
    }

    // Apply hover state
    const hoveredNodeId = this.editor.state.getHoveredNodeId?.()
    if (hoveredNodeId === nodeId) {
      span.classList.add("hovered")
    }

    // Click to select
    span.addEventListener("click", (e) => {
      e.stopPropagation()
      if (e.shiftKey) {
        this.editor.selection.toggle(nodeId)
      } else {
        this.editor.selection.setSingle(nodeId)
      }
    })

    // Mouse enter to set hover
    span.addEventListener("mouseenter", () => {
      this.editor.state.setHoveredNodeId(nodeId)
    })

    // Mouse leave to clear hover
    span.addEventListener("mouseleave", () => {
      this.editor.state.setHoveredNodeId(undefined)
    })

    li.appendChild(span)

    // Display children in reverse z-order (top items first in UI)
    if (node.children && node.children.length > 0) {
      const ul = document.createElement("ul")
      // Children are already in z-order, reverse to show top items first
      const children = node.children.slice().reverse()
      for (let child of children) {
        const listItem = this.getNodeItem(child)
        if (listItem) ul.appendChild(listItem)
      }
      if (ul.hasChildNodes()) li.appendChild(ul)
    }

    return li
  }

  renderLayerTree = () => {
    const parent = document.createElement("ul")
    // Get root nodes in reverse z-order (top items first in UI)
    // getRootNodesInZOrder() returns nodes in z-order, so reverse for display
    const roots = this.editor.document.getRootNodesInZOrder().slice().reverse()
    for (let root of roots) {
      const listItem = this.getNodeItem(root.id)
      if (listItem) parent.appendChild(listItem)
    }
    while (this.layer.firstChild) {
      this.layer.removeChild(this.layer.firstChild)
    }
    this.layer.appendChild(parent)
  }
}
