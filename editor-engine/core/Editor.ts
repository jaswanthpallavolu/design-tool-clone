import { Document } from "./Document"
import { SelectionManager } from "./SelectionManager"
import { ToolManager } from "./ToolManager"
import { EditorState } from "./EditorState"

export class Editor {
  readonly document = new Document()
  readonly selection = new SelectionManager()
  readonly tools = new ToolManager(this)
  readonly state = new EditorState()
}
