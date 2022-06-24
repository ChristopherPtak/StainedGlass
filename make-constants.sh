#!/bin/sh

filename=constants

echo '/* AUTOMATICALLY GENERATED, DO NOT EDIT */' > $filename.h
echo '/* AUTOMATICALLY GENERATED, DO NOT EDIT */' > $filename.js

make_enum()
{
    enum_name="$1"
    counter=1

    echo "enum $enum_name {" >> $filename.h

    for element in $(echo "$@" | cut -d' ' -f2-)
    do
        echo "    $element = $counter," >> $filename.h
	echo "const $element = $counter;" >> $filename.js

        counter=$(($counter + 1))
    done

    echo "};" >> $filename.h
}

make_enum FractalType FRACTAL_MANDELBROT FRACTAL_BURNING_SHIP
make_enum ColorMethod COLOR_GRAYSCALE COLOR_BLACKBODY COLOR_RAINBOW

