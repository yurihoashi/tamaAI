import React from 'react';
import { createRoot } from 'react-dom/client';
import Pet from './components/Pet';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
    <React.StrictMode>
        <Pet />
    </React.StrictMode>
); 