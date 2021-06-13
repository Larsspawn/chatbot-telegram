/*
    [MODULE TEXT SEARCHING] 
    Algoritma untuk mencari kata kunci dan extract keyword dari teks

    Member Task Text Searching
        > 4311901003 - Sultan Ilyas Arsalillah Yuswan Syah
        > 4311901002 - Galih Prasetya Giri Harmawan

    Cara import: (nama variable bebas)
    //const sk = require('./search-keyword');
*/



const fs = require('fs');

// Mendapatkan kata - kata stopwords
const stopWordList = fs.readFileSync(process.cwd() + "/data/stopwords.txt", { encoding : 'utf8' }).split(/\s+/);

let i, j;



// Mencari jumlah kata yang ada dalam sebuah file
let wordCount = function(text) {
    return text.match(/\b[0-9a-zA-Z'-_]+\b/gi).length;
}



// Mencari stop words yang ada dalam sebuah file, lalu return jumlah stop wordsnya
let stopWordCount = function(text) {
    let stopWordsCount = 0;

    // Pengecekan stopwords
    stopWordList.forEach(stopword => {
        if (text.match(new RegExp(`\\b${stopword}\\b`, 'gi')) !== null)
            stopWordsCount += text.match(new RegExp(`\\b${stopword}\\b`, 'gi')).length;
    });
    
    // return banyaknya stop words
    return stopWordsCount;
}



// Mencari tahun dan frekuensinya dalam teks
function FindYearsInText(text) {
    // Jarak tahun yang dicari adalah 1000 - 2999
    const yearList = text.match(/\b[1-2][0-9][0-9][0-9]\b/g);
    const yearFreq = {};

    if(yearList){
        yearList.forEach((year) => {
            if (yearFreq[year]) {
                yearFreq[year] += 1;
            } else {
                yearFreq[year] = 1;
            }
        });
    }

    return yearFreq;
}



// Mencari nama bulan dan frekuensinya dalam teks
function FindMonthsInText(text) {
    const monthListEN = ['january', 'february', 'march', 'april', 'may', 'june',
                         'july', 'august', 'september', 'october', 'november', 'december'];
    const monthListID = ['januari', 'februari', 'maret', 'april', 'mei', 'juni',
                         'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];
    const monthFreq = {};

    const re1 = monthListEN.join('|');
    const re2 = monthListID.join('|');

    monthList = text.toLowerCase().match(new RegExp(`\\b(${re1}|${re2})\\b`, 'gi'));

    if (monthList) {
        monthList.forEach((month) => {
            if (monthFreq[month]) {
                monthFreq[month] += 1;
            } else {
                monthFreq[month] = 1;
            }
        });
    }
    
    return monthFreq;
}



// [Feature/Keyword Extraction]
// Algoritma sederhana untuk ekstrak kata kunci dari teks
// RemoveStopWords() > SplitWords() > CalculateWordFrequency() > ExtractKeywords()

// Menghapus semua kata stopword
function RemoveStopWords(text) {
    stopWordList.forEach(stopword => {
        text = text.replace(new RegExp(`\\b${stopword}\\b`, 'gi'), '');
    });

    return text;
}

// Memisahkan kata dengan metode match yang memiliki RegExp khusus
function SplitWords(text) {
    return text.match(/\b[0-9a-zA-Z'-_]+\b/gi);
}

// Mencari banyaknya masing-masing kata kunci dalam teks
function CalculateWordFrequency(wordList) {
    const wordFreq = {};

    if(wordList){
        wordList.forEach((word) => {
            if (wordFreq[word]) {
                wordFreq[word] += 1;
            } else {
                wordFreq[word] = 1;
            }
        });
    }

    return wordFreq;
}

function ExtractKeywords(text) {
    const filteredText = RemoveStopWords(text.toLowerCase());
    const keywordList = SplitWords(filteredText);
    const sortedKeywordFreq = SortObjToArray(CalculateWordFrequency(keywordList));
    
    const result = {
        wordCount: wordCount(text),
        keywordList: keywordList,
        keywordFreq: sortedKeywordFreq
    };

    return result;
}



// [Text Searching] Pencarian kata kunci dalam sebuah file teks
// argument text pada fungsi ini adalah teks input user dari ctx.message.text
function FindKeyword(inputText, inputKeyword) {
    // result untuk menyimpan hasil pencarian yang akan direturn setelah function selesai
    let arrText, 
        arrKeyword, 
        keywordCount, 
        count = 0, 
        ratio = 0, 
        info,
        result = {
            total: 0,
            keywords: [],
            info: ""
        }
    
    // Konversi string ke dalam bentuk array untuk menghitung jumlah kata (Pemenggalan kata berdasarkan karakter SPACE & CARRIAGE RETURN (Enter))
    arrText = SplitWords(inputText);
    arrKeyword = SplitWords(inputKeyword);

    // Menentukan jumlah keyword pada parameter yang ada
    if (arrKeyword.length > 1)
        keywordCount = arrKeyword.length + 1;      // Tidak dikurangi 1 karena satunya lagi untuk kombinasi kata kunci
    else
        keywordCount = arrKeyword.length;
    
    result.total = arrText.length;
    
    info = "[total kata]    =    " + result.total + "\n\n";

    // Looping for untuk setiap parameter(kata kunci) yang ada setelah command /find
    for (i = 0; i < keywordCount; i++) {
        let currentKeyword = arrKeyword[i];

        // Untuk parameter kombinasi/lebih dari satu parameter
        // Jika sudah berada di iterasi parameter terakhir, maka cari kombinasi parameter
        // Dengan cara "param1" + "param2" + "param3" (dengan spasi antar parameter)
        // Contoh kombinasi kata kunci = "good" + "morning" + "everybody" = "good morning everybody"
        if (arrKeyword.length > 1 && i == keywordCount - 1)
            currentKeyword = arrKeyword.join(' ');

        // [Algoritma Pencarian Kata Kunci]
        // Pencarian kata dengan RegExp lebih baik dan pengecekan yang lebih kompleks
        var re = new RegExp(currentKeyword.toLowerCase(), 'g');    
        if (inputText.toLowerCase().match(re) != null)
            count = inputText.toLowerCase().match(re).length;    // Simpan kata dalam array
        else
            count = 0;      // Untuk mencegah error null, count diassign 0 jika matchnya null

        // Menampilkan hasil jumlah pencarian kata kunci dan rasionya pada CONSOLE
        ratio = count / arrText.length;
        // Menampung data analisis hasil pencarian pada result
        info += currentKeyword + "    =    " + count + "    >>    (" + (ratio*100).toFixed(2) + "%)\n";
    
        result.keywords.push({
            [currentKeyword]: count, 
        });
    }

    result.info = info;
    
    return result;   // return banyaknya kata kunci yang ditemukan;
}

function FindKeywordFromMetaFile(keyword, metaFilename)
{
    var metadata = fs.readFileSync(process.cwd() + "/metafile/" + metaFilename + ".meta", { encoding : 'utf8' });
    var metadata = JSON.parse(metadata);

    keyword = keyword.toLowerCase();

    let relevantKeywordValue;
    
    for (i = 0; i < metadata.percent.length; i++)
    {
        let keywordValue = metadata.percent[i][keyword];

        // Abaikan jika nilai dari key (kata kunci) adalah undefined
        if (typeof keywordValue === 'undefined')
            continue;

        relevantKeywordValue = metadata.percent[i]["total"];
    }

    return relevantKeywordValue;
}

function FindKeywordFromAllMetafiles(keyword)
{
    const metaFileNames = fs.readdirSync(process.cwd() + "/metafile");

    let relevantMetafiles = {};
    let sortedRelevantMetafiles = [];

    for (let metafile in metaFileNames) {
        metaFileNames[metafile] = metaFileNames[metafile].replace(/.meta/gi, '');
        
        let relevantKeywordValue = FindKeywordFromMetaFile(keyword, metaFileNames[metafile]);

        if (typeof relevantKeywordValue === 'undefined')
            continue;

        //relevantMetafiles.push([metaFileNames[metafile], relevantKeywordValue])

        relevantMetafiles[metaFileNames[metafile]] = relevantKeywordValue;

        sortedRelevantMetafiles = SortObjToArray(relevantMetafiles);
    }

    return sortedRelevantMetafiles;
}



// Untuk mengurutkan object dari yang terbesar
// Object dikonversi ke array terlebih dahulu, kemudian urutkan array & return array tersebut
function SortObjToArray(obj) {
    let sortedArray = [];

    for (var word in obj) {
        sortedArray.push([word, obj[word]]);
    }

    sortedArray.sort(function(a, b) {
        return b[1] - a[1];
    });

    return sortedArray;
}



module.exports.stopWordList = stopWordList;

module.exports.wordCount = wordCount;
module.exports.stopWordCount = stopWordCount;

module.exports.FindYearsInText = FindYearsInText;
module.exports.FindMonthsInText = FindMonthsInText;

module.exports.RemoveStopWords = RemoveStopWords;
module.exports.SplitWords = SplitWords;
module.exports.CalculateWordFrequency = CalculateWordFrequency;
module.exports.ExtractKeywords = ExtractKeywords;

module.exports.FindKeyword = FindKeyword;
module.exports.FindKeywordFromMetaFile = FindKeywordFromMetaFile;
module.exports.FindKeywordFromAllMetafiles = FindKeywordFromAllMetafiles;