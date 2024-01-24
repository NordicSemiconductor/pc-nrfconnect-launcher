# nRF Connect for Desktop launcher

nRF Connect for Desktop is a cross-platform framework for development applications. It contains applications for testing Bluetooth® Low Energy, monitoring LTE links, power optimization, programming, and more.

nRF Connect for Desktop is designed to be used with Nordic Semiconductor development kits and dongles. The apps will detect which kit you connected to your computer and upload the needed firmware.

## Supported operating systems

nRF Connect for Desktop has Tier 1 support for the following platforms:

* Ubuntu 20.04 LTS (x64)
* Windows 10 (x64)
* MacOS 11 (x64, arm64)

In addition, nRF Connect for Desktop has Tier 2 support for Windows 11 (x64), Ubuntu 22.04 (x64), and MacOS 12 (x64, arm64).

??? info "Tier definitions"
    **Tier 1**: The tools will always work. The automated build and automated testing ensure that the tools build and successfully complete tests after each change.

    **Tier 2**: The tools will always build. The automated build ensures that the tools build successfully after each change. There is no guarantee that a build will work because the automation tests do not always run.

    **Tier 3**: The tools are supported by design, but are not built or tested after each change. Therefore, the application may or may not work.

    **Not supported**: The tools do not work, but it may be supported in the future.

    **Not applicable**: The specified architecture is not supported for the respective operating system.

## Available applications

The following applications are available from nRF Connect for Desktop. See [Installing and updating nRF Connect for Desktop apps](installing_apps.md) for information how to install them.

| Application           | Purpose                                                                          | Status |
| --------------------- | -------------------------------------------------------------------------------- | ------ |
| [Bluetooth Low Energy](https://docs.nordicsemi.com/bundle/nrf-connect-ble/page/index.html) | Configure and test Bluetooth Low Energy devices.   | Supported  |
| [Board Configurator](https://docs.nordicsemi.com/bundle/nrf-connect-board-configurator/page/index.html) | Update the board configuration on Nordic Development kits.   | Experimental  |
| [Cellular Monitor](https://docs.nordicsemi.com/bundle/nrf-connect-cellularmonitor/page/index.html) | Cross-platform tool for Nordic Semiconductor nRF91 Series devices. It is used for capturing and analyzing modem traces to evaluate communication and view network parameters. | Supported |
| [Direct Test Mode](https://github.com/NordicSemiconductor/pc-nrfconnect-dtm)  | Perform RF PHY testing of Bluetooth Low Energy devices with the Bluetooth specified Direct Test Mode. | Supported |
| [LTE Link Monitor](https://docs.nordicsemi.com/bundle/nrf-connect-linkmonitor/page/index.html)  | Monitor the modem/link status and activity using AT commands.   | Deprecated  |
| [nPM PowerUP](https://docs.nordicsemi.com/bundle/nan_045/page/APP/nan_045/profiling_npm_powerup.html) | Profile your battery and generate a battery model.   | Supported  |
| [Power Profiler](https://docs.nordicsemi.com/bundle/ug_ppk/page/UG/ppk/PPK_user_guide_Running_the_software.html) | Measure the real-time power consumption of your designs. | Supported |
| [Programmer](https://docs.nordicsemi.com/bundle/nrf-connect-programmer/page/index.html) | Program firmware to Nordic Semiconductor devices and inspect memory layout.  | Supported |
| [Quick Start](https://docs.nordicsemi.com/bundle/nrf-connect-quickstart/page/index.html) | Set up and install software when starting your work with Nordic Semiconductor devices.  | Supported |
| [RSSI Viewer](https://github.com/NordicSemiconductor/pc-nrfconnect-rssi)  | Visualize dBm per frequency in the 2400-2480 MHz range.   | Supported  |
| [Serial Terminal](https://docs.nordicsemi.com/bundle/nrf-connect-serial-terminal/page/index.html)  | Cross-platform terminal emulator for serial port communications with Nordic Semiconductor devices over Universal Asynchronous Receiver/Transmitter (UART).  | Supported |
| [Toolchain Manager](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/installation/install_ncs.html#legacy_installation_with_toolchain_manager)  | Install and manage tools to develop with the nRF Connect SDK.  | Recommended for the nRF Connect SDK v1.9.x and earlier  |
| [Trace Collector](https://docs.nordicsemi.com/bundle/nrf-connect-tracecollector/page/index.html)  | Capture trace files of the nRF9160 modem.   | Deprecated  |

