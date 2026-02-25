# Requirements and installation

To install nRF Connect for Desktop, complete the following steps:

1. Open Nordic Semiconductor's [nRF Connect for Desktop product website](https://www.nordicsemi.com/Software-and-Tools/Development-Tools/nRF-Connect-for-desktop).
2. Scroll to the Downloads section.
3. Download the executable for your operating system.
   See also the list of [Supported operating systems](./os_support.md).
4. Make sure you meet all the [additional requirements](#additional-requirements).
5. Run the executable to install and start the launcher.

You will then see the list of available apps.
See [Installing nRF Connect for Desktop apps](installing_apps.md) and [Launcher overview](https://docs.nordicsemi.com/bundle/nrf-connect-launcher/page/overview_cfd.html) for more information.

All nRF Connect for Desktop applications require the launcher v4.1.0 or later.

!!! info "Tip"

    You can enable the use of Nordic Semiconductor's https://files.nordicsemi.cn/ for installing and updating nRF Connect for Desktop and its apps.
    This server has a better connection in the People's Republic of China.
    Go to the [Settings tab](https://docs.nordicsemi.com/bundle/nrf-connect-launcher/page/overview_cfd.html#mainland-china-server) in nRF Connect for Desktop to enable this option.

## Additional requirements

nRF Connect for Desktop has the following additional requirements:

| Operating system | Prerequisite | Description |
|------------------|--------------|-------------|
| All | [SEGGER J-Link](https://www.segger.com/downloads/jlink/#J-LinkSoftwareAndDocumentationPack) | The latest version tested and recommended by Nordic Semiconductor. nRF Connect for Desktop will notify you about installing the correct J-Link version when you run the launcher. |
| Windows | SEGGER USB Driver for J-Link | Required for support of older Nordic Semiconductor devices. When you install SEGGER J-Link through nRF Connect for Desktop, the driver is automatically installed. For information on how to install the USB Driver manually, see the [nRF Util prerequisites](https://docs.nordicsemi.com/bundle/nrfutil/page/guides/installing.html#prerequisites) documentation. |
| Linux | [nrf-udev](https://github.com/NordicSemiconductor/nrf-udev) | Module with udev rules required to access USB ports on Nordic Semiconductor devices and program the firmware. Download the latest DEB file from [nrf-udev](https://github.com/NordicSemiconductor/nrf-udev) and run `sudo dpkg -i nrf-udev_1.0.1-all.deb` to install it.  |
| Linux | libusb-1.0-0 | Usually comes installed with Ubuntu. You can run `sudo apt install libusb-1.0-0` to install it.  |
| Linux | libfuse2 | Required for Ubuntu v22.04 and above to run `AppImage` applications. You can run `sudo add-apt-repository universe && sudo apt-get update && sudo apt install libfuse2` to install it.  |

!!! note "Note"
     If you don't install the J-Link driver, running the apps will be very limited and you will get error messages `CouldNotFindJprogDLL`, `CouldNotOpenDLL`, `JLINKARM_DLL_NOT_FOUND`, or similar.

## Using behind proxy

To use nRF Connect for Desktop and its applications behind a proxy, see the
[Starting nRF Connect for Desktop with proxy settings](https://docs.nordicsemi.com/bundle/nrf-connect-launcher/page/proxy_settings.html) page.
