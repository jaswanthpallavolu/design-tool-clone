# Grouping Implementation

## Overview

The grouping system allows organizing multiple nodes into hierarchical groups with smart selection behavior.

## Key Design Decisions

### World-Space Transforms

**All node transforms remain in world space, even when grouped.**

This design choice was made because:

1. The rendering system (`CanvasRenderer`) doesn't support hierarchical transforms
2. The hit-testing system works directly with node transforms
3. Simplifies the implementation and avoids transform conversion bugs

### Smart Selection Behavior

Groups provide intelligent selection with modifier key support:

- **Normal click**: Selects the top-level group (if shape is in a group)
- **Cmd/Ctrl + click**: Selects the individual shape (drill down into group)
- **Shift + click**: Add to selection (works with both groups and shapes)
- Groups can be moved, and all children move with them recursively
- Selection bounds are calculated from all children recursively
- Resize/rotate handles work on the group's bounding box

## How It Works

### Grouping (`groupNodes`)

1. Validates that all nodes have the same parent
2. Calculates bounding box of selected nodes
3. Creates a group node at the center of the bounding box
4. Reparents selected nodes to the group **without modifying their transforms**

### Ungrouping (`ungroupNode`)

1. Validates the node is a group with children
2. Reparents all children to the group's parent
3. Removes the empty group node
4. **No transform adjustments needed** (already in world space)

### Selection Logic

When clicking on a shape:

1. Hit test determines which shape was clicked
2. If Cmd/Ctrl is held: select the shape directly
3. If Cmd/Ctrl is NOT held: find the top-level parent and select it instead
4. This allows drilling down into groups or selecting entire groups

### Moving Groups

When dragging a selected group:

1. The group node's transform is updated
2. All children (recursively) have their transforms updated by the same delta
3. This maintains world-space positions while moving the entire hierarchy

## Usage

### Keyboard Shortcuts

- **Cmd/Ctrl+G**: Group selected nodes
- **Cmd/Ctrl+Shift+G**: Ungroup selected group(s)

### Selection Shortcuts

- **Click**: Select group (if shape is in a group)
- **Cmd/Ctrl+Click**: Select individual shape
- **Shift+Click**: Add to selection

### Programmatic API

```typescript
// Group nodes
const groupId = editor.groupSelection()

// Ungroup
const childIds = editor.ungroupSelection()

// Check if can group/ungroup
const canGroup = editor.groupService.canGroup(nodeIds)
const canUngroup = editor.groupService.canUngroup(groupId)

// Get top-level parent
const topParent = editor.document.getTopLevelParent(nodeId)
```

## Implementation Details

### Files Modified

1. **GroupService.ts**: Core grouping/ungrouping logic
2. **Document.ts**: Added `getTopLevelParent()` method
3. **SelectTool.ts**: Smart selection based on modifier keys
4. **SelectionBoundsHelper.ts**: Calculate bounds from group children
5. **DragState.ts**: Recursive movement of groups and children
6. **Editor.ts**: Group/ungroup commands and keyboard shortcuts

### Current Behavior

✅ Groups can be created from multiple selected shapes
✅ Groups can be selected by clicking any child shape
✅ Individual shapes can be selected with Cmd/Ctrl+click
✅ Groups can be moved (all children move together)
✅ Groups can be ungrouped
✅ Selection bounds show the combined bounds of all children
✅ Nested groups are supported

### Limitations

1. **No Group Rotation**: Rotating a group doesn't rotate children (world-space transforms)
2. **No Group Resize**: Resizing a group doesn't scale children
3. **Flat Rendering**: Groups don't affect rendering order or clipping

## Future Enhancements

To support full hierarchical transforms:

1. Implement `getWorldTransform()` method that traverses parent chain
2. Update renderer to apply parent transforms
3. Update hit-testing to use world transforms
4. Modify grouping to use local transforms relative to parent

This would enable:

- Rotating entire groups
- Scaling entire groups
- True hierarchical scene graph
- Proper transform inheritance

## Made with Bob
