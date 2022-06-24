
##
## This Makefile assumes the Emscripten SDK is visible.
## The SDK can be exposed by sourcing the "emsdk_env.sh" script
## provided with the Emscripten SDK before running "make".
##

EMCC = emcc

EMFLAGS += -O2 -DNDEBUG
EMFLAGS += -s 'EXPORTED_FUNCTIONS=["_malloc", "_free"]'
EMFLAGS += -s 'EXPORT_NAME="Engine"'
EMFLAGS += -s 'MODULARIZE=1'

.PHONY: all
all: engine.js

engine.js: engine.c constants.h
	$(EMCC) $(EMFLAGS) -o engine.js engine.c

constants.h: make-constants.sh
	$(SHELL) make-constants.sh

.PHONY: clean
clean:
	-rm -f engine.js engine.wasm constants.h constants.js

