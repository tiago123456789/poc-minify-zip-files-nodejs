const fs = require('fs');
var Jimp = require('jimp');
const archiver = require('archiver');

class File {

    zip(nameZipFile, directoryZipFiles) {
        const output = fs.createWriteStream(__dirname + `/${nameZipFile}`);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });
    
        output.on('close', function () {
            console.log(archive.pointer() + ' total bytes');
        });
    
        output.on('end', function () {
            console.log('Data has been drained');
        });
    
        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
                // log warning
            } else {
                // throw error
                throw err;
            }
        });
    
        archive.on('error', function (err) {
            throw err;
        });
        archive.pipe(output);
        archive.directory(directoryZipFiles, false);
        archive.finalize();
    }

    getFilesInDirectory(directory)  {
        return new Promise((resolve, reject) => {
            fs.readdir(directory, (err, files) => {
                if (err) {
                    reject(err)
                    return;
                }
                resolve(files)
            })
        })
    }

    minifyMany(files, originDirectory, destinyDirectory) {
        return Promise.all(
            files.map(item => {
                return new Promise((resolve, reject) => {
                    Jimp.read(`${originDirectory}/${item}`, (err, image) => {
                        if (err) return reject(err);
                        image
                            .resize(image.getWidth() / 2, image.getHeight() / 2)
                            .quality(70)
                            .write(`${destinyDirectory}/min.${item}`);
                        resolve(true)
                    });
                })
            })
        )
    }
    
}

const file = new File();

file.getFilesInDirectory("./imgs")
    .then(files => file.minifyMany(files, "imgs", "./imgs-min"))
    .then(() => file.zip("min.files.zip", "./imgs-min"))
    .catch(console.log)

