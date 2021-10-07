
#include <assert.h>
#include <math.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

#include <emscripten.h>

#define MANDELBROT_MAX_ITER 100

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

void colorize_Grayscale(uint8_t* slice, float value)
{
    slice[0] = value * 255;
    slice[1] = value * 255;
    slice[2] = value * 255;
    slice[3] = 255;
}

void colorize_Blackbody(uint8_t* slice, float value)
{
    // Create a fake blackbody-like color spectrum
    // using a bunch of approximate functions

    float r;
    float g;
    float b;

    if (value < 0.5) {
        // Exponential half
        // Makes the red area larger
        r = 1.2872169 * (1 - exp(-3 * value));
    } else {
        // Normal distribution half
        r = exp(-pow(3 * (value - 0.5), 2));
    }

    // Normal distributions
    g = 0.75 * exp(-pow(5 * (value - 0.66), 2));
    b = exp(-pow(8 * (value - 0.8), 2));

    slice[0] = r * 255;
    slice[1] = g * 255;
    slice[2] = b * 255;
    slice[3] = 255;
}

static float (*eval_Fractal)(double, double) = &eval_Mandelbrot;
static void (*colorize_Method)(uint8_t*, float) = &colorize_Grayscale;

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

void EMSCRIPTEN_KEEPALIVE set_fractal_Mandelbrot(void)
{
    eval_Fractal = &eval_Mandelbrot;
}

void EMSCRIPTEN_KEEPALIVE set_color_Grayscale(void)
{
    colorize_Method = &colorize_Grayscale;
}

void EMSCRIPTEN_KEEPALIVE set_color_Blackbody(void)
{
    colorize_Method = &colorize_Blackbody;
}

void EMSCRIPTEN_KEEPALIVE render(size_t dimx, size_t dimy, uint8_t* array)
{
    size_t i;
    size_t j;

    for (i = 0; i < dimy; ++i) {
        for (j = 0; j < dimx; ++j) {

            double corner_x = center_x - (0.5 * scale_x);
            double corner_y = center_y + (0.5 * scale_y);
            double c_real = corner_x + ((double) j / dimx) * scale_x;
            double c_imag = corner_y - ((double) i / dimy) * scale_y;
            float value = eval_Fractal(c_real, c_imag);

            size_t offset = 4 * ((dimx * i) + j);
            colorize_Method(&array[offset], value);

        }
    }
}

