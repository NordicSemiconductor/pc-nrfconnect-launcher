# Requirements and installation

To install nRF Connect for Desktop, complete the following steps:

1. Open Nordic Semiconductor's [nRF Connect for Desktop product website](https://www.nordicsemi.com/Software-and-Tools/Development-Tools/nRF-Connect-for-desktop).
2. Scroll to the Downloads section.
3. Download the executable for your operating system.
   See also the list of [Supported operating systems](./os_support.md).
4. Make sure you meet all the [additional requirements](#additional-requirements).
5. Run the executable to install and start the launcher.

You will then see the list of available apps.
See the [Launcher overview](overview_cfd.md) and [Installing nRF Connect for Desktop apps](installing_apps.md) pages for more information.

All nRF Connect for Desktop applications require the launcher v4.1.0 or later.

## Additional requirements

Running nRF Connect for Desktop has the following additional requirements.

### SEGGER J-Link driver

Required on all platforms.

On Windows, the driver comes bundled with nRF Connect for Desktop.

On macOS and Linux, you must install the driver manually.
Download the installer for your platform from [SEGGER J-Link Software](https://www.segger.com/downloads/jlink/#J-LinkSoftwareAndDocumentationPack).
If you don't install the J-Link driver, running the apps will be very limited and you will get error messages `CouldNotFindJprogDLL`, `CouldNotOpenDLL`, `JLINKARM_DLL_NOT_FOUND`, or similar.

### Installing libusb-1.0-0 and nrf-udev on Linux

libusb-1.0-0 usually comes installed with Ubuntu.

nrf-udev can be installed by downloading a DEB file from the [nrf-udev](https://github.com/NordicSemiconductor/nrf-udev) project repository.

The _udev_ rules are required to access Nordic USB devices with correct permissions.
You need to set up these rules only once.

Complete the following steps:

1. Download the latest DEB file from [nrf-udev](https://github.com/NordicSemiconductor/nrf-udev).
2. Run the following command to install nrf-udev:

    ```
    sudo dpkg -i nrf-udev_1.0.1-all.deb
    ```

## Using behind proxy

To use nRF Connect for Desktop and its applications behind a proxy, see the
[Starting nRF Connect for Desktop with proxy settings](./proxy_settings.md) page.
