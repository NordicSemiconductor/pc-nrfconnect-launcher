/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import AppTransport from '../appTransport';

describe('AppTransport', () => {
    it('should throw error if onLogEntry is not provided to constructor', () => {
        expect(() => new AppTransport({})).toThrow();
    });

    it('should include message in log entry', () => {
        const onLogEntry = jest.fn();
        const appTransport = new AppTransport({ onLogEntry });
        const message = 'Foobar message';

        appTransport.log('info', message, {}, () => {});

        expect(onLogEntry).toHaveBeenCalledWith(expect.objectContaining({
            message,
        }));
    });

    it('should include meta in log entry', () => {
        const onLogEntry = jest.fn();
        const appTransport = new AppTransport({ onLogEntry });
        const meta = { foo: 'bar' };

        appTransport.log('info', '', meta, () => {});

        expect(onLogEntry).toHaveBeenCalledWith(expect.objectContaining({
            meta,
        }));
    });

    it('should include level in log entry', () => {
        const onLogEntry = jest.fn();
        const appTransport = new AppTransport({ onLogEntry });

        appTransport.log('info', '', {}, () => {});

        expect(onLogEntry).toHaveBeenCalledWith(expect.objectContaining({
            level: 'info',
        }));
    });

    it('should include time in log entry', () => {
        const onLogEntry = jest.fn();
        const appTransport = new AppTransport({ onLogEntry });

        appTransport.log('info', '', {}, () => {});

        expect(onLogEntry.mock.calls[0][0].time).toBeInstanceOf(Date);
    });

    it('should increment the log entry id', () => {
        const onLogEntry = jest.fn();
        const appTransport = new AppTransport({ onLogEntry });

        appTransport.log('info', '', {}, () => {});
        appTransport.log('info', '', {}, () => {});
        appTransport.log('info', '', {}, () => {});

        expect(onLogEntry.mock.calls[0][0].id).toEqual(0);
        expect(onLogEntry.mock.calls[1][0].id).toEqual(1);
        expect(onLogEntry.mock.calls[2][0].id).toEqual(2);
    });

    it('should invoke the provided callback function when log completed', () => {
        const onLogEntry = jest.fn();
        const onLogDone = jest.fn();
        const appTransport = new AppTransport({ onLogEntry });

        appTransport.log('info', '', {}, onLogDone);

        expect(onLogDone).toHaveBeenCalledWith(null, true);
    });
});
