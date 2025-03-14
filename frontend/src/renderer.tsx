import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material';
import App from './components/App';

const theme = createTheme({
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
const root = createRoot(container!);

root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    </React.StrictMode>
); 