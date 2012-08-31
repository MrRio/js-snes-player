js-snes-player
==============

[Demo](http://MrRio.github.com/js-snes-player/)
----

A prototype for a HTML5 audio player that can emulate the Nintendo SNES. 

How it was done:

1. SPC files are converted to JSON so they can be loaded in
2. The SNES_SPC library (written in C++) is compiled to LLVM, which in turn is compiled to JavaScript, thanks to Emscripten
3. The SPC file is written to a virtual memory pointer and handed to the C++ library
4. The library generates the raw audio which is pushed on to the memory heap
5. We read the audio data from the heap, and push that on to the new HTML5 Web Audio API

Status
------

There's a few performance issues, but there's a basic mono stream working :)

