import { Shape } from "../model/Shape"
import { AABB } from "./BoundingBoxService"
import { EditorConfig } from "../../config/EditorConfig"

export interface HandleGeometry {
  corners: Record<string, { x: number; y: number; size: number }>
  edges: Record<string, { x1: number; y1: number; x2: number; y2: number }>
  rotation: Record<string, { x: number; y: number; radius: number }>
}

export class HandleGeometryService {
  static getAABBHandleGeometry(aabb: AABB): HandleGeometry {
    const width = aabb.maxX - aabb.minX
    const height = aabb.maxY - aabb.minY
    const halfW = width / 2
    const halfH = height / 2
    const centerX = aabb.minX + halfW
    const centerY = aabb.minY + halfH

    return {
      corners: {
        nw: {
          x: -halfW,
          y: -halfH,
          size: EditorConfig.handleOptions.cornerSize,
        },
        ne: {
          x: halfW,
          y: -halfH,
          size: EditorConfig.handleOptions.cornerSize,
        },
        se: { x: halfW, y: halfH, size: EditorConfig.handleOptions.cornerSize },
        sw: {
          x: -halfW,
          y: halfH,
          size: EditorConfig.handleOptions.cornerSize,
        },
      },
      edges: {
        n: { x1: -halfW, y1: -halfH, x2: halfW, y2: -halfH },
        e: { x1: halfW, y1: -halfH, x2: halfW, y2: halfH },
        s: { x1: halfW, y1: halfH, x2: -halfW, y2: halfH },
        w: { x1: -halfW, y1: halfH, x2: -halfW, y2: -halfH },
      },
      rotation: {
        nw: {
          x: -halfW - EditorConfig.handleOptions.rotationPadding,
          y: -halfH - EditorConfig.handleOptions.rotationPadding,
          radius: EditorConfig.handleOptions.rotationRadius,
        },
        ne: {
          x: halfW + EditorConfig.handleOptions.rotationPadding,
          y: -halfH - EditorConfig.handleOptions.rotationPadding,
          radius: EditorConfig.handleOptions.rotationRadius,
        },
        se: {
          x: halfW + EditorConfig.handleOptions.rotationPadding,
          y: halfH + EditorConfig.handleOptions.rotationPadding,
          radius: EditorConfig.handleOptions.rotationRadius,
        },
        sw: {
          x: -halfW - EditorConfig.handleOptions.rotationPadding,
          y: halfH + EditorConfig.handleOptions.rotationPadding,
          radius: EditorConfig.handleOptions.rotationRadius,
        },
      },
    }
  }

  static getShapeHandleGeometry(shape: Shape): HandleGeometry {
    if (shape.kind === "line") {
      return this.getLineHandleGeometry(shape)
    }
    return this.getRectangularHandleGeometry(shape)
  }

  private static getLineHandleGeometry(
    shape: Shape & { kind: "line" },
  ): HandleGeometry {
    // Calculate relative positions from center (0, 0)
    const centerX = (shape.local.x1 + shape.local.x2) / 2
    const centerY = (shape.local.y1 + shape.local.y2) / 2

    const relP1X = shape.local.x1 - centerX
    const relP1Y = shape.local.y1 - centerY
    const relP2X = shape.local.x2 - centerX
    const relP2Y = shape.local.y2 - centerY

    // Calculate line length and direction for rotation handles
    const length = Math.sqrt(
      Math.pow(shape.local.x2 - shape.local.x1, 2) +
        Math.pow(shape.local.y2 - shape.local.y1, 2),
    )

    // Normalized direction vectors
    const dirP1X = length > 0 ? relP1X / (length / 2) : 0
    const dirP1Y = length > 0 ? relP1Y / (length / 2) : 0
    const dirP2X = length > 0 ? relP2X / (length / 2) : 0
    const dirP2Y = length > 0 ? relP2Y / (length / 2) : 0

    return {
      corners: {
        p1: {
          x: relP1X,
          y: relP1Y,
          size: EditorConfig.handleOptions.cornerSize,
        },
        p2: {
          x: relP2X,
          y: relP2Y,
          size: EditorConfig.handleOptions.cornerSize,
        },
      },
      edges: {}, // Lines don't have edge handles
      rotation: {
        p1: {
          x: relP1X + dirP1X * EditorConfig.handleOptions.rotationPadding,
          y: relP1Y + dirP1Y * EditorConfig.handleOptions.rotationPadding,
          radius: EditorConfig.handleOptions.rotationRadius,
        },
        p2: {
          x: relP2X + dirP2X * EditorConfig.handleOptions.rotationPadding,
          y: relP2Y + dirP2Y * EditorConfig.handleOptions.rotationPadding,
          radius: EditorConfig.handleOptions.rotationRadius,
        },
      },
    }
  }

  private static getRectangularHandleGeometry(
    shape: Shape & { kind: "rectangle" | "ellipse" },
  ): HandleGeometry {
    const halfW = shape.local.width / 2
    const halfH = shape.local.height / 2

    return {
      corners: {
        nw: {
          x: -halfW,
          y: -halfH,
          size: EditorConfig.handleOptions.cornerSize,
        },
        ne: {
          x: halfW,
          y: -halfH,
          size: EditorConfig.handleOptions.cornerSize,
        },
        se: { x: halfW, y: halfH, size: EditorConfig.handleOptions.cornerSize },
        sw: {
          x: -halfW,
          y: halfH,
          size: EditorConfig.handleOptions.cornerSize,
        },
      },
      edges: {
        n: { x1: -halfW, y1: -halfH, x2: halfW, y2: -halfH },
        e: { x1: halfW, y1: -halfH, x2: halfW, y2: halfH },
        s: { x1: halfW, y1: halfH, x2: -halfW, y2: halfH },
        w: { x1: -halfW, y1: halfH, x2: -halfW, y2: -halfH },
      },
      rotation: {
        nw: {
          x: -halfW - EditorConfig.handleOptions.rotationPadding,
          y: -halfH - EditorConfig.handleOptions.rotationPadding,
          radius: EditorConfig.handleOptions.rotationRadius,
        },
        ne: {
          x: halfW + EditorConfig.handleOptions.rotationPadding,
          y: -halfH - EditorConfig.handleOptions.rotationPadding,
          radius: EditorConfig.handleOptions.rotationRadius,
        },
        se: {
          x: halfW + EditorConfig.handleOptions.rotationPadding,
          y: halfH + EditorConfig.handleOptions.rotationPadding,
          radius: EditorConfig.handleOptions.rotationRadius,
        },
        sw: {
          x: -halfW - EditorConfig.handleOptions.rotationPadding,
          y: halfH + EditorConfig.handleOptions.rotationPadding,
          radius: EditorConfig.handleOptions.rotationRadius,
        },
      },
    }
  }
}
