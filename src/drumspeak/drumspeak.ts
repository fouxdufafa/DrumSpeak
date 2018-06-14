// create stream that converts sphinx output into midi
import * as stream from 'stream';
import * as MidiConvert from 'midiconvert';
import { SphinxSegment, SphinxSegmentType } from './sphinx';

const secondsToTicks = (seconds: number, bpm: number, ticksPerBeat: number) => {
    return (seconds / 60) * bpm * ticksPerBeat;
};
