
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

#include <emscripten.h>

#define MANDELBROT_MAX_ITER 50

/*
 * Internal rendering functions and state
 * Not to be exported by Emscripten
 */

static double posx  = 0.0000;
static double posy  = 0.0000;
static double scale = 1.0000;

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

/*
 * Public interface
 */

void EMSCRIPTEN_KEEPALIVE set_view_x(double x)
{
    posx = x;
}

void EMSCRIPTEN_KEEPALIVE set_view_y(double y)
{
    posy = y;
}

void EMSCRIPTEN_KEEPALIVE set_view_scale(double s)
{
    scale = s;
}

void EMSCRIPTEN_KEEPALIVE render(size_t dimx, size_t dimy, uint8_t* array)
{
    size_t i;
    size_t j;

    for (i = 0; i < dimx; ++i) {
        for (j = 0; j < dimy; ++j) {

            size_t offset = 4 * ((dimx * i) + j);
            float c_real = posx + ((float) j / dimx) * scale;
            float c_imag = posy - ((float) i / dimy) * scale;
            uint8_t value = 255 * eval_Mandelbrot(c_real, c_imag);

            array[offset + 0] = value;
            array[offset + 1] = value;
            array[offset + 2] = value;
            array[offset + 3] = 255;

        }
    }
}

