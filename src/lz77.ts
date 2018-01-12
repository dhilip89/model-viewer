// Nintendo DS LZ77 (LZ10) format.

// Header (8 bytes):
//   Magic: "LZ77\x10" (5 bytes)
//   Uncompressed size (3 bytes, little endian)
// Data:
//   Flags (1 byte)
//   For each bit in the flags byte, from MSB to LSB:
//     If flag is 1:
//       LZ77 (2 bytes, big endian):
//         Length: bits 0-3
//         Offset: bits 4-15
//         Copy Length+3 bytes from Offset back in the output buffer.
//     If flag is 0:
//       Literal: copy one byte from src to dest.

import { assert, readString } from './util';

export function isLZ77(srcBuffer: ArrayBuffer) {
    const srcView = new DataView(srcBuffer);
    return (readString(srcBuffer, 0x00, 0x05) === 'LZ77\x10');
}

export function decompress(srcBuffer: ArrayBuffer) {
    const srcView = new DataView(srcBuffer);
    assert(readString(srcBuffer, 0x00, 0x05) === 'LZ77\x10');

    let uncompressedSize = srcView.getUint32(0x04, true) >> 8;
    const dstBuffer = new Uint8Array(uncompressedSize);

    let srcOffs = 0x08;
    let dstOffs = 0x00;

    while (true) {
        const commandByte = srcView.getUint8(srcOffs++);
        let i = 8;
        while (i--) {
            if (commandByte & (1 << i)) {
                const tmp = srcView.getUint16(srcOffs, false);
                srcOffs += 2;

                const windowOffset = (tmp & 0x0FFF) + 1;
                let windowLength = (tmp >> 12) + 3;

                let copyOffs = dstOffs - windowOffset;

                uncompressedSize -= windowLength;
                while (windowLength--)
                    dstBuffer[dstOffs++] = dstBuffer[copyOffs++];
            } else {
                // Literal.
                uncompressedSize--;
                dstBuffer[dstOffs++] = srcView.getUint8(srcOffs++);
            }

            if (uncompressedSize <= 0)
                return dstBuffer.buffer;
        }
    }
}

export function maybeDecompress(srcBuffer: ArrayBuffer) {
    if (isLZ77(srcBuffer))
        return decompress(srcBuffer);
    else
        return srcBuffer;
}
