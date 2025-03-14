"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const electron_1 = require("electron");
const styled_1 = __importDefault(require("@emotion/styled"));
const PetContainer = styled_1.default.div `
  width: 100%;
  height: 100%;
  position: relative;
  -webkit-app-region: drag;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
const PetSprite = styled_1.default.div `
  width: 64px;
  height: 64px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  image-rendering: pixelated;
  cursor: pointer;
  -webkit-app-region: no-drag;
`;
const StatsContainer = styled_1.default.div `
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 8px;
  margin-top: 8px;
  color: white;
  font-size: 12px;
  -webkit-app-region: no-drag;
`;
const Pet = () => {
    const [stats, setStats] = (0, react_1.useState)({
        health: 100,
        happiness: 100,
        energy: 100,
        hunger: 100,
    });
    const [showStats, setShowStats] = (0, react_1.useState)(false);
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    const [lastMousePos, setLastMousePos] = (0, react_1.useState)({ x: 0, y: 0 });
    (0, react_1.useEffect)(() => {
        const updateStats = () => {
            // Decrease stats over time
            setStats(prev => ({
                ...prev,
                hunger: Math.max(0, prev.hunger - 0.1),
                energy: Math.max(0, prev.energy - 0.05),
                happiness: Math.max(0, prev.happiness - 0.03),
            }));
        };
        const interval = setInterval(updateStats, 1000);
        return () => clearInterval(interval);
    }, []);
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };
    const handleMouseMove = (e) => {
        if (isDragging) {
            const deltaX = e.clientX - lastMousePos.x;
            const deltaY = e.clientY - lastMousePos.y;
            electron_1.ipcRenderer.send('pet-window-drag', { mouseX: deltaX, mouseY: deltaY });
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    };
    const handleMouseUp = () => {
        setIsDragging(false);
    };
    const getMood = () => {
        const average = (stats.health + stats.happiness + stats.energy + stats.hunger) / 4;
        if (average > 75)
            return 'happy';
        if (average > 50)
            return 'neutral';
        return 'sad';
    };
    return (react_1.default.createElement(PetContainer, { onMouseDown: handleMouseDown, onMouseMove: handleMouseMove, onMouseUp: handleMouseUp, onMouseLeave: handleMouseUp },
        react_1.default.createElement(PetSprite, { mood: getMood(), onClick: () => setShowStats(!showStats) }),
        showStats && (react_1.default.createElement(StatsContainer, null,
            react_1.default.createElement("div", null,
                "Health: ",
                Math.round(stats.health),
                "%"),
            react_1.default.createElement("div", null,
                "Happiness: ",
                Math.round(stats.happiness),
                "%"),
            react_1.default.createElement("div", null,
                "Energy: ",
                Math.round(stats.energy),
                "%"),
            react_1.default.createElement("div", null,
                "Hunger: ",
                Math.round(stats.hunger),
                "%")))));
};
exports.default = Pet;
