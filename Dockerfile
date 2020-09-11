FROM emscripten/emsdk:2.0.3

# Enable detection of running in a container
ENV RUNNING_IN_CONTAINER=true

RUN apt-get update \
  && apt-get install -qqy \
    build-essential \
    prelink \
    autoconf \
    libtool \
    texinfo \
    pkgconf \
    # needed for building libvips from source
    gtk-doc-tools \
    libglib2.0-dev \
    gobject-introspection \
    # needed for Meson
    ninja-build \
    python3-pip \
  && pip3 install meson
