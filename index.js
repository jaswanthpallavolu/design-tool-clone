import { ctx, canvas, init } from "./canvas.js";
// GLOBAL VARIABLES
let boundRect;
let isDrawing = false;
let startX = 0;
let startY = 0;
let initialImageData;

init();

// const startDrawing = (e) => {
//   boundRect = canvas.getBoundingClientRect();
//   ctx.lineWidth = 5;
//   startX = e.clientX - boundRect.left;
//   startY = e.clientY - boundRect.top;

//   isDrawing = true;
//   ctx.beginPath();
//   ctx.moveTo(startX, startY);

//   ctx.fillStyle = color;
//   ctx.strokeStyle = color;
//   initialImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
// };

// const drawTool = (e) => {
//   const currOffsetX = e.clientX - boundRect.left;
//   const currOffsetY = e.clientY - boundRect.top;
//   const width = currOffsetX - startX;
//   const height = currOffsetY - startY;
//   switch (selectedTool) {
//     case "rectangle":
//       ctx.beginPath();
//       ctx.fillRect(startX, startY, width, height);
//       break;

//     case "ellipse":
//       ctx.beginPath();
//       ctx.ellipse(
//         startX + width / 2,
//         startY + height / 2,
//         width / 2,
//         height / 2,
//         0,
//         0,
//         Math.PI * 2
//       );
//       ctx.fill();
//       ctx.stroke();
//       break;

//     case "line":
//       ctx.beginPath();
//       ctx.moveTo(startX, startY);
//       ctx.lineTo(e.offsetX, e.offsetY);
//       ctx.stroke();
//       break;

//     default:
//       ctx.moveTo(startX, startY);
//       ctx.lineTo(e.offsetX, e.offsetY);
//       ctx.stroke();
//       startX = e.offsetX;
//       startY = e.offsetY;
//   }
// };

// const drawing = (e) => {
//   if (!isDrawing) return;
//   ctx.putImageData(initialImageData, 0, 0);
//   drawTool(e);
// };

// function stopDrawing(e) {
//   isDrawing = false;
//   ctx.closePath();
// }

// canvas.addEventListener("mousedown", startDrawing);
// canvas.addEventListener("mousemove", drawing);
// canvas.addEventListener("mouseup", stopDrawing);
