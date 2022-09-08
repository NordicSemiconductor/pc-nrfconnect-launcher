The folder `src/ipc/` is meant as a middle layer between the main and renderer
processes.

Some of the code here should be called from the main process, usually to
register IPC handlers. Other code here should be called from the renderer
process(es), usually the ones to send IPC messages. They are both kept together
to keep them in sync, especially that the channel names and the shape of the
messages are the same.

## Code conventions

There are a few special conventions we follow with the code here in `src/ipc/`:

-   In each file there are pairs of functions: One to send a message over an IPC
    channel (e.g. `sendStartUpdateFromRender`) and another to register a handler
    for the messages on that same channel (e.g.
    `registerStartUpdateHandlerFromMain`).

-   The functions follow certain naming conventions:

    -   The function to register a handler is called `register…Handler…`, the
        function to send a message over the IPC channel is named according to
        how the message is send. It is named:

        -   `send…` if it sends a one-way message (using
            `ipc{Renderer,main}.send`).
        -   `invoke…` if it sends an asynchronous two-way message (using
            `ipcRenderer.invoke`), returning a `Promise`.
        -   (should be avoided:) `sendSync…` if it sends a synchronous two-way
            message (using `ipcRenderer.sendSync`).

    -   To signify from which process a function is meant to be called, their
        name must have an appropriate postfix `FromRenderer` or `FromMain`.

    -   If in a file only a single channel is defined, then the two functions
        are simply called e.g. `sendFromRenderer` (for a one-way message) and
        `registerHandlerFromMain`. If there are multiple channels, the function
        names are appropriatly longer, e.g. `sendStartUpdateFromRender` and
        `sendCancelUpdateFromRender` as well as
        `registerStartUpdateHandlerFromMain` and
        `registerCancelUpdateHandlerFromMain`.

-   The code here in `src/ipc/` must neither reference any code in `src/main/`
    nor in `src/launcher/`. If we see the need for it (e.g. because the messages
    are meant to be also called from apps), then it should be possible to move
    the code from here to `shared`.
