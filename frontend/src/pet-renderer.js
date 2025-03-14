"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const client_1 = require("react-dom/client");
const Pet_1 = __importDefault(require("./components/Pet"));
const container = document.getElementById('root');
const root = (0, client_1.createRoot)(container);
root.render(react_1.default.createElement(react_1.default.StrictMode, null,
    react_1.default.createElement(Pet_1.default, null)));
