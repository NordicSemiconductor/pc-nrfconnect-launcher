# Troubleshooting LIBUSB_* errors on win32 platforms

nRF Connect Desktop uses [libusb](https://libusb.info/) and [node-usb](https://github.com/tessel/node-usb) to know how many USB-capable Nordic SoCs (e.g. nRF52840) are connected to your PC, and also to set them into DFU mode when they need to be re-programmed by an nRF Connect Desktop application.

While this makes it easier to develop nRF Connect Desktop applications, it might also cause some errors to show up in some win32 environments. This document collects the known causes and workarounds for these errors.

# Scenarios where these errors happen

## Windows 7 right after installation

A `LIBUSB_ERROR_NOT_FOUND` error shows up when performing the following actions in this exact order:

- Run the nRF Connect Desktop installer.
  - This includes the *rules* for the right drivers, but not the actual link between a USB device and its driver.
- Launch an nRF Connect Desktop application.
- Plug an nRF52840 devkit into a USB port.
- Let Windows 7 attach the right drivers.
  - This uses the *rules* already installed for actually *binding* a driver to the newly-connected nRF USB device.
  - A yellow bubble appears from the system tray, indicating driver installation, like this: 
  ![screenshot](win32-drivers-installing.png)

- A `LIBUSB_ERROR_NOT_FOUND` is shown on the log of the nRF Connect Desktop application.
- After a couple of minutes, Windows 7 finishes binding the libusb driver to the nRF USB device.
  - A yellow bubble appears from the system tray, indicating drivers are ready, like this:
  ![screenshot](win32-drivers-ready.png)

#### Workaround

- Close all programs and processes that might be using nRF USB devices (including nRF Connect Desktop).
- Connect the nRF USB device(s).
- **Wait** until Windows 7 has finished binding the right drivers to the USB device(s).
- Launch nRF Connect Desktop.
