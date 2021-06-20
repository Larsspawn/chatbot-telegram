/*
    [MODULE QUERY/QUESTION DETECTOR]
    Algoritma untuk mengecek adanya suatu pertanyaan yang dikirim user,
    Lalu membalas dengan jawaban yang mengulangi kata yang ditanya.

    Member Task "Membuat balasan teks sesuai dengan kata kunci dengan mengulang kata"
        > 4311901003 - Sultan Ilyas Arsalillah Yuswan Syah
        > 4311901002 - Galih Prasetya Giri Harmawan
        > 4311901081 - Rizky Ananda Putra

    
    Cara import: (nama variable bebas)
    //const qd = require('./query-detector');

    Contoh cara penggunaan (telegraf API):
    //bot.on("text", (ctx) => {
    //if (qd.DetectQuestion(ctx.message.text) !== 0)
    //    ctx.reply(qd.DetectQuestion(ctx.message.text));
    //});
*/



// Wajib ada module ini, untuk pemgenggalan kata, menghapus & menghitung stopwords
const sk = require('./search-keyword');
const fuzzyMatching = require('fuzzy-matching');

// List kata tanya
const questionWords = ["siapakah", "siapa", 
                    "dimana", "kemana", "darimana",
                    "kapankah", "kapan",
                    "mengapa", "kenapa", 
                    "bagaimanakah", "bagaimana",
                    "berapakah", "berapa",
                    "apakah", "apa",];


var fm = new fuzzyMatching(["siapa", 
                            "dimana",
                            "kapan",
                            "mengapa", "kenapa", 
                            "bagaimana",
                            "berapa",
                            "apakah", "apa",]);


let i,j;


// Pendeteksi kalimat tanya dan membalas pesan dengan mengulang kata yang ditanya
function DetectQuestion(inputText) {
    // parameter inputText dari teks user, arr untuk array dari str agar dapat dipisah per kata
    let arrText = sk.SplitWords(inputText);
    // Kata tanya yang terdeteksi & distance valuenya (seberapa dekatkah/kesamaan kata yang dicek dengan kata tanya yang ada)
    let detectedQuestion = "";  // kata tanya
    let distanceValue = 0;      // nilai kedekatan/kesamaan kata yang dicek dengan kata tanya yang terdeteksi
    let answerType = ""         // jenis jawaban berdasarkan kata tanya, misal apa = sesuatu, siapa = nama orang, dimana = tempat, dst.

    let noun = "";              // kata benda (nomina)
    let keyword = "";           // kata kunci (keyword)
    let answer = "";            // jawaban/balasan

    // Pengecekan kata tanya pada input teks yang dikirim user
    // True jika kata tersebut adalah kata tanya
    if (arrText.length > 1)
    {
        // Check all words in the sentence, if the current word is a question word
        console.log("\n\n\n\n\n\n\n[DETEKSI KATA TANYA PADA SELURUH KATA DALAM KALIMAT]");
        for (i = 0; i < arrText.length; i++)
        {
            let result = CheckQuestionWord(arrText[i]);

            // Assign kata tanya yang terdeteksi beserta distance valuenya
            if (result !== null)
            {
                detectedQuestion = result.value;
                distanceValue = result.distance;
                answerType = result.answerType;
            }
        }
        console.log("\n");
    }
    else
        return 0;

    console.log("\nKata tanya telah terdeteksi!  >>  \"" + detectedQuestion + "\"\n");
    


    // Eliminasi kata tanya dan stopwords untuk menentukan kata benda/kata kunci
    for (i = 0; i < arrText.length; i++)
        for (j = 0; j < questionWords.length; j++)
            if (arrText[i].toLowerCase().includes(questionWords[j]))
                arrText[i] = '';

    if (arrText[i] !== '') {
        // Menentukan kata benda (stopwords belum difilter)
        // Filter element yang kosong (elementnya kata tanya tadi)
        let filtered = arrText.filter( (element) => element != '' );
        noun = filtered.join(' ');
    
        // Eliminasi stopword
        filtered = sk.RemoveStopWords(arrText.join(' '));
        arrText = sk.SplitWords(filtered);

        // Menentukan kata kunci (tanpa stopwords)
        keyword = arrText.join(' ');
    }



    // Menentukan jawaban dari pertanyaan yang ditanya user
    console.log

    answer = "...";
    let response = noun + " adalah " + answer; 

    var result =
    //     "Pertanyaan\t: " + inputText +
    "\n[JAWABAN]" + 
    "\nJenis jawaban\t: " + answerType + 
    "\nJawaban\t\t: " + response + "\n" //+ 
    //     "\n[Kata Tanya]\t: " + questionWord +
    //     "\n[Kata Benda]\t: " + noun +
    //     "\n[Kata Kunci]\t: " + keyword + 
    //     "\n[Stopwords]\t: " + sk.stopWordCount(inputText);  // kata tanya termasuk dalam stopwords

    console.log(result);

	return response;
}

// Mengecek adanya kata tanya dalam suatu kalimat/teks
// return -1 jika tidak ada kata tanya dalam kalimat/teks
function CheckQuestionWord(str) {
    // [OBSOLETE] OLD ALGORITHM
    // for (i = 0; i < questionWords.length; i++)
    //     if (str.toLowerCase().includes(questionWords[i]))
    //         return i;

    
    // NEW ALGORITHM
    let fuzzyResult = fm.get(str);

    let result = {
        value : "",
        distance : 0,
        answerType : ""
    }

    console.log("\"" + str + "\"" + "  :  " + fuzzyResult.distance.toFixed(2));



    // Cek jenis jawaban berdasarkan kata tanya
    let answerType = "";

    if (fuzzyResult.value === "apa" || fuzzyResult.value === "apakah")  answerType = "Penjelasan sesuatu";
    else if (fuzzyResult.value === "siapa")  answerType = "Nama orang";
    else if (fuzzyResult.value === "dimana")  answerType = "Sebuah tempat";
    else if (fuzzyResult.value === "kapan")  answerType = "Sebuah waktu";
    else if (fuzzyResult.value === "mengapa" || fuzzyResult.value === "kenapa")  answerType = "Penjelasan sebab/akibat";
    else if (fuzzyResult.value === "bagaimana")  answerType = "Penjelasan cara";
    else if (fuzzyResult.value === "berapa")  answerType = "Penjelasan jumlah";



    // distance adalah nilai seberapa dekat/sama kata tersebut dengan kata tanya yang ada
    // Jika distance lebih besar dari 0.65, maka kata tersebut merupakan kata tanya
    // 0.65 adalah patokan nilai yang cukup akurat, mungkin bisa diubah sesuai kebutuhan/preferensi
    if (fuzzyResult.distance > 0.65)
    {
        result.value = fuzzyResult.value;
        result.distance = fuzzyResult.distance;
        result.answerType = answerType;

        return result;
    }
        

    return null;
}



module.exports.DetectQuestion = DetectQuestion;
module.exports.CheckQuestionWord = CheckQuestionWord;