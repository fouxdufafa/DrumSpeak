import * as fs from 'fs';

export const readText = (file: string) => new Promise<string>((resolve, reject) => {
    fs.readFile(file, { encoding: 'utf8' }, (err: Error, data: string) => {
        err ? reject(err) : resolve(data);
    });
});
export const readJson = (file: string) => new Promise((resolve, reject) => {
    fs.readFile(file, { encoding: 'utf8' }, (err: Error, data: string) => {
        if (err) {
            reject(err);
        }
        try {
            const result = JSON.parse(data);
            resolve(result);
        } catch (err) {
            reject(err);
        }
    });
});