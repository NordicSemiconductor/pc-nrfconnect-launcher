The folder `src/ipc/` is meant as a middle layer between the main and renderer
processes.

It is similar to `ipc/` in shared and also uses code from there, so also look at
the documentation of that folder, esp. regarding the code conventions:
https://github.com/NordicSemiconductor/pc-nrfconnect-shared/blob/main/ipc/README.md

Some of the code here should be called from the main process, usually to
register IPC handlers. Other code here should be called from the renderer
process(es), usually the ones to send IPC messages. They are both kept together
to keep them in sync, especially that the channel names and the shape of the
messages are the same.

One code conventions is slightly different because of the different code layout:
The code here in `src/ipc/` must neither reference any code in `src/main/`, in
`src/app/`, nor in `src/launcher/`.
