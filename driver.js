
let display = document.getElementById('display');
let context = display.getContext('2d');

let viewCenterX = -0.40;
let viewCenterY =  0.00;
let viewScale   =  2.50;

/*
 * Interface to rendering engine.
 *
 * These functions interact with the compiled WASM to set the desired
 * properties of the rendered image and to convert the rendered output
 * onto the page.
 */

function setViewCenterX(x)
{
    if (typeof x === 'number') {
        Module._set_view_center_x(x);
    } else {
        throw TypeError('Argument to setViewX must be a number');
    }
}

function setViewCenterY(y)
{
    if (typeof y === 'number') {
        Module._set_view_center_y(y);
    } else {
        throw TypeError('Argument to setViewY must be a number');
    }
}

function setViewScaleX(scale)
{
    if (typeof scale === 'number') {
        if (scale > 0) {
            Module._set_view_scale_x(scale);
        } else {
            throw RangeError('Argument to setViewScaleX must be positive');
        }
    } else {
        throw TypeError('Argument to setViewScaleX must be a number');
    }
}

function setViewScaleY(scale)
{
    if (typeof scale === 'number') {
        if (scale > 0) {
            Module._set_view_scale_y(scale);
        } else {
            throw RangeError('Argument to setViewScaleY must be positive');
        }
    } else {
        throw TypeError('Argument to setViewScaleY must be a number');
    }
}

function render()
{
    const sizeX = window.innerWidth;
    const sizeY = window.innerHeight;

    display.width = sizeX;
    display.height = sizeY;

    /*
     * 1. Pass updated coordinates to rendering engine
     */

    Module._set_view_scale_x(viewScale * sizeX / Math.min(sizeX, sizeY));
    Module._set_view_scale_y(viewScale * sizeY / Math.min(sizeX, sizeY));
    Module._set_view_center_x(viewCenterX);
    Module._set_view_center_y(viewCenterY);

    /*
     * 2. Render and display result
     */

    // Get a buffer to pass to the renderer
    const renderBufferSize = sizeX * sizeY * 4;
    const renderBufferPtr = Module._malloc(renderBufferSize);
    let renderBuffer = Module.HEAPU8.subarray(
        renderBufferPtr,
        renderBufferPtr + renderBufferSize
    );

    // Render the entire canvas onto the buffer
    console.time('render');
    Module._render(sizeX, sizeY, renderBufferPtr);
    console.timeEnd('render');

    // Get a buffer to write to the canvas
    let displayBuffer = context.getImageData(0, 0, sizeX, sizeY);
    let displayData = displayBuffer.data;

    // Copy data into the buffer
    for (let i = 0; i < displayData.length; ++i) {
        displayData[i] = renderBuffer[i];
    }

    // Copy buffered data into the canvas
    context.putImageData(displayBuffer, 0, 0);

    // Free the render buffer
    Module._free(renderBufferPtr);
}

/*
 * Navigation and controls.
 *
 * These functions manage drawing and updating the canvas in response to
 * user interactions and events like window size changes.
 */

function zoomIn(pointX, pointY)
{
    viewCenterX += pointX;
    viewCenterY -= pointY;
    viewScale *= 0.5;

    render();
}

function zoomOut()
{
    viewScale *= 2.0;

    if (viewScale >= 4.0) {
        viewCenterX = -0.40;
        viewCenterY =  0.00;
        viewScale   =  4.00;
    }

    render();
}

// Refresh whenever the window is resized
window.onresize = function () {
    render();
};

window.onclick = function (mouseEvent) {
    if (mouseEvent.x < 100 || mouseEvent.x > (display.width - 100) ||
        mouseEvent.y < 100 || mouseEvent.y > (display.height - 100)) {
        // Clicking near the border means zoom out
        zoomOut();
    } else {
        // Otherwise, zoom in on the clicked point
        const pointX = viewScale * (mouseEvent.x / display.width - 0.5);
        const pointY = viewScale * (mouseEvent.y / display.height - 0.5);
        zoomIn(pointX, pointY);
    }
}

// INITIALIZATION
// Run as soon as rendering engine is available
Module.onRuntimeInitialized = function () {
    render();
};

