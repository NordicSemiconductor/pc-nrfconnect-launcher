# Requirements and installation

Download nRF Connect for Desktop's executable from Nordic Semiconductor's [website](https://www.nordicsemi.com/Software-and-Tools/Development-Tools/nRF-Connect-for-desktop).

All nRF Connect for Desktop applications require the launcher v4.1.0 or later.

After installing and starting the launcher, you will see the list of available apps.
See the [Launcher overview](overview_cfd.md) and [Installing nRF Connect for Desktop apps](installing_apps.md) pages for more information.

## Additional requirements

Running nRF Connect for Desktop on macOS and Linux has additional requirements.

### J-Link driver on macOS and Linux

You must install SEGGER J-Link driver separately on macOS and Linux. To do so, download and
install it from [SEGGER](https://www.segger.com/downloads/jlink) under the
section _J-Link Software and Documentation Pack_.

If you don't install the J-Link driver, running the apps will fail and you will get error messages
`CouldNotFindJprogDLL`, `CouldNotOpenDLL`, `JLINKARM_DLL_NOT_FOUND`, or similar.

### udev rules for Linux only

In order to access Nordic USB devices with correct permissions, you must set up _udev_ rules.
To do so, follow the instructions in the [nrf-udev](https://github.com/NordicSemiconductor/nrf-udev)
repository. You need to set up these rules only once.

## Using behind proxy

To use nRF Connect for Desktop and its applications behind a proxy, see the
[proxy settings](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/blob/main/doc/non-mkdocs/proxy-settings.md) page.


