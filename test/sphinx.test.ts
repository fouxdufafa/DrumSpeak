import * as sphinx from '../src/drumspeak/sphinx';
import * as fs from 'fs';
import * as path from 'path';
import { readJson, readText } from './util';

const input = path.join(__dirname, 'data/sphinx.in.wav');
const output = path.join(__dirname, 'data/sphinx.out.txt');
const outputJson = path.join(__dirname, 'data/sphinx.out.json');

const processAudio = (file: string) => new Promise((resolve, reject) => {
    const processor = sphinx.createStreamProcessor(fs.createReadStream(file));
    const segments: sphinx.SphinxSegment[] = [];
    processor.on('data', (segment: sphinx.SphinxSegment) => {
        segments.push(segment);
    });
    processor.on('error', reject);
    processor.on('finish', () => resolve(segments));
});

describe('Sphinx', () => {
    it('should parse text output', async () => {
        const text = await readText(output);
        const json = await readJson(outputJson);
        const parsed = sphinx.parse(text);
        expect(parsed).toEqual(json);
    });
    it('should stream wav files', async () => {
        const segments = await processAudio(input);
        const json = await readJson(outputJson);
        expect(segments).toEqual(json);
    });
});