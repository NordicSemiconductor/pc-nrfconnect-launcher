This Changelog collects changes which we consider not to be relevant enough for
the normal Changelog.md.

E.g. because the change is purely internal and so not visible to the users or
because it is so minor that the users will rarely care about them.

It is still helpful that we collect them, e.g. so that we can check them when
release the new version.

## 4.1.3-pre3

### Changed

-   #850, #865: Support for a custom html-template from the app.

    If the app supplies an `nrfConnectForDesktop.html`-entry in `package.json`,
    this path will instead be used to load the app.

-   #844: Text is select when search field is focused, making it easier to
    replace the current text.
-   #864: Bump device-lib-js to 0.7.0.
-   #871: Add single instance lock.
-   #877: Support React 16 for legacy apps.

### Fixed

-   #851: Proxies with authentication were not handled correctly when multiple
    requests were done at the same time.
-   #852:
    -   Proxy dialogs were outdated.
    -   Multiple, partially misleading dialogs were displayed if users cancelled
        the proxy login.
-   #853:
    -   Add Source dialog:
        -   Trim leading and trailing whitespace from URL.
        -   Dialog style was outdated.
        -   More expressive error messages for typical errors: `source.json` not
            reachable at given URL, source already exists, or trying to add the
            official source.
    -   Name filter for apps: Trim leading and trailing whitespace.
-   #856: Fix shortcuts when different directories were specified.

    To reproduce:

    1. Determine an app (e.g. DTM) which is not installed when running the
       launcher normally, with default directories.
    1. Start the launcher with the options `--user-data-dir` and
       `--apps-root-dir`, e.g. on macOS with
       `--user-data-dir /tmp/nrf_data --apps-root-dir /tmp/nrf_apps`.
    1. The launcher open without any apps installed. Install one and create a
       shortcut to it.
    1. Open the shortcut.

    Previously the app didn't open, instead an error message was shown: “Error
    when starting application – Error: Tried to open app …, but it is not
    installed”. Now the app opens correctly.

### Removed

-   Building the linux version with .tar.gz, now it's only AppImage, the only
    version released.

## 4.1.2

### Changed

-   #834: Send the IPC message `serialport:on-write` only after something was
    written to a serial port.
-   #840: Error dialogs now make it easier to understand if there are multiple
    errors and also can show technical details when a source fails to load.
-   #848: Bumped device-lib-js to 0.6.12.

### Removed

-   #839: Device-lib proxies.

### Fixed

-   #835: Wrong state for when users jumped between launcher versions.

    To reproduce:

    1. Remove the folder ~/.nrfconnect-apps (to start out with a clean,
       controlled state)
    1. Run the launcher 4.1.1. With it install the Programmer app and quit it.
    1. Run the launcher 4.0.1. With it uninstall Programmer and quit it.
    1. Run the launcher 4.1.1.

    Now the launcher showed the Programmer as seemingly installed again but
    launching or uninstalling it did not work.
