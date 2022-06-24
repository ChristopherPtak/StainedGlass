#!/bin/sh

filename=constants

echo '/* AUTOMATICALLY GENERATED, DO NOT EDIT */' > $filename.h
echo '/* AUTOMATICALLY GENERATED, DO NOT EDIT */' > $filename.js

generate_enum()
{
    enum_name="$1"
    counter=1

    echo >> $filename.js

    echo >> $filename.h
    echo "enum $enum_name {" >> $filename.h

    for element in $(echo "$@" | cut -d' ' -f2-)
    do
        echo "    ${enum_name}_${element} = $counter," >> $filename.h
	echo "const ${enum_name}_${element} = $counter;" >> $filename.js
        counter=$(($counter + 1))
    done

    echo "};" >> $filename.h
}

generate_enum FractalType MANDELBROT BURNING_SHIP
generate_enum ColorMethod GRAYSCALE BLACKBODY RAINBOW

