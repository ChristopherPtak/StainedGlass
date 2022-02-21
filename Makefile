
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

engine.js: engine.c
	$(EMCC) $(EMFLAGS) -o engine.js engine.c

.PHONY: clean
clean:
	-rm -f engine.js engine.wasm

