# Requirements and installation

Download nRF Connect for Desktop's executable from Nordic Semiconductor's [website](https://www.nordicsemi.com/Software-and-Tools/Development-Tools/nRF-Connect-for-desktop).

All nRF Connect for Desktop applications require the launcher v4.1.0 or later.
See also the list of [Supported operating systems](./os_support.md).

After installing and starting the launcher, you will see the list of available apps.
See the [Launcher overview](overview_cfd.md) and [Installing nRF Connect for Desktop apps](installing_apps.md) pages for more information.

## Additional requirements

Running nRF Connect for Desktop has the following additional requirements:

- **SEGGER J-Link** - Required on all platforms.

    - On Windows, the driver comes bundled with nRF Connect for Desktop.
    - On macOS and Linux, you must install the driver manually. Download the installer for your platform from [SEGGER J-Link Software](https://www.segger.com/downloads/jlink/#J-LinkSoftwareAndDocumentationPack).

     If you don't install the J-Link driver, running the apps will be very limited and you will get error messages `CouldNotFindJprogDLL`, `CouldNotOpenDLL`, `JLINKARM_DLL_NOT_FOUND`, or similar.

- For Linux:

    - **libusb-1.0-0** - Usually comes installed with Ubuntu and you can install it with the following command:

        ```
        sudo apt install libusb-1.0-0
        ```

    - **nrf-udev** - The _udev_ rules are required to access Nordic USB devices with correct permissions. Download the latest DEB file from [nrf-udev](https://github.com/NordicSemiconductor/nrf-udev) and run the following command to install nrf-udev:

        ```
        sudo dpkg -i nrf-udev_1.0.1-all.deb
        ```

    - **libfuse2** - Required for Ubuntu v22.04 and above to run AppImage applications.
      You can install it with the following command:

        ```
        sudo apt install libfuse2
        ```

## Using behind proxy

To use nRF Connect for Desktop and its applications behind a proxy, see the
[Starting nRF Connect for Desktop with proxy settings](./proxy_settings.md) page.
