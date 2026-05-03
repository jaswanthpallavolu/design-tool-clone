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
  }

  getNodeItem = (nodeId) => {
    const node = this.editor.document.getNode(nodeId)
    if (!node) return null
    const li = document.createElement("li")
    const span = document.createElement("span")
    span.textContent = node.name
    li.appendChild(span)

    const children = node.children.slice().reverse()
    const ul = document.createElement("ul")
    for (let child of children) {
      const listItem = this.getNodeItem(child)
      if (listItem) ul.appendChild(listItem)
    }
    if (ul.hasChildNodes()) li.appendChild(ul)

    return li
  }

  renderLayerTree = () => {
    const parent = document.createElement("ul")
    const roots = this.editor.document.getRootNodes().slice().reverse()
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
