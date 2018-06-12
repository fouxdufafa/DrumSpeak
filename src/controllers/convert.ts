import { Request, Response } from 'express';
import * as stream from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import * as childProcess from 'child_process';
import * as es from 'event-stream';
/**
 * POST /convert
 * Accepts audio files and returns MIDI drum loops.
 */
const frequency = 16 * 1000;
const channels = 1;

interface Utterance {
    text: string;
    type: 'word' | 'silence';
    start: number;
    end: number;
}

const createResampler = (file: stream.Readable) => {
    const converter = ffmpeg(file).format('wav');
    const output = new stream.PassThrough();
    return converter.pipe(output);
};

const spawnSphinx = () => {
    const sphinx = childProcess.spawn('pocketsphinx_continuous', [
        '-infile', '/dev/stdin',
        '-time', 'yes'
    ]);
    sphinx.stdout.setEncoding('utf8');
    return sphinx;
};

const createSphinxParser = () => {
    return new stream.Transform({
        transform: function (data) {
            // regex split utterances
        },
        objectMode: true
    });
};

export let index = (req: Request, res: Response) => {
    const busboy = (req as any).busboy;
    busboy.on('file', function (fieldname: string, file: stream.Readable, filename: string) {
        const resampler = createResampler(file);
        const sphinx = spawnSphinx();
        const parser = createSphinxParser();
        sphinx.on('exit', () => {
            res.status(200);
            res.end();
        });
        const speechToText = es.duplex(sphinx.stdin, sphinx.stdout);
        resampler.pipe(speechToText).pipe(parser).pipe(res);
    });
    busboy.on('finish', function() {
        console.log('Done parsing form');
    });
    req.pipe(busboy);
};
