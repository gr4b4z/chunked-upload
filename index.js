"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const ProgressBar = require("progress");
module.exports = function uploadFile(functionToSendRequest, filePath, chunkLength = 1000) {
    function processTheStream(nextChunk, chunkData) {
        let options = {
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'content-length': `${chunkData.data.length}`,
                'Content-Disposition': `attachment; filename="${chunkData.fname}"`,
                'Content-Range': `bytes ${chunkData.from}-${chunkData.to}/${chunkData.size}`,
                'Content-Type': 'image/jpeg'
            },
            body: chunkData.data
        };
        return functionToSendRequest(options)
            .then(nextStep => {
            currentChunkPosition = chunkData.to + 1;
            bar.tick(chunkData.data.length);
            let chunk = nextChunk();
            if (chunk) {
                return processTheStream(nextChunk, chunk);
            }
            return Promise.resolve();
        });
    }
    let fileInfo = fs.statSync(filePath);
    let fileName = path.basename(filePath);
    var rs = fs.createReadStream(filePath);
    let currentChunkPosition = 0;
    var bar = new ProgressBar('Uploading [:bar] :rate/bps :percent :etas', {
        complete: '=',
        incomplete: ' ',
        total: fileInfo.size
    });
    return new Promise(resolve => {
        rs.on('readable', () => {
            let nextChunk = () => {
                var chunk = rs.read(chunkLength);
                if (chunk == null)
                    return null;
                return {
                    data: chunk,
                    from: currentChunkPosition,
                    to: currentChunkPosition + chunk.length - 1,
                    size: fileInfo.size,
                    fname: fileName
                };
            };
            processTheStream(nextChunk, nextChunk())
                .then(d => {
                setTimeout(function () {
                    resolve(d);
                }, 10);
            });
        });
    });
};
//# sourceMappingURL=index.js.map