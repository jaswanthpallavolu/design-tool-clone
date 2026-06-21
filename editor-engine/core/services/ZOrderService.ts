import { Document } from "../Document"
import { Node, isGroupNode } from "../model/Node"

export class ZOrderService {
  constructor(private readonly document: Document) {}

  setNodeZOrder(nodeId: string, targetIndex: number): void {
    const node = this.document.getNode(nodeId)
    if (!node) {
      throw new Error(`Node with id '${nodeId}' does not exist`)
    }

    // Document.setNodeZOrder now automatically maintains parent-children invariant
    this.document.setNodeZOrder(nodeId, targetIndex)
  }

  bringToFront(nodeId: string): void {
    const node = this.document.getNode(nodeId)
    if (!node) {
      throw new Error(`Node with id '${nodeId}' does not exist`)
    }

    const siblings = this.getSiblings(nodeId)
    if (siblings.length === 0) return

    const zOrder = this.document.getZOrder()
    const currentIndex = zOrder.indexOf(nodeId)
    const maxSiblingIndex = Math.max(
      ...siblings.map((s) => zOrder.indexOf(s.id)),
    )

    if (currentIndex > maxSiblingIndex) {
      return
    }

    this.setNodeZOrder(nodeId, maxSiblingIndex + 1)
  }

  sendToBack(nodeId: string): void {
    const node = this.document.getNode(nodeId)
    if (!node) {
      throw new Error(`Node with id '${nodeId}' does not exist`)
    }

    const siblings = this.getSiblings(nodeId)
    if (siblings.length === 0) return

    const zOrder = this.document.getZOrder()
    const currentIndex = zOrder.indexOf(nodeId)
    const minSiblingIndex = Math.min(
      ...siblings.map((s) => zOrder.indexOf(s.id)),
    )

    if (currentIndex < minSiblingIndex) {
      return
    }

    this.setNodeZOrder(nodeId, minSiblingIndex)
  }

  bringForward(nodeId: string): void {
    const node = this.document.getNode(nodeId)
    if (!node) {
      throw new Error(`Node with id '${nodeId}' does not exist`)
    }

    const siblings = this.getSiblings(nodeId)
    if (siblings.length === 0) return

    const zOrder = this.document.getZOrder()
    const siblingIndices = siblings
      .map((s) => ({ id: s.id, index: zOrder.indexOf(s.id) }))
      .filter((s) => s.index > zOrder.indexOf(nodeId))
      .sort((a, b) => a.index - b.index)

    if (siblingIndices.length === 0) return

    const nextSibling = siblingIndices[0]

    const currentDescendants = this.getNodeAndDescendants(nodeId)

    const nextSiblingDescendants = this.getNodeAndDescendants(nextSibling.id)

    const newZOrder = Array.from(zOrder).filter(
      (id) => !currentDescendants.includes(id),
    )

    const lastNextSiblingDescendant =
      nextSiblingDescendants[nextSiblingDescendants.length - 1]
    const insertIndex = newZOrder.indexOf(lastNextSiblingDescendant) + 1

    newZOrder.splice(insertIndex, 0, ...currentDescendants)

    // Document.replaceZOrder now automatically maintains all parent-children invariants
    this.document.replaceZOrder(newZOrder)
  }

  sendBackward(nodeId: string): void {
    const node = this.document.getNode(nodeId)
    if (!node) {
      throw new Error(`Node with id '${nodeId}' does not exist`)
    }

    const siblings = this.getSiblings(nodeId)
    if (siblings.length === 0) return

    const zOrder = this.document.getZOrder()
    const siblingIndices = siblings
      .map((s) => ({ id: s.id, index: zOrder.indexOf(s.id) }))
      .filter((s) => s.index < zOrder.indexOf(nodeId))
      .sort((a, b) => b.index - a.index)

    if (siblingIndices.length === 0) return

    const prevSibling = siblingIndices[0]

    const currentDescendants = this.getNodeAndDescendants(nodeId)

    const prevSiblingDescendants = this.getNodeAndDescendants(prevSibling.id)

    const newZOrder = Array.from(zOrder).filter(
      (id) => !currentDescendants.includes(id),
    )

    const firstPrevSiblingDescendant = prevSiblingDescendants[0]
    const insertIndex = newZOrder.indexOf(firstPrevSiblingDescendant)

    newZOrder.splice(insertIndex, 0, ...currentDescendants)

    // Document.replaceZOrder now automatically maintains all parent-children invariants
    this.document.replaceZOrder(newZOrder)
  }

  private getSiblings(nodeId: string): Node[] {
    const node = this.document.getNode(nodeId)
    if (!node) return []

    return this.getSiblingsIncludingSelf(node).filter((n) => n.id !== nodeId)
  }

  private getSiblingsIncludingSelf(node: Node): Node[] {
    return node.parentId
      ? this.document.getChildren(node.parentId)
      : this.document.getRootNodes()
  }

  private getNodeAndDescendants(nodeId: string): string[] {
    const result: string[] = []
    const node = this.document.getNode(nodeId)
    if (!node) return result

    result.push(nodeId)

    if (isGroupNode(node)) {
      for (const childId of node.children) {
        result.push(...this.getNodeAndDescendants(childId))
      }
    }

    return result
  }
}
