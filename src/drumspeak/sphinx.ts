import * as childProcess from 'child_process';
import * as stream from 'stream';

export type SphinxSegmentType = 'word' | 'silence' | 'start' | 'end';

export interface SphinxSegment {
    text: string;
    type: SphinxSegmentType;
    start: number;
    end: number;
}

const parseLine = (line: string): SphinxSegment => {
    console.log('parsing line: ');
    console.log(line);
    const fields = line.split(/\s+/g);
    const text = fields[0];
    let type: SphinxSegmentType;
    switch (text) {
        case '<s>':
            type = 'start';
            break;
        case '</s>':
            type = 'end';
            break;
        case '<sil>':
            type = 'silence';
            break;
        default:
            type = 'word';
            break;
    }
    const start = Number.parseFloat(fields[1]);
    const end = Number.parseFloat(fields[2]);
    return { text, type, start, end };
};

export const parse = (data: string) => {
    const lines = data.trim().split("\n");
    const fullText = lines.shift();
    return lines.map(l => parseLine(l));
};

export const spawn = () => {
    const sphinx = childProcess.spawn('pocketsphinx_continuous', [
        '-infile', '/dev/stdin',
        '-time', 'yes'
    ]);
    sphinx.stdout.setEncoding('utf8');
    return sphinx;
};

export const createStreamingParser = () => new stream.Transform({
    transform: function (data: string, encoding: string, cb) {
        // regex split utterances
        console.log('parsing sphinx output');
        const lines = data.trim().split("\n");
        const fullText = lines.shift();
        lines.map(l => parseLine(l)).forEach(segment => this.push(segment));
        cb();
    },
    objectMode: true
});