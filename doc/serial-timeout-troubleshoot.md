# Troubleshooting "serial timeout" errors

Several nRF Connect Desktop applications use serial ports to communicate with
development kits and dongles. nRF Connect Desktop also uses serial ports to
perform DFU (Device Firmware Update) when a devkit/dongle is running a
[DFU bootloader](http://infocenter.nordicsemi.com/topic/com.nordic.infocenter.sdk5.v15.0.0/sdk_app_serial_dfu_bootloader.html?cp=4_0_0_4_3_4).

Serial ports might be [UARTs](http://infocenter.nordicsemi.com/topic/com.nordic.infocenter.nrf52840.ps/uart.html?cp=2_0_0_5_32)
on the devkits connected to a RS-232 port on a computer,
or they might be emulated through USB CDC ACM (also known as "Virtual COM port",
"serial over USB" or other names). The latter happens when using
[USB CDC ACM on the IMCU](http://infocenter.nordicsemi.com/topic/com.nordic.infocenter.nrf52/dita/nrf52/development/preview_dev_kit/vir_com_port.html?cp=2_1_5_4_1),
or when using the [USB functionality from the Nordic SDK](http://infocenter.nordicsemi.com/topic/com.nordic.infocenter.sdk5.v15.0.0/lib_usbd_class_cdc.html?cp=4_0_0_3_51_8_3)
on SoCs that implement USB (e.g. the nRF52840).

While serial ports are ubiquitous, serial port transport lacks any protocol
metadata or capabilities for request-response higher-level protocols. Combined
with the fact that modern desktop operating systems still allow for legacy
serial ports, this can trigger timeouts.

This document collects some known scenarios and workarounds for these timeout
errors.

# Scenarios where these errors happen


## DevKit/dongle not running bootloader

When using a nRF52840 devkit/dongle and performing a DFU operation with
nRF Connect Desktop, a `Timeout while reading from serial transport.` error shows up.

When using a nRF52840 devkit/dongle and performing a DFU operation with
[nrfutil](https://github.com/NordicSemiconductor/pc-nrfutil/), an error like
`TypeError: 'NoneType' object is not iterable` or `IndexError: list index out of range`
shows up.

When performing a DFU operation, nrfutil *assumes* that the serial port
specified is a devkit/dongle already in bootloader mode. nRF Connect Desktop (and
the underlying [`nrf-device-setup-js`](https://github.com/NordicSemiconductor/nrf-device-setup-js) library)
will try to perform a [DFU trigger](http://infocenter.nordicsemi.com/topic/com.nordic.infocenter.sdk5.v15.0.0/lib_dfu_trigger_usb.html)
first, but the DFU trigger might fail due to other reasons.

In either case, the firmware in the nRF SoC is receiving DFU data through the
serial port, but is not understanding it, and it's not replying to it.

#### Workaround

Ensure that the devkit/dongle is in bootloader mode.

- For nRF52840 dongles:
    - Press the reset button. The red LED should be pulsing, indicating the nRF device is in DFU bootloader mode.
    - Perform the DFU operation again.

- For nRF52840 development kits:
    - Unplug the devkit's USB connector marked "nRF USB".
    - Connect a USB cable to the USB connector for the [Interface MCU](http://infocenter.nordicsemi.com/topic/com.nordic.infocenter.nrf52/dita/nrf52/development/nrf52840_pdk/if_mcu.html).
    - Use nRF Connect Desktop Programmer to program it with bootloader firmware known to work.
    - Reconnect the cable to the USB connector marked "nRF USB".
    - Perform the DFU operation again.

## Windows 7 drivers

Windows 8/10, macOS and all major Linux flavours include kernel drivers for USB CDC ACM.
Windows 7 (and previous), however, does not.

The normal case is that the Win7 drivers provided with the nRF Connect Desktop
installer will work without any further user interaction. However, it is possible
that the Windows 7 drivers have a conflict with already-installed drivers.
This leads to problems such as:

- Applications for nRF Connect Desktop fail to detect a serial port in a nRF Device.
- Timeouts when opening/closing a serial port.
- The serial port closes after *one* call to read/write data from/to the port is made.

The main symptom of a mismatched Windows 7 driver is that any problem with the
serial port in the devkit/dongle is not reproducible in a computer with a different
operating system.

#### Workaround

[Download the latest installer for the nRF Connect Desktop](https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/releases)
and run it. The installer includes the needed USB CDC ACM drivers.

If that fails, [remove any nRF USB CDC ACM drivers](https://docs.microsoft.com/en-us/windows-hardware/drivers/install/using-device-manager-to-uninstall-devices-and-driver-packages),
then run the installer again.

If that fails, make sure to uninstall any unattached USB CDC ACM devices. Do
that by following the instructions linked in the step above, but enabling the
"show hidden devices" option in the "View" menu of the Device Manager.
Alternatively, use a tool like
[Device Cleanup Tool](https://www.uwe-sieber.de/misc_tools_e.html) to do the
same. Then, run the installer again.

If that still fails, use the [Zadig tool](https://zadig.akeo.ie/) to ensure that
the `usbser.sys` driver is attached to the corresponding USB CDC ACM interface
from the nRF device.
