
FROM emscripten/emsdk as build

WORKDIR /src

COPY Makefile /src
COPY genconstants.sh /src
COPY engine.c /src

RUN make

FROM nginx

WORKDIR /usr/share/nginx/html

COPY index.html /usr/share/nginx/html
COPY style.css /usr/share/nginx/html
COPY driver.js /usr/share/nginx/html
COPY --from=build /src/engine.js /usr/share/nginx/html
COPY --from=build /src/engine.wasm /usr/share/nginx/html

