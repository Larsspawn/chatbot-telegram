/*
    Member Task "Membuat balasan teks sesuai dengan kata kunci dengan mengulang kata"
        > 4311901003 - Sultan Ilyas Arsalillah Yuswan Syah
        > 4311901029 - Cikal Lisandi Putra

    [MODULE QUESTION DETECTOR]
    Cara penggunaan: (nama variable bebas)
    // const pdfExtract = require('./pdf-extract');
*/



const fs = require('fs');
const pdfparse = require('pdf-parse');
const ts = require('./search-keyword');

let pdfData;

function ExtractPdf(filename) {
    if (filename.split('.')[filename.split('.').length - 1] === "pdf") {
        let pdfFile = fs.readFileSync(filename);

        pdfparse(pdfFile).then(function(_pdfData) {
            
            pdfData = _pdfData;
            return pdfData;
        });
    }
}





module.exports.ExtractPdf = ExtractPdf;