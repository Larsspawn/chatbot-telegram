/*
    [MODULE EXTRACT FEATURE & GENERATE METAFILE]
    Script ini berfungsi untuk men-generate metafile dari file dokumen dalam format JSON

    Member Task "Mengekstrak Feature sebuah dokumen"
        > 4311901003 - Sultan Ilyas Arsalillah Yuswan Syah
        > 4311901029 - Cikal Lisandi Putra

    Format yang support untuk generate metafile saat ini:
    - *.pdf

    Cukup jalankan script ini dengan perintah: 
    "node generate-meta"

    Untuk uji cobanya cukup menambahkan/delete file PDF kedalam folder dokumen
*/



const fs = require("fs");
const pdfparse = require("pdf-parse");
const path = require("path");
const chokidar = require("chokidar");       // Untuk event adanya perubahan dalam direktori

// Wajib ada module ini, untuk algoritma extract kata kunci dari pdfnya
const sk = require("./lib/search-keyword");     

const dirPathPdf = path.join(__dirname, "dokumen/");
const dirPathMeta = "./metafile/";



// Eksekusi setiap adanya perubahan dalam direktori dokumen
let pdfWatcher = chokidar.watch('.', {ignored: /^\./, persistent: true, cwd: dirPathPdf, awaitWriteFinish: true});

pdfWatcher
    .on('add', function(file) {  
        // Generate metafile setiap ada fie PDF baru
        if (IsReadyToExtract(file))
            GenerateMetaOfPdf(file);
    })
    .on('change', function(file) { 
        // Generate metafile setiap file PDF berubah
        if (IsReadyToExtract(file))
            GenerateMetaOfPdf(file);
    })
    .on('unlink', function(file) { 
        // Hapus metafile dari file PDF tersebut jika file PDF tersebut dihapus/dipindah
        RemoveMetafile(file); 
    })
    .on('error', function(error) { 
        console.error('[Chokidar] Error happened', error); 
    })


    
// Eksekusi setiap adanya perubahan dalam direktori dokumen
let metafileWatcher = chokidar.watch('.', {ignored: /^\./, persistent: true, cwd: path.join(__dirname + "metafile/"), awaitWriteFinish: true});

metafileWatcher
    .on('add', function(filename) {  
        // Hapus metafile jika dokumen tidak ada
        pdfFileName = filename.replace(/.meta/gi, ".pdf");
        if (!fs.existsSync("./dokumen/" + pdfFileName))
            RemoveMetafile(pdfFileName);
    })
    .on('error', function(error) { 
        console.error('[Chokidar] Error happened', error); 
    })



