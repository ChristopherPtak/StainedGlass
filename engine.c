
#include <assert.h>
#include <math.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

#include <emscripten.h>

#define MANDELBROT_MAX_ITER 50

/*
 * Internal rendering functions and state
 * Not to be exported by Emscripten
 */

static double center_x = 0.0000;
static double center_y = 0.0000;
static double scale_x  = 1.0000;
static double scale_y  = 1.0000;

static float eval_Mandelbrot(double c_real, double c_imag)
{
    unsigned int i;
    double z_real = 0.0;
    double z_imag = 0.0;

    for (i = 0; i < MANDELBROT_MAX_ITER; ++i) {

        double tz_real = z_real;
        double tz_imag = z_imag;
        double z_abs;

        z_real = (tz_real * tz_real) - (tz_imag * tz_imag);
        z_imag = 2 * tz_real * tz_imag;

        z_real += c_real;
        z_imag += c_imag;

        z_abs = sqrt((z_real * z_real) + (z_imag * z_imag));
        if (z_abs > 2) {
            float smooth = i - log(log(z_abs) / log(2));
            return smooth / MANDELBROT_MAX_ITER;
        }
    }

    return 0.0;
}

/*
 * Public interface
 */

void EMSCRIPTEN_KEEPALIVE set_view_center_x(double x)
{
    center_x = x;
}

void EMSCRIPTEN_KEEPALIVE set_view_center_y(double y)
{
    center_y = y;
}

void EMSCRIPTEN_KEEPALIVE set_view_scale_x(double sx)
{
    scale_x = sx;
}

void EMSCRIPTEN_KEEPALIVE set_view_scale_y(double sy)
{
    scale_y = sy;
}

void EMSCRIPTEN_KEEPALIVE render(size_t dimx, size_t dimy, uint8_t* array)
{
    size_t i;
    size_t j;

    for (i = 0; i < dimy; ++i) {
        for (j = 0; j < dimx; ++j) {

            size_t offset = 4 * ((dimx * i) + j);

            double corner_x = center_x - (0.5 * scale_x);
            double corner_y = center_y + (0.5 * scale_y);
            double c_real = corner_x + ((double) j / dimx) * scale_x;
            double c_imag = corner_y - ((double) i / dimy) * scale_y;
            uint8_t value = 255 * eval_Mandelbrot(c_real, c_imag);

            array[offset + 0] = value;
            array[offset + 1] = value;
            array[offset + 2] = value;
            array[offset + 3] = 255;

        }
    }
}

