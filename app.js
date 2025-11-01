// Font Maker Application
class FontMaker {
    constructor() {
        this.canvas = document.getElementById('drawing-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'pen';
        this.brushSize = 5;

        // Character sets
        this.characters = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
            lowercase: 'abcdefghijklmnopqrstuvwxyz'.split(''),
            numbers: '0123456789'.split(''),
            symbols: '!@#$%&*()_+-=[]{}|;:\'",.<>?/'.split('')
        };

        // Store drawn characters as image data
        this.drawnChars = new Map();
        this.currentChar = 'A';

        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupCharacterButtons();
        this.setupTools();
        this.setupEventListeners();
        this.updateProgress();
    }

    setupCanvas() {
        // Set canvas background
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Set default drawing style
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    setupCharacterButtons() {
        // Create buttons for each character category
        Object.entries(this.characters).forEach(([category, chars]) => {
            const grid = document.getElementById(`${category}-grid`);
            chars.forEach(char => {
                const btn = document.createElement('button');
                btn.className = 'char-btn';
                btn.textContent = char;
                btn.dataset.char = char;
                btn.addEventListener('click', () => this.selectCharacter(char));
                grid.appendChild(btn);
            });
        });

        // Select first character
        this.selectCharacter('A');
    }

    setupTools() {
        // Brush size
        const brushSizeInput = document.getElementById('brush-size');
        const brushSizeValue = document.getElementById('brush-size-value');

        brushSizeInput.addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            brushSizeValue.textContent = this.brushSize;
        });

        // Pen tool
        document.getElementById('pen-tool').addEventListener('click', () => {
            this.currentTool = 'pen';
            this.updateToolButtons();
        });

        // Eraser tool
        document.getElementById('eraser-tool').addEventListener('click', () => {
            this.currentTool = 'eraser';
            this.updateToolButtons();
        });

        // Clear button
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearCanvas();
        });

        // Save character
        document.getElementById('save-char').addEventListener('click', () => {
            this.saveCurrentCharacter();
        });

        // Next character
        document.getElementById('next-char').addEventListener('click', () => {
            this.goToNextCharacter();
        });

        // Download font
        document.getElementById('download-btn').addEventListener('click', () => {
            this.generateAndDownloadFont();
        });

        // Preview text
        document.getElementById('preview-text').addEventListener('input', (e) => {
            this.updatePreview();
        });
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    draw(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.currentTool === 'pen') {
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = this.brushSize;
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        } else if (this.currentTool === 'eraser') {
            this.ctx.clearRect(x - this.brushSize, y - this.brushSize,
                             this.brushSize * 2, this.brushSize * 2);
        }
    }

    stopDrawing() {
        this.isDrawing = false;
        this.ctx.beginPath();
    }

    clearCanvas() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateToolButtons() {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        if (this.currentTool === 'pen') {
            document.getElementById('pen-tool').classList.add('active');
        } else if (this.currentTool === 'eraser') {
            document.getElementById('eraser-tool').classList.add('active');
        }
    }

    selectCharacter(char) {
        // Save current character if it has been drawn
        if (this.isCanvasDrawn()) {
            this.saveCurrentCharacter();
        }

        this.currentChar = char;
        document.getElementById('current-char').textContent = char;

        // Update active button
        document.querySelectorAll('.char-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.char === char) {
                btn.classList.add('active');
            }
        });

        // Load existing drawing if available
        this.clearCanvas();
        if (this.drawnChars.has(char)) {
            const imageData = this.drawnChars.get(char);
            this.ctx.putImageData(imageData, 0, 0);
        }
    }

    isCanvasDrawn() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        // Check if any pixel is not white
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] !== 255 || data[i+1] !== 255 || data[i+2] !== 255) {
                return true;
            }
        }
        return false;
    }

    saveCurrentCharacter() {
        if (!this.isCanvasDrawn()) {
            alert('Please draw something before saving!');
            return;
        }

        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.drawnChars.set(this.currentChar, imageData);

        // Mark button as completed
        document.querySelectorAll('.char-btn').forEach(btn => {
            if (btn.dataset.char === this.currentChar) {
                btn.classList.add('completed');
            }
        });

        this.updateProgress();
        this.updatePreview();
    }

    goToNextCharacter() {
        const allChars = [
            ...this.characters.uppercase,
            ...this.characters.lowercase,
            ...this.characters.numbers,
            ...this.characters.symbols
        ];

        const currentIndex = allChars.indexOf(this.currentChar);
        const nextIndex = (currentIndex + 1) % allChars.length;
        this.selectCharacter(allChars[nextIndex]);
    }

    updateProgress() {
        const total = Object.values(this.characters).flat().length;
        const completed = this.drawnChars.size;

        document.getElementById('progress-count').textContent = completed;
        document.getElementById('total-count').textContent = total;
    }

    updatePreview() {
        const previewText = document.getElementById('preview-text').value;
        const previewOutput = document.getElementById('preview-output');

        if (this.drawnChars.size === 0) {
            previewOutput.textContent = 'Draw some characters first!';
            previewOutput.style.fontFamily = 'inherit';
            return;
        }

        // Create a temporary canvas to render preview
        previewOutput.innerHTML = '';
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = 600;
        previewCanvas.height = 100;
        const previewCtx = previewCanvas.getContext('2d');
        previewCtx.fillStyle = 'white';
        previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

        let x = 10;
        const y = 70;
        const charWidth = 30;

        for (const char of previewText) {
            if (this.drawnChars.has(char)) {
                const imageData = this.drawnChars.get(char);
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = this.canvas.width;
                tempCanvas.height = this.canvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.putImageData(imageData, 0, 0);

                // Draw scaled down version
                previewCtx.drawImage(tempCanvas, x, y - 25, charWidth, charWidth);
                x += charWidth + 5;
            } else if (char === ' ') {
                x += charWidth;
            } else {
                // Draw placeholder for missing characters
                previewCtx.fillStyle = '#ccc';
                previewCtx.fillRect(x, y - 25, charWidth, charWidth);
                x += charWidth + 5;
            }

            if (x > previewCanvas.width - charWidth) break;
        }

        previewOutput.appendChild(previewCanvas);
    }

    async generateAndDownloadFont() {
        if (this.drawnChars.size === 0) {
            alert('Please draw at least one character before generating a font!');
            return;
        }

        const fontName = document.getElementById('font-name').value || 'MyHandFont';

        try {
            // Create a new font
            const notdefGlyph = new opentype.Glyph({
                name: '.notdef',
                unicode: 0,
                advanceWidth: 650,
                path: new opentype.Path()
            });

            const glyphs = [notdefGlyph];

            // Convert each drawn character to a glyph
            for (const [char, imageData] of this.drawnChars.entries()) {
                const glyph = this.imageDataToGlyph(char, imageData);
                glyphs.push(glyph);
            }

            // Create the font
            const font = new opentype.Font({
                familyName: fontName,
                styleName: 'Regular',
                unitsPerEm: 1000,
                ascender: 800,
                descender: -200,
                glyphs: glyphs
            });

            // Download the font
            const arrayBuffer = font.toArrayBuffer();
            const blob = new Blob([arrayBuffer], { type: 'font/ttf' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `${fontName}.ttf`;
            link.click();

            URL.revokeObjectURL(url);

            alert('Font generated successfully!');
        } catch (error) {
            console.error('Error generating font:', error);
            alert('Error generating font. Please try again.');
        }
    }

    imageDataToGlyph(char, imageData) {
        const unicode = char.charCodeAt(0);
        const path = new opentype.Path();

        // Convert image data to path
        // This is a simplified approach - trace the outline of the drawn character
        const width = this.canvas.width;
        const height = this.canvas.height;
        const data = imageData.data;

        // Scale factor to convert canvas coordinates to font units
        const scale = 1000 / height;

        // Sample the image and create a rough path
        const points = [];
        const step = 5; // Sample every 5 pixels for performance

        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const i = (y * width + x) * 4;
                const alpha = data[i + 3];
                const isBlack = data[i] < 128 && alpha > 128;

                if (isBlack) {
                    // Convert to font coordinates (flip Y axis)
                    const fx = x * scale;
                    const fy = (height - y) * scale;
                    points.push({ x: fx, y: fy });
                }
            }
        }

        // Create a simple path by connecting points
        if (points.length > 0) {
            // Group nearby points into strokes
            const strokes = this.groupPointsIntoStrokes(points);

            strokes.forEach(stroke => {
                if (stroke.length > 1) {
                    path.moveTo(stroke[0].x, stroke[0].y);
                    for (let i = 1; i < stroke.length; i++) {
                        path.lineTo(stroke[i].x, stroke[i].y);
                    }
                }
            });
        }

        return new opentype.Glyph({
            name: char,
            unicode: unicode,
            advanceWidth: 650,
            path: path
        });
    }

    groupPointsIntoStrokes(points) {
        if (points.length === 0) return [];

        const strokes = [];
        const threshold = 50; // Distance threshold for grouping
        const visited = new Set();

        for (let i = 0; i < points.length; i++) {
            if (visited.has(i)) continue;

            const stroke = [points[i]];
            visited.add(i);

            let current = points[i];
            let foundNeighbor = true;

            while (foundNeighbor && stroke.length < 100) {
                foundNeighbor = false;
                let nearestDist = threshold;
                let nearestIdx = -1;

                for (let j = 0; j < points.length; j++) {
                    if (visited.has(j)) continue;

                    const dist = Math.sqrt(
                        Math.pow(points[j].x - current.x, 2) +
                        Math.pow(points[j].y - current.y, 2)
                    );

                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearestIdx = j;
                    }
                }

                if (nearestIdx !== -1) {
                    stroke.push(points[nearestIdx]);
                    visited.add(nearestIdx);
                    current = points[nearestIdx];
                    foundNeighbor = true;
                }
            }

            if (stroke.length > 1) {
                strokes.push(stroke);
            }
        }

        return strokes;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FontMaker();
});