// Extract semua data yang berkaitan dengan Dokumen PDF tersebut
function GenerateMetaOfPdf(filename) {
    const pdfFile = fs.readFileSync(dirPathPdf + "/" + filename);

    pdfparse(pdfFile).then(function(pdfData) {
        // Ambil title dari data PDF, jika tidak ada maka dari nama file
        let documentTitle = pdfData.info['Title'];
        if (!pdfData.info['Title'])
            documentTitle = filename.replace(/.pdf/gi, '');

        // Mengambil data tanggal pembuatan file dari pdfData
        let creationDate = pdfData.info['CreationDate'].slice(2,10);
        creationDate = creationDate.slice(0,4) + '/' + creationDate.slice(4,6) + '/' + creationDate.slice(6,8);
        
        // Extract kata kunci dari judul/title dokumen PDF
        const keywordFreqFromTitle = sk.ExtractKeywords(documentTitle.toLowerCase());
        const extractedKeywords = sk.ExtractKeywords(pdfData.text);
        
        // Nilai total untuk mengukur relevansi kata kunci dari judul
        const totalValue = keywordFreqFromTitle.keywordList.length + 1;

        // Menyimpan data object untuk metafile
        let data = {
            fileName: filename,
            dateCreated: creationDate,
            wordCount: extractedKeywords.wordCount,
            stopWords: extractedKeywords.wordCount - extractedKeywords.keywordList.length,
            keyCount: extractedKeywords.keywordList.length,
            percent: [],
            yearInFile: [],
            monthInFile: []
        };

        let relevantKeywords = [];

        // Memasukkan data kata kunci ke dalam object
        // Part #1 kata kunci Relevan (yang terdapat pada judul dulu)
        for (i = 0; i < extractedKeywords.keywordFreq.length; i++) {
            if (extractedKeywords.keywordFreq[i]) {
                const keywordName = extractedKeywords.keywordFreq[i][0];
                const keywordCount = extractedKeywords.keywordFreq[i][1];

                let wordValue = 0;

                // Pengecekan apakah kata kunci saat ini relevan/sama dengan kata kunci yang ada pada judul
                for (let keyword in keywordFreqFromTitle.keywordFreq)
                    if (keywordName.toLowerCase().localeCompare(keywordFreqFromTitle.keywordFreq[keyword][0].toLowerCase()) == 0)
                        wordValue = keywordFreqFromTitle.keywordFreq[keyword][1];
                
                if (wordValue > 0) {
                    const total = (wordValue/totalValue) + (keywordCount/extractedKeywords.keywordList.length);
                    relevantKeywords.push([keywordName, keywordCount, wordValue, total]);
                }
                    
            }
        }

        // Sort/urut keyword 
        relevantKeywords.sort( (a, b) => b[3] - a[3] );

        // Memasukkan kata kunci relevan yang sudah diurutkan
        for (i = 0; i < relevantKeywords.length; i++) {
            const keywordName = relevantKeywords[i][0];
            const keywordCount = relevantKeywords[i][1];
            const wordValue = relevantKeywords[i][2];

            data.percent.push({
                [keywordName]: wordValue/totalValue, 
                content: keywordCount, 
                total: (wordValue/totalValue) + (keywordCount/extractedKeywords.keywordList.length)
            });
        }

        // Part #2 kata kunci sisa (kata kunci yang valuenya 0, namun jumlahnya lebih besar dari 2)
        for (i = 0; i < 100 - keywordFreqFromTitle.keywordFreq.length; i++) {
            if (extractedKeywords.keywordFreq[i]) {
                const keywordName = extractedKeywords.keywordFreq[i][0];
                const keywordCount = extractedKeywords.keywordFreq[i][1];

                let isOtherKeyword = true;

                // Mengabaikan kata kunci relevan yang sudah dimasukkan sebelumnya
                for (let keyword in keywordFreqFromTitle.keywordFreq)
                    if (keywordName.toLowerCase().localeCompare(keywordFreqFromTitle.keywordFreq[keyword][0].toLowerCase()) == 0)
                        isOtherKeyword = false;

                // Memasukkan kata kunci, jika jumlahnya lebih dari 1
                if (keywordCount > 1 && isOtherKeyword) {
                    data.percent.push({
                        [keywordName]: 0/totalValue, 
                        content: keywordCount, 
                        total: (0/totalValue) + (keywordCount/extractedKeywords.keywordList.length)
                    });
                }
            }
        }
        
        // Menambahkan data banyaknya tahun yang muncul ke dalam object
        const years = sk.FindYearsInText(pdfData.text);
        if (years !== null) {
            for (let year in years) {
                if (year >= 1970)
                    data.yearInFile.push({"key": year, count: years[year]});
            }
        }

        // Menambahkan data banyaknya tahun yang muncul ke dalam object
        const months = sk.FindMonthsInText(pdfData.text);
        if (months !== null) {
            for (let month in months) {
                data.monthInFile.push({"key": month, count: months[month]});
            }
        }

        // Serialisasi data object menjadi teks format JSON
        const metadata = JSON.stringify(data, null, 2);

        // Konversi nama file berekstensi pdf menjadi nama filenya saja
        const filenameWithoutExt = filename.replace(/.pdf/gi,'');

        // Membuat/write data JSON ke file meta pada direktori metafile
        fs.writeFileSync(dirPathMeta + filenameWithoutExt + ".meta", metadata);

        console.log("\"" + filenameWithoutExt + ".meta\" file was created successfully");
    });
}



// Cek apakah file PDF tersebut bisa diekstrak dengan berbagai syarat
function IsReadyToExtract(file) {
    return IsPdf(file) && !CheckMetaOfPdf(file) && fs.existsSync("./dokumen/" + file)
}



// Cek apakah file tersebut merupakan file dokumen PDF
function IsPdf(file) {
    return file.split('.')[file.split('.').length - 1] === "pdf";
}



// Cek apakah sudah ada metafile dari file PDF tersebut
function CheckMetaOfPdf(pdfFileName) {
    pdfFileName = pdfFileName.replace(/.pdf/gi, '');

    const metafileNames = fs.readdirSync(__dirname + "/metafile");

    for (let metafile in metafileNames) {
        metafileNames[metafile] = metafileNames[metafile].replace(/.meta/gi, '');
        
        if (pdfFileName.localeCompare(metafileNames[metafile]) == 0)
            return true;
    }

    return false;
}



// Hapus metafilenya Dokumen PDF tersebut
function RemoveMetafile(file) {
    metafile = file.replace(/.pdf/gi, ".meta")
    if (fs.existsSync(dirPathMeta + metafile)) {
        fs.unlinkSync(dirPathMeta + metafile);
    }
}