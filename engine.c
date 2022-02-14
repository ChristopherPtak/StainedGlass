
#include <assert.h>
#include <math.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

#include <emscripten.h>

#define MANDELBROT_MAX_ITER 100
#define MANDELBROT_ESC_DIST 4

/*
 * Internal rendering functions and state
 * Not to be exported by Emscripten
 */

static float eval_Mandelbrot(double c_real, double c_imag)
{
    unsigned int i;

    double z_real = 0.0;
    double z_imag = 0.0;

    double z2_real = 0.0;
    double z2_imag = 0.0;

    double p;

    // Cardioid checking
    p = sqrt(pow(c_real - 0.25, 2) + pow(c_imag, 2));
    if (c_real <= p - (2 * pow(p, 2)) + 0.25) {
        return 0.0;
    } else if (pow(c_real + 1, 2) + pow(c_imag, 2) <= 0.0625) {
        return 0.0;
    }

    // Escape time calculation
    for (i = 0; i < MANDELBROT_MAX_ITER; ++i) {

        z_imag = 2 * z_real * z_imag + c_imag;
        z_real = z2_real - z2_imag + c_real;

        z2_real = z_real * z_real;
        z2_imag = z_imag * z_imag;

        if (z2_real + z2_imag > MANDELBROT_ESC_DIST) {
            float dist = sqrt(z2_real + z2_imag);
            float smooth = i - log(log(dist) / log(2));
            return smooth / MANDELBROT_MAX_ITER;
        }
    }

    return 0.0;
}

void colorize_Grayscale(uint8_t* slice, float value)
{
    float adjusted = pow(value, 0.6);
    slice[0] = adjusted * 255;
    slice[1] = adjusted * 255;
    slice[2] = adjusted * 255;
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

void EMSCRIPTEN_KEEPALIVE render(uint8_t *array, size_t dimx, size_t dimy,
                                 double corner_x, double corner_y,
                                 double scale_x, double scale_y)
{
    size_t i;
    size_t j;

    for (i = 0; i < dimy; ++i) {
        for (j = 0; j < dimx; ++j) {

            double c_real = corner_x + ((double) j / dimx) * scale_x;
            double c_imag = corner_y - ((double) i / dimy) * scale_y;
            float value = eval_Fractal(c_real, c_imag);

            size_t offset = 4 * ((dimx * i) + j);
            colorize_Method(&array[offset], value);

        }
    }
}

