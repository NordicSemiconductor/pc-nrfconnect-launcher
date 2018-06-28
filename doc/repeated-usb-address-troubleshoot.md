# Troubleshooting errors due to repeated USB addresses

The USB protocol assigns a unique address to each USB device. This address changes
every time a device is disconnected and connected again; for the nRF52840 dongle
this address also changes every time the dongle resets, including every time its
firmware is updated through DFU.

However, in some combinations of hardware platforms and operating systems these
addresses are reused. This can lead to the applications using USB devices to
be mistaken about which USB device they are communicating with.

In particular, reusing USB addresses on a USB CDC ACM device (e.g. the nRF52840
dongle in bootloader mode) leads to errors regarding opening/closing the serial 
port interface.

Some scenarios and fixes are known, as follows:

# Scenarios where these errors happen

## Windows 7 64-bit and Intel USB 3.0 XHCI controller

Any computer which contains an Intel USB 3.0 XHCI controller running the *default*
system driver for the USB controllers will exhibit this problem.

This includes running Windows 7 on a Dell Latitude E7440/E7450 laptop, as well as on
similar laptop models.

#### Fix

By default, Windows 7 uses an 
[EHCI](https://en.wikipedia.org/wiki/Host_controller_interface_(USB,_Firewire)#Enhanced_Host_Controller_Interface)
driver for the 
[XHCI](https://en.wikipedia.org/wiki/Extensible_Host_Controller_Interface)
hardware. Installing a XHCI driver for the XHCI hardware fixes the issue.

For the particular case of Dell Latitude E7440/E7450 laptops, please visit 
https://www.dell.com/support/home/drivers/driversdetails?driverId=HHMYY
and follow the instructions there.

