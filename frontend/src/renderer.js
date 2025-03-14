"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const client_1 = require("react-dom/client");
const material_1 = require("@mui/material");
const App_1 = __importDefault(require("./components/App"));
const theme = (0, material_1.createTheme)({
    palette: {
        primary: {
            main: '#4a90e2',
        },
        secondary: {
            main: '#e91e63',
        },
    },
});
const container = document.getElementById('root');
const root = (0, client_1.createRoot)(container);
root.render(react_1.default.createElement(react_1.default.StrictMode, null,
    react_1.default.createElement(material_1.ThemeProvider, { theme: theme },
        react_1.default.createElement(App_1.default, null))));
