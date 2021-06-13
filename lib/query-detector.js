/*
    [MODULE QUERY/QUESTION DETECTOR]
    Algoritma untuk mengecek adanya suatu pertanyaan yang dikirim user,
    Lalu membalas dengan jawaban yang mengulangi kata yang ditanya.

    Member Task "Membuat balasan teks sesuai dengan kata kunci dengan mengulang kata"
        > 4311901003 - Sultan Ilyas Arsalillah Yuswan Syah
        > 4311901002 - Galih Prasetya Giri Harmawan

    
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

// List kata tanya
const questionWords = ["siapakah", "siapa", 
                    "dimana", "kemana", "darimana",
                    "kapankah", "kapan",
                    "mengapa", "kenapa", 
                    "bagaimanakah", "bagaimana",
                    "berapakah", "berapa",
                    "apakah", "apa",];

let i,j;

//Menentukan kata tanya yang digunakan, index untuk daftar kata tanya (questionWords)
let indexQuestion = 0;

// Pendeteksi kalimat tanya dan membalas pesan dengan mengulang kata yang ditanya
function DetectQuestion(inputText) {
    // parameter inputText dari teks user, arr untuk array dari str agar dapat dipisah per kata
    let arrText = sk.SplitWords(inputText);
    let questionWord = "";      // kata tanya
    let noun = "";              // kata benda (nomina)
    let keyword = "";           // kata kunci (keyword)
    let answer = "";            // jawaban/balasan

    // Pengecekan kata tanya pada input teks yang dikirim user
    if (CheckQuestionWord(inputText) !== -1 && arrText.length > 1)
        indexQuestion = CheckQuestionWord(inputText);
    else
        return 0;

    questionWord = questionWords[indexQuestion];
    
    console.log("\n\n\nKata tanya telah terdeteksi!  >>  \"" + questionWords[indexQuestion] + "\"\n");
    


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
    answer = "...";
    let response = noun + " adalah " + answer; 

    var result =
        "Pertanyaan\t: " + inputText +
        "\nJawaban\t\t: " + response + "\n" + 
        "\n[Kata Tanya]\t: " + questionWord +
        "\n[Kata Benda]\t: " + noun +
        "\n[Kata Kunci]\t: " + keyword + 
        "\n[Stopwords]\t: " + sk.stopWordCount(inputText);  // kata tanya termasuk dalam stopwords

    console.log(result);

	return response;
}

// Mengecek adanya kata tanya dalam suatu kalimat/teks
// return -1 jika tidak ada kata tanya dalam kalimat/teks
function CheckQuestionWord(str) {
    for (i = 0; i < questionWords.length; i++)
        if (str.toLowerCase().includes(questionWords[i]))
            return i;

    return -1;
}



module.exports.DetectQuestion = DetectQuestion;
module.exports.CheckQuestionWord = CheckQuestionWord;