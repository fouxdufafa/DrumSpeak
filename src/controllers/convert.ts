import { Request, Response } from 'express';
import * as stream from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import * as childProcess from 'child_process';
import * as es from 'event-stream';
import * as sphinx from '../drumspeak/sphinx';
/**
 * POST /convert
 * Accepts audio files and returns MIDI drum loops.
 */
const frequency = 16 * 1000;
const channels = 1;

const createResampler = (file: stream.Readable) => {
    const converter = ffmpeg(file).format('wav');
    const output = new stream.PassThrough();
    return converter.pipe(output);
};

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
        const resampler = createResampler(file);
        const sphinxProc = sphinx.spawn();
        const parser = sphinx.createStreamingParser();
        const jsonify = createJsonStream();
        const speechToText = es.duplex(sphinxProc.stdin, sphinxProc.stdout);
        resampler.pipe(speechToText).pipe(parser).pipe(jsonify).pipe(res);
    });
    busboy.on('finish', function() {
        console.log('Done parsing form');
    });
    req.pipe(busboy);
};
