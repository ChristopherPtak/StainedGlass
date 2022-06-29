
class Block
{
    constructor(minX, minY, maxX, maxY, cornerPointX, cornerPointY)
    {
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
        this.cornerPointX = cornerPointX;
        this.cornerPointY = cornerPointY;
    }

    getDistanceTo(pointX, pointY)
    {
        const a = Math.pow(pointX - this.cornerPointX, 2);
        const b = Math.pow(pointY - this.cornerPointY, 2);
        return Math.sqrt(a + b);
    }
}

class Driver
{
    constructor(display, engine)
    {
        this.display = display;
        this.context = display.getContext('2d');

        this.viewCenterX = -0.4;
        this.viewCenterY =  0.0;
        this.viewScale   =  2.5;

        this.sizeX = 0;
        this.sizeY = 0;
        this.scaleX = 0.0;
        this.scaleY = 0.0;
        this.cornerX = 0.0;
        this.cornerY = 0.0;

        this.blockQueue = [];

        this.engine = engine;
    }

    /*
     * Interface to rendering engine.
     *
     * These functions interact with the compiled WASM to set the desired
     * properties of the rendered image and to convert the rendered output
     * onto the page.
     */

    update()
    {
        this.sizeX = window.innerWidth;
        this.sizeY = window.innerHeight;
        this.sizeMin = Math.min(this.sizeX, this.sizeY);
        this.scaleX = this.viewScale * this.sizeX / this.sizeMin;
        this.scaleY = this.viewScale * this.sizeY / this.sizeMin;
        this.cornerX = this.viewCenterX - (0.5 * this.scaleX);
        this.cornerY = this.viewCenterY + (0.5 * this.scaleY);

        display.width = this.sizeX;
        display.height = this.sizeY;

        this.render();
    }

    render()
    {
        const BLOCK_SIZE = 128;

        const blocksX = Math.ceil(this.sizeX / BLOCK_SIZE);
        const blocksY = Math.ceil(this.sizeY / BLOCK_SIZE);

        let driver = this;
        let blocks = [];

        // Divide the screen space into blocks
        for (let i = 0; i < blocksX; ++i) {
            for (let j = 0; j < blocksY; ++j) {
                blocks.push(new Block(
                    i * BLOCK_SIZE, j * BLOCK_SIZE,
                    (i + 1) * BLOCK_SIZE, (j + 1) * BLOCK_SIZE,
                    this.cornerX + (((i * BLOCK_SIZE) / this.sizeX) * this.scaleX),
                    this.cornerY - (((j * BLOCK_SIZE) / this.sizeY) * this.scaleY)
                ));
            }
        }

        // Sort the blocks by distance to the center
        blocks.sort(function (blockA, blockB) {
            let distA = blockA.getDistanceTo(driver.viewCenterX, driver.viewCenterY);
            let distB = blockB.getDistanceTo(driver.viewCenterX, driver.viewCenterY);
            return (distA > distB) ? -1 : 1;
        });

        // Add all the blocks to the render queue
        this.clearBlockQueue();
        for (let i = 0; i < blocks.length; ++i) {
            this.addBlockToQueue(blocks[i]);
        }
    }

    clearBlockQueue()
    {
        this.blockQueue = [];
    }

    addBlockToQueue(block)
    {
        this.blockQueue.push(block);

        if (this.blockQueue.length == 1) {
            let driver = this;
            setTimeout(function () {
                driver.renderNextBlock();
            });
        }
    }

    renderNextBlock()
    {
        if (this.blockQueue.length !== 0) {
            this.renderBlock(this.blockQueue.pop());
            {
                let driver = this;
                setTimeout(function () {
                    driver.renderNextBlock();
                });
            }
        }
    }

    renderBlock(block)
    {
        // Unpack block
        const minX = block.minX;
        const minY = block.minY;
        const maxX = block.maxX;
        const maxY = block.maxY;

        // Calculate the block dimensions
        const resX = maxX - minX;
        const resY = maxY - minY;

        // Calculate the corner of this block
        const myCornerX = this.cornerX + ((minX / this.sizeX) * this.scaleX);
        const myCornerY = this.cornerY - ((minY / this.sizeY) * this.scaleY);

        // Get a buffer to pass to the renderer
        const renderBufferSize = resX * resY * 4;
        const renderBufferPtr = this.engine._malloc(renderBufferSize);
        let renderBuffer = this.engine.HEAPU8.subarray(
            renderBufferPtr,
            renderBufferPtr + renderBufferSize
        );

        // Render the block into the buffer
        this.engine._render(renderBufferPtr,
                            resX, resY,
                            myCornerX, myCornerY,
                            resX / this.sizeX * this.scaleX,
                            resY / this.sizeY * this.scaleY);

        // Get a buffer to write to the canvas
        let displayBuffer = this.context.getImageData(minX, minY, resX, resY);
        let displayData = displayBuffer.data;

        // Copy data into the buffer
        for (let i = 0; i < displayData.length; ++i) {
            displayData[i] = renderBuffer[i];
        }

        // Copy buffered data into the canvas
        this.context.putImageData(displayBuffer, minX, minY);

        // Free the render buffer
        this.engine._free(renderBufferPtr);
    }

    /*
     * Fractal rendering settings.
     *
     * These functions control setting the color, fractal type, quality,
     * and other options for the rendering engine.
     */

    setMaximumIterations(iterations)
    {
        this.engine._set_maximum_iterations(iterations);
    }

    setEscapeDistance(distance)
    {
        this.engine._set_escape_distance(distance);
    }

    setFractal(fractal)
    {
        this.engine._set_fractal(fractal);
    }

    setColor(color)
    {
        this.engine._set_color(color);
    }

    /*
     * Navigation and controls.
     *
     * These functions manage drawing and updating the canvas in response to
     * user interactions and events like window size changes.
     */

    zoomIn(mouseX, mouseY, amount)
    {
        if (amount < 1) {
            console.error('Invalid zoom amount');
            return;
        }

        const pointX = ((mouseX / this.sizeX) - 0.5) * this.scaleX;
        const pointY = ((mouseY / this.sizeY) - 0.5) * this.scaleY;

        this.viewCenterX += (1 / amount) * pointX;
        this.viewCenterY -= (1 / amount) * pointY;
        this.viewScale *= (1 / amount);

        this.update();
    }

    zoomOut(mouseX, mouseY, amount)
    {
        if (amount < 1) {
            console.error('Invalid zoom amount');
            return;
        }

        const pointX = ((mouseX / this.sizeX) - 0.5) * this.scaleX;
        const pointY = ((mouseY / this.sizeY) - 0.5) * this.scaleY;

        this.viewCenterX += amount * pointX;
        this.viewCenterY += amount * pointY;
        this.viewScale *= amount;

        if (this.viewScale >= 4.0) {
            this.viewCenterX = -0.40;
            this.viewCenterY =  0.00;
            this.viewScale   =  4.00;
        }

        this.update();
    }

}

