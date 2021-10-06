
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

#include <emscripten.h>

#define MANDELBROT_MAX_ITER 50

static float eval_Mandelbrot(float c_real, float c_imag)
{
    unsigned int i;
    float z_real = 0.0;
    float z_imag = 0.0;

    for (i = 0; i < MANDELBROT_MAX_ITER; ++i) {

        float tz_real = z_real;
        float tz_imag = z_imag;

        z_real = (tz_real * tz_real) - (tz_imag * tz_imag);
        z_imag = 2 * tz_real * tz_imag;

        z_real += c_real;
        z_imag += c_imag;

        if ((z_real * z_real) + (z_imag * z_imag) > 2) {
            return (float) i / MANDELBROT_MAX_ITER;
        }
    }

    return 0.0;
}

void render(size_t dimx, size_t dimy, uint8_t* array,
            double posx, double posy, double scale)
{
    size_t i;
    size_t j;

    for (i = 0; i < dimx; ++i) {
        for (j = 0; j < dimy; ++j) {

            size_t offset = 4 * ((dimx * i) + j);
            float c_real = posx + ((float) i / dimx);
            float c_imag = posy - ((float) j / dimy);
            uint8_t value = 255 * eval_Mandelbrot(c_real, c_imag);

            array[offset + 0] = value;
            array[offset + 1] = value;
            array[offset + 2] = value;
            array[offset + 3] = 255;

        }
    }
}

