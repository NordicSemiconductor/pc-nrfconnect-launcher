The folder `src/ipc/` is meant as a middle layer between the main and renderer
processes.

Some of the code here should be called from the main process, usually to
register IPC handlers. Other code here should be called from the renderer
process(es), usually the ones to send IPC messages. They are both kept together
to keep them in sync, especially that the channel names and the shape of the
messages are the same.

## Code conventions

There are a few conventions we follow with the code here in `src/ipc/`:

-   In each file there are pairs of functions: One to send a message over an IPC
    channel (e.g. `checkForUpdate`) and another to register a handler for the
    messages on that same channel (e.g. `registerCheckForUpdate`).

    Usually these two functions utelise a shared signature which is defined in a
    type above them. Usually the functions are defined by invoking functions
    from `infrastructure/mainToRenderer.ts` or
    `infrastructure/rendererToMain.ts` which also use that type.

-   The code here in `src/ipc/` must neither reference any code in `src/main/`
    nor in `src/launcher/`. If we see the need for it (e.g. because the messages
    are meant to be also called from apps), then it should be possible to move
    the code from here to `shared`.
