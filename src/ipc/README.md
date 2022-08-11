The folder `src/ipc/` is meant as a middle layer between the main and renderer
processes.

Some of the code here should be called from the main process, usually to
register IPC handlers. Other code here should be called from the renderer
process(es), usually the ones to send IPC messages. They are both kept together
to keep them in sync, especially that the channel names and the shape of the
messages are the same.

To signify from which process a function is meant to be called, their name
should have an appropriate postfix. E.g. call name `registerHandlerFromRenderer`
or `sendFromMain`.

The code here should neither reference any code in `src/main/` nor in
`src/launcher/`. If we see the need for it (e.g. because the messages are meant
to be also called from apps), then it should be possible to move the code from
here to `shared`.
