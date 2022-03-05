
# Fractal Viewer

_A browser-based fractal explorer application_

## Usage

### Navigation

There are currently two ways to zoom in and out. Clicking on any spot will
cause the screen to zoom in on that spot, while clicking close to the edge of
the screen will zoom out from the center. Alternatively, scrolling in or out
will zoom in or out centered on the mouse pointer.

### Rendering Settings

The sidebar contains dropdowns for all relevant settings regarding fractal
rendering and display. Clicking in the sidebar will not move the view, so the
dropdowns can be used normally. Changing any setting will trigger a re-render
of the whole screen.

- Fractal: Choose from various fractals, mostly in the Mandelbrot family.
- Color Scheme: Colorize the normally grayscale fractals using a number of
  different color palattes.
- Quality: Controls various low level rendering quality parameters.

## Installation

### Prerequisites

This repository has all the static web files needed for the web interface
except for the Javascript/WASM. These must be compiled using Emscripten.

### Build

The provided `Makefile` has the necessary `emcc` command to compile the
rendering engine. You can either install the Emscripten SDK and run `make`
to compile the engine, or use the `emsdk` docker image with a command like
the following.

```
docker run --rm -v $(pwd):/src -u $(id -u):$(id -g) emscripten/emsdk make
```

When the rendering engine has been compiled a web server can simply serve
the files in this directory to give access to the web interface. For an easy
start, running `python3 -m http.server` in the repository will serve the
web interface on `http://localhost:8000`, where it can be visited in the
browser.
