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
const material_1 = require("@mui/material");
const styled_1 = __importDefault(require("@emotion/styled"));
const StyledContainer = (0, styled_1.default)(material_1.Container) `
  padding-top: 2rem;
`;
const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (react_1.default.createElement("div", { role: "tabpanel", hidden: value !== index, id: `tabpanel-${index}`, ...other }, value === index && react_1.default.createElement(material_1.Box, { p: 3 }, children)));
};
const App = () => {
    const [tabValue, setTabValue] = (0, react_1.useState)(0);
    const [settings, setSettings] = (0, react_1.useState)({
        sleepTime: '22:00',
        wakeTime: '07:00',
        screenTimeLimit: 120, // minutes
        unhealthyFoodLimit: 3, // per week
    });
    const handleTabChange = (_, newValue) => {
        setTabValue(newValue);
    };
    const handleSettingChange = (setting, value) => {
        setSettings(prev => ({
            ...prev,
            [setting]: value,
        }));
    };
    return (react_1.default.createElement(StyledContainer, null,
        react_1.default.createElement(material_1.Paper, { elevation: 3 },
            react_1.default.createElement(material_1.Box, { sx: { borderBottom: 1, borderColor: 'divider' } },
                react_1.default.createElement(material_1.Tabs, { value: tabValue, onChange: handleTabChange, centered: true },
                    react_1.default.createElement(material_1.Tab, { label: "Dashboard" }),
                    react_1.default.createElement(material_1.Tab, { label: "Settings" }),
                    react_1.default.createElement(material_1.Tab, { label: "Stats" }))),
            react_1.default.createElement(TabPanel, { value: tabValue, index: 0 },
                react_1.default.createElement(material_1.Typography, { variant: "h5", gutterBottom: true }, "Welcome to TamaAI"),
                react_1.default.createElement(material_1.Typography, { paragraph: true }, "Your digital wellness companion is here to help you maintain healthy habits. Keep an eye on your pet's status and follow its guidance for a better lifestyle!")),
            react_1.default.createElement(TabPanel, { value: tabValue, index: 1 },
                react_1.default.createElement(material_1.Typography, { variant: "h6", gutterBottom: true }, "Wellness Settings"),
                react_1.default.createElement(material_1.Box, { sx: { my: 2 } },
                    react_1.default.createElement(material_1.TextField, { label: "Sleep Time", type: "time", value: settings.sleepTime, onChange: (e) => handleSettingChange('sleepTime', e.target.value), fullWidth: true, margin: "normal" }),
                    react_1.default.createElement(material_1.TextField, { label: "Wake Time", type: "time", value: settings.wakeTime, onChange: (e) => handleSettingChange('wakeTime', e.target.value), fullWidth: true, margin: "normal" }),
                    react_1.default.createElement(material_1.Typography, { gutterBottom: true }, "Screen Time Limit (minutes per day)"),
                    react_1.default.createElement(material_1.Slider, { value: settings.screenTimeLimit, onChange: (__, value) => handleSettingChange('screenTimeLimit', value), min: 30, max: 480, valueLabelDisplay: "auto" }),
                    react_1.default.createElement(material_1.FormControl, { fullWidth: true, margin: "normal" },
                        react_1.default.createElement(material_1.InputLabel, null, "Unhealthy Food Limit (per week)"),
                        react_1.default.createElement(material_1.Select, { value: settings.unhealthyFoodLimit, onChange: (e) => handleSettingChange('unhealthyFoodLimit', e.target.value) },
                            react_1.default.createElement(material_1.MenuItem, { value: 1 }, "1 time per week"),
                            react_1.default.createElement(material_1.MenuItem, { value: 2 }, "2 times per week"),
                            react_1.default.createElement(material_1.MenuItem, { value: 3 }, "3 times per week"),
                            react_1.default.createElement(material_1.MenuItem, { value: 4 }, "4 times per week"),
                            react_1.default.createElement(material_1.MenuItem, { value: 5 }, "5 times per week"))),
                    react_1.default.createElement(material_1.Button, { variant: "contained", color: "primary", fullWidth: true, sx: { mt: 2 }, onClick: () => {
                            // TODO: Save settings
                            console.log('Saving settings:', settings);
                        } }, "Save Settings"))),
            react_1.default.createElement(TabPanel, { value: tabValue, index: 2 },
                react_1.default.createElement(material_1.Typography, { variant: "h6", gutterBottom: true }, "Your Progress"),
                react_1.default.createElement(material_1.Typography, { paragraph: true }, "Statistics and progress tracking coming soon!")))));
};
exports.default = App;
