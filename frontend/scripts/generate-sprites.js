const { createCanvas, createImageData } = require('canvas');
const fs = require('fs');
const path = require('path');

const SPRITE_SIZE = 32;
const COLORS = {
    happy: '#FFD700',    // Gold
    neutral: '#87CEEB',  // Sky Blue
    sad: '#A9A9A9',      // Dark Gray
    outline: '#000000',  // Black
};

const ACTIONS = ['idle', 'walk', 'eat', 'sleep', 'play'];
const MOODS = ['happy', 'neutral', 'sad'];

function createSprite(mood, action, frameCount) {
    const canvas = createCanvas(SPRITE_SIZE * frameCount, SPRITE_SIZE);
    const ctx = canvas.getContext('2d');

    // For each frame
    for (let frame = 0; frame < frameCount; frame++) {
        const x = frame * SPRITE_SIZE;

        // Draw basic cat shape
        ctx.fillStyle = COLORS[mood];
        ctx.strokeStyle = COLORS.outline;
        ctx.lineWidth = 1;

        // Body
        ctx.beginPath();
        ctx.ellipse(
            x + SPRITE_SIZE / 2,
            SPRITE_SIZE / 2 + 4,
            10,
            8,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();

        // Head
        ctx.beginPath();
        ctx.arc(
            x + SPRITE_SIZE / 2,
            SPRITE_SIZE / 2 - 4,
            6,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();

        // Ears
        ctx.beginPath();
        ctx.moveTo(x + SPRITE_SIZE / 2 - 4, SPRITE_SIZE / 2 - 8);
        ctx.lineTo(x + SPRITE_SIZE / 2 - 6, SPRITE_SIZE / 2 - 12);
        ctx.lineTo(x + SPRITE_SIZE / 2 - 2, SPRITE_SIZE / 2 - 8);
        ctx.moveTo(x + SPRITE_SIZE / 2 + 4, SPRITE_SIZE / 2 - 8);
        ctx.lineTo(x + SPRITE_SIZE / 2 + 6, SPRITE_SIZE / 2 - 12);
        ctx.lineTo(x + SPRITE_SIZE / 2 + 2, SPRITE_SIZE / 2 - 8);
        ctx.fill();
        ctx.stroke();

        // Add animation-specific details
        switch (action) {
            case 'walk':
                // Legs in different positions
                const offset = Math.sin(frame * Math.PI / 2) * 2;
                ctx.beginPath();
                ctx.moveTo(x + SPRITE_SIZE / 2 - 6, SPRITE_SIZE / 2 + 8);
                ctx.lineTo(x + SPRITE_SIZE / 2 - 6, SPRITE_SIZE / 2 + 12 + offset);
                ctx.moveTo(x + SPRITE_SIZE / 2 + 6, SPRITE_SIZE / 2 + 8);
                ctx.lineTo(x + SPRITE_SIZE / 2 + 6, SPRITE_SIZE / 2 + 12 - offset);
                ctx.stroke();
                break;

            case 'sleep':
                // Closed eyes and 'Z's
                ctx.fillStyle = COLORS.outline;
                ctx.fillText('z', x + SPRITE_SIZE / 2 + 8, SPRITE_SIZE / 2 - 8 + frame);
                break;

            case 'eat':
                // Open mouth
                ctx.beginPath();
                ctx.arc(
                    x + SPRITE_SIZE / 2,
                    SPRITE_SIZE / 2 - 2,
                    2,
                    0,
                    Math.PI
                );
                ctx.stroke();
                break;

            case 'play':
                // Bouncing animation
                ctx.translate(x + SPRITE_SIZE / 2, SPRITE_SIZE / 2 + Math.sin(frame * Math.PI / 2) * 2);
                ctx.translate(-x - SPRITE_SIZE / 2, -SPRITE_SIZE / 2);
                break;
        }
    }

    return canvas;
}

// Create sprites directory if it doesn't exist
const spritesDir = path.join(__dirname, '../src/assets/sprites');
if (!fs.existsSync(spritesDir)) {
    fs.mkdirSync(spritesDir, { recursive: true });
}

// Generate sprites for each mood and action
MOODS.forEach(mood => {
    ACTIONS.forEach(action => {
        const frameCount = action === 'walk' || action === 'play' ? 6 : 4;
        const canvas = createSprite(mood, action, frameCount);

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(
            path.join(spritesDir, `${mood}_${action}.png`),
            buffer
        );

        console.log(`Generated ${mood}_${action}.png`);
    });
}); 