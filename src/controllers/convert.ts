import { Request, Response } from 'express';
/**
 * POST /convert
 * Accepts audio files and returns MIDI drum loops.
 */
export let index = (req: Request, res: Response) => {
    const busboy = (req as any).busboy;
    busboy.on('file', function (fieldname: string, file: NodeJS.ReadableStream, filename: string) {
        // validate audio file
        // resample if needed
        // send file to speech-to-text
        const message = 'Received file "' + filename + '"';
        console.log(message);
        res.status(200);
        res.send(message);
    });
    busboy.on('finish', function() {
        console.log('Done parsing form');
        res.writeHead(303, { Connection: 'close' });
        res.end();
    });
    req.pipe(busboy);
};
