/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// Prefer to use the serialport 8 property or fall back to the serialport 7 property
export default serialPort => serialPort?.path || serialPort?.comName;
