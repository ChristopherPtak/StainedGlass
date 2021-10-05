
#include <stddef.h>

#include <emscripten.h>

void render_Mandelbrot(size_t dimx, size_t dimy, float* array,
                       double posx, double posy, double scale)
{
    size_t i;
    size_t j;

    for (i = 0; i < dimx; ++i) {
        for (j = 0; j < dimy; ++j) {
            array[(dimx * i) + j] = 1.0;
        }
    }
}

