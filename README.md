# nRF Connect for Desktop

[![Build Status](https://dev.azure.com/NordicSemiconductor/Wayland/_apis/build/status/pc-nrfconnect-launcher?branchName=master)](https://dev.azure.com/NordicSemiconductor/Wayland/_build/latest?definitionId=8&branchName=master)
[![License](https://img.shields.io/badge/license-Modified%20BSD%20License-blue.svg)](LICENSE)

nRF Connect for Desktop is a cross-platform framework for desktop apps for development kits or dongles from Nordic Semiconductor. The framework provides a launcher and the general layout for selecting devices, navigation menus, logging, etc. Apps can decorate the standard components and use built-in libraries in order to create end-user tools.

## Supported Platforms

While it may vary in individual apps, nRF Connect for Desktop aims to support all official Nordic Semiconductor development kits and dongles from these series:

* nRF51
* nRF52
* nRF53
* nRF91

You can run nRF Connect for Desktop on:

* Windows
* Ubuntu Linux 64-bit
* macOS

## Using nRF Connect for Desktop

### Prerequisites

#### macOS and Linux

J-Link driver needs to be separately installed on macOS and Linux. Download and install it from [SEGGER](https://www.segger.com/downloads/jlink) under the section *J-Link Software and Documentation Pack*. Without it when running the apps you would otherwise get error messages when running the apps like `CouldNotFindJprogDLL`, `CouldNotOpenDLL` or `JLINKARM_DLL_NOT_FOUND`.

##### Linux only

In order to access Nordic USB devices with correct permissions *udev* rules need to be set up once. For this purpose [nrf-udev](https://github.com/NordicSemiconductor/nrf-udev) repository has been created, follow instructions there.

### Installation

Download binaries from the [nRF Connect for Desktop product page](https://www.nordicsemi.com/Software-and-Tools/Development-Tools/nRF-Connect-for-desktop) on Nordic Semiconductor web pages.

### Running

When starting nRF Connect for Desktop a central launcher is shown. It enables you to install, update and launch the individual apps. Currently provided by Nordic Semiconductor are:

* [Bluetooth Low Energy](https://github.com/NordicSemiconductor/pc-nrfconnect-ble)
* [Power Profiler](https://github.com/NordicSemiconductor/pc-nrfconnect-ppk)
* [Programmer](https://github.com/NordicSemiconductor/pc-nrfconnect-programmer)
* [RSSI Viewer](https://github.com/NordicSemiconductor/pc-nrfconnect-rssi)
* [LTE Link Monitor](https://github.com/NordicSemiconductor/pc-nrfconnect-linkmonitor)
* [Getting Started Assistant](https://github.com/NordicSemiconductor/pc-nrfconnect-gettingstarted)
* [Trace Collector](https://github.com/NordicSemiconductor/pc-nrfconnect-tracecollector)

[Further documentation on some apps is provided in the Nordic Semiconductor Infocenter](https://infocenter.nordicsemi.com/topic/struct_nrftools/struct/nrftools_nrfconnect.html).

### Proxy settings

To use behind a proxy, see [proxy settings](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/blob/master/doc/proxy-settings.md).

## Developing

See the [documentation about how to do core development](https://nordicsemiconductor.github.io/pc-nrfconnect-docs/core_development) on the project [`pc-nrfconnect-docs`](https://github.com/NordicSemiconductor/pc-nrfconnect-docs/) on how to develop the core of the nRF Connect for Desktop framework.

## Feedback

Please report issues on the [DevZone](https://devzone.nordicsemi.com) portal.

## Contributing

See the [infos on contributing](https://nordicsemiconductor.github.io/pc-nrfconnect-docs/contributing) for details.

## License

See the [LICENSE](LICENSE) file for details.
