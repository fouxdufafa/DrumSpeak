import { Request, Response } from 'express';
import * as stream from 'stream';
import * as sphinx from '../drumspeak/sphinx';
/**
 * POST /convert
 * Accepts audio files and returns MIDI drum loops.
 */
const createJsonStream = () => new stream.Transform({
    transform: function (data, encoding, cb) {
        console.log('jsonifying data');
        this.push(JSON.stringify(data, undefined, 4) + '\n');
        cb();
    },
    objectMode: true
});
export let index = (req: Request, res: Response) => {
    const busboy = (req as any).busboy;
    busboy.on('file', function (fieldname: string, file: stream.Readable, filename: string) {
        const speechToText = sphinx.createStreamProcessor(file);
        const jsonify = createJsonStream();
        speechToText.pipe(jsonify).pipe(res);
    });
    busboy.on('finish', function() {
        console.log('Done parsing form');
    });
    req.pipe(busboy);
};
