
/*
 * Interface to rendering engine.
 *
 * These functions interact with the compiled WASM to set the desired
 * properties of the rendered image and to convert the rendered output
 * onto the page.
 */

class Driver
{
    constructor(display, engine)
    {
        this.display = display;
        this.context = display.getContext('2d');

        this.viewCenterX = -0.40;
        this.viewCenterY =  0.00;
        this.viewScale   =  2.50;

        this.engine = engine;
    }

    render()
    {
        const sizeX = window.innerWidth;
        const sizeY = window.innerHeight;

        display.width = sizeX;
        display.height = sizeY;

        /*
         * 1. Calculate coordinates to render
         */

        const sizeMin = Math.min(sizeX, sizeY);
        const scaleX = this.viewScale * sizeX / sizeMin;
        const scaleY = this.viewScale * sizeY / sizeMin;
        const centerX = this.viewCenterX;
        const centerY = this.viewCenterY;

        /*
         * 2. Render and display result
         */

        // Get a buffer to pass to the renderer
        const renderBufferSize = sizeX * sizeY * 4;
        const renderBufferPtr = this.engine._malloc(renderBufferSize);
        let renderBuffer = this.engine.HEAPU8.subarray(
            renderBufferPtr,
            renderBufferPtr + renderBufferSize
        );

        // Render the entire canvas onto the buffer
        this.engine._render(sizeX, sizeY, renderBufferPtr,
                            centerX, centerY, scaleX, scaleY);

        // Get a buffer to write to the canvas
        let displayBuffer = this.context.getImageData(0, 0, sizeX, sizeY);
        let displayData = displayBuffer.data;

        // Copy data into the buffer
        for (let i = 0; i < displayData.length; ++i) {
            displayData[i] = renderBuffer[i];
        }

        // Copy buffered data into the canvas
        this.context.putImageData(displayBuffer, 0, 0);

        // Free the render buffer
        this.engine._free(renderBufferPtr);
    }

    /*
     * Navigation and controls.
     *
     * These functions manage drawing and updating the canvas in response to
     * user interactions and events like window size changes.
     */

    zoomIn(mouseX, mouseY)
    {
        const pointX = this.viewScale * (mouseX / this.display.width - 0.5);
        const pointY = this.viewScale * (mouseY / this.display.height - 0.5);

        this.viewCenterX += pointX;
        this.viewCenterY -= pointY;
        this.viewScale *= 0.5;

        this.render();
    }

    zoomOut()
    {
        this.viewScale *= 2.0;

        if (this.viewScale >= 4.0) {
            this.viewCenterX = -0.40;
            this.viewCenterY =  0.00;
            this.viewScale   =  4.00;
        }

        this.render();
    }

}

