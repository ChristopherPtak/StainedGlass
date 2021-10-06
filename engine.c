
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

#include <emscripten.h>

void render_Mandelbrot(size_t dimx, size_t dimy, uint8_t* array,
                       double posx, double posy, double scale)
{
    size_t i;
    size_t j;

    for (i = 0; i < dimx; ++i) {
        for (j = 0; j < dimy; ++j) {
            size_t offset = 4 * ((dimx * i) + j);
            array[offset + 0] = 0;
            array[offset + 1] = 0;
            array[offset + 2] = 0;
            array[offset + 3] = 255;
        }
    }
}

