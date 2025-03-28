# nRF Connect for Desktop launcher

nRF Connect for Desktop is a cross-platform framework for development applications, available for [Windows, Linux, and macOS](os_support.md).

nRF Connect for Desktop is designed to be used with Nordic Semiconductor development kits and dongles. The apps will detect which kit you connected to your computer and upload the needed firmware.

The following applications are available from nRF Connect for Desktop. All of them share [OS requirements](os_support.md) and [installation instructions](installing_apps.md).

| Application           | Purpose                                                                          | Status |
| --------------------- | -------------------------------------------------------------------------------- | ------ |
| [Bluetooth Low Energy](https://docs.nordicsemi.com/bundle/nrf-connect-ble/page/index.html) | Configure and test Bluetooth Low Energy devices.   | Supported  |
| [Board Configurator](https://docs.nordicsemi.com/bundle/nrf-connect-board-configurator/page/index.html) | Update the board configuration on Nordic Development kits.   | Experimental  |
| [Cellular Monitor](https://docs.nordicsemi.com/bundle/nrf-connect-cellularmonitor/page/index.html) | Cross-platform tool for Nordic Semiconductor nRF91 Series devices. It is used for capturing and analyzing modem traces to evaluate communication and view network parameters. Cellular Monitor replaced LTE Link Monitor and Trace Collector apps.  | Supported |
| [Direct Test Mode](https://docs.nordicsemi.com/bundle/nrf-connect-direct-test-mode/page/index.html)  | Perform RF PHY testing of Bluetooth Low Energy devices with the Bluetooth specified Direct Test Mode. | Supported |
| [nPM PowerUP](https://docs.nordicsemi.com/bundle/nrf-connect-npm/page/index.html) | Profile your battery and generate a battery model.   | Supported  |
| [Power Profiler](https://docs.nordicsemi.com/bundle/nrf-connect-ppk/page/index.html) | Measure the real-time power consumption of your designs. | Supported |
| [Programmer](https://docs.nordicsemi.com/bundle/nrf-connect-programmer/page/index.html) | Program firmware to Nordic Semiconductor devices and inspect memory layout.  | Supported |
| [Quick Start](https://docs.nordicsemi.com/bundle/nrf-connect-quickstart/page/index.html) | Set up and install software when starting your work with Nordic Semiconductor devices.  | Supported |
| [RSSI Viewer](https://docs.nordicsemi.com/bundle/nrf-connect-rssi-viewer/page/index.html)  | Visualize dBm per frequency in the 2400-2480 MHz range.   | Supported  |
| [Serial Terminal](https://docs.nordicsemi.com/bundle/nrf-connect-serial-terminal/page/index.html)  | Cross-platform terminal emulator for serial port communications with Nordic Semiconductor devices over Universal Asynchronous Receiver/Transmitter (UART).  | Supported |
| [Toolchain Manager](https://docs.nordicsemi.com/bundle/ncs-2.9.1/page/nrf/installation/install_ncs.html#installation_with_toolchain_manager)  | Install and manage tools to develop with the nRF Connect SDK v2.9.1 or earlier.  | Deprecated: does not support the nRF Connect SDK v3.0.0 and later. Use [nRF Connect for Visual Studio Code or command line](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/installation/install_ncs.html) instead.   |

## Application source code

The code of the application is open source and [available on GitHub](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher).
Feel free to fork the repository and clone it for secondary development or feature contributions.
