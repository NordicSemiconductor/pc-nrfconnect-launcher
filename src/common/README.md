The folder `src/common` is meant for code shared between the main and renderer
processes, excluding IPC code (for which the folder `src/ipc` exists).

The convention is, that this code here can be called from anywhere, but this
code here must not reference code in any other folder (neither `src/main`, nor
`src/app`, nor `src/launcher` , nor `src/ipc`). Type imports are fine, though.
