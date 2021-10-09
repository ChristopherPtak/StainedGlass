
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

    setViewCenterX(x)
    {
        if (typeof x === 'number') {
            this.engine._set_view_center_x(x);
        } else {
            throw TypeError('Argument to setViewX must be a number');
        }
    }

    setViewCenterY(y)
    {
        if (typeof y === 'number') {
            this.engine._set_view_center_y(y);
        } else {
            throw TypeError('Argument to setViewY must be a number');
        }
    }

    setViewScaleX(scale)
    {
        if (typeof scale === 'number') {
            if (scale > 0) {
                this.engine._set_view_scale_x(scale);
            } else {
                throw RangeError('Argument to setViewScaleX must be positive');
            }
        } else {
            throw TypeError('Argument to setViewScaleX must be a number');
        }
    }

    setViewScaleY(scale)
    {
        if (typeof scale === 'number') {
            if (scale > 0) {
                this.engine._set_view_scale_y(scale);
            } else {
                throw RangeError('Argument to setViewScaleY must be positive');
            }
        } else {
            throw TypeError('Argument to setViewScaleY must be a number');
        }
    }

    render()
    {
        const sizeX = window.innerWidth;
        const sizeY = window.innerHeight;

        display.width = sizeX;
        display.height = sizeY;

        /*
         * 1. Pass updated coordinates to rendering engine
         */

        const sizeMin = Math.min(sizeX, sizeY);
        this.engine._set_view_scale_x(this.viewScale * sizeX / sizeMin);
        this.engine._set_view_scale_y(this.viewScale * sizeY / sizeMin);
        this.engine._set_view_center_x(this.viewCenterX);
        this.engine._set_view_center_y(this.viewCenterY);

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
        this.engine._render(sizeX, sizeY, renderBufferPtr);

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

