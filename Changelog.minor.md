This Changelog collects changes which we consider not to be relevant enough for
the normal Changelog.md.

E.g. because the change is purely internal and so not visible to the users or
because it is so minor that the users will rarely care about them.

It is still helpful that we collect them, e.g. so that we can check them when
release the new version.

## 4.1.3-pre

### Fixed

-   #851: Proxies with authentication were not handled correctly when multiple
    requests were done at the same time.
-   #852:
    -   Proxy dialogs were outdated.
    -   Multiple, partially misleading dialogs were displayed if users cancelled
        the proxy login.

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

-   #850: Support for a custom html-template from the app.

    If the app supplies an `html`-entry in `package.json`, this path will
    instead be used to load the app.

-   #835: Wrong state for when users jumped between launcher versions.

    To reproduce:

    1. Remove the folder ~/.nrfconnect-apps (to start out with a clean,
       controlled state)
    1. Run the launcher 4.1.1. With it install the Programmer app and quit it.
    1. Run the launcher 4.0.1. With it uninstall Programmer and quit it.
    1. Run the launcher 4.1.1.

    Now the launcher showed the Programmer as seemingly installed again but
    launching or uninstalling it did not work.
