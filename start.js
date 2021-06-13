const { Telegraf } = require('telegraf');
const bot = new Telegraf("1432902068:AAFBOmuVJ4wq794HSX4_vSry1LQ1aAkj780");

// Token Bot Polibatam : 1654284840:AAEK9FS_VtEVZ-LnazvguSBjQf6Bh7pe5-4

const fs = require('fs');
//const filename = "./teks.txt";    // Tentuin nama/path file teksnya disini

// ----------- [MY MODULEs] ----------- //
const sk = require('./lib/search-keyword');
const qd = require('./lib/query-detector');
const generateMeta = require('./generate-meta');
const fuzzyMatching = require('fuzzy-matching');

var i,j;

bot.start((ctx) => ctx.reply('Welcome'));



////////////    [ Search Keyword ]    ////////////

// [Text Searching] Pencarian kata kunci dalam sebuah file teks
// Cara penggunaan = /find <kata_kunci> -or- /find <kata_kunci_1> <kata_kunci_2> <kata_kunci_n>
bot.command("find", (ctx) => {

    
    let result = [];
    let msgInput = ctx.message.text.replace("/find ", '');
    let msgOutput = "Hasil pencarian kata kunci \"" + msgInput.toLowerCase() + "\"\n\n";

    result = sk.FindKeywordFromAllMetafiles(msgInput);

    for (i = 0; i < result.length; i++)
    {
        if (i + 1 > 3)
            break;

        msgOutput += "[" + (i + 1) + "] " + "Metafile \"" + result[i][0] + ".meta\"  :  " + result[i][1].toFixed(3) + "\n";
    }

    console.log(msgOutput);

    ctx.reply(msgOutput);
    

    /*
    let keywordList = ctx.message.text.replace("/find ", '');
    let textData = fs.readFileSync("./dokumen/teks.txt", { encoding : 'utf8' })

    let result = sk.FindKeyword(textData, keywordList);

    console.log("\n\n\n\n"+ "[Hasil pencarian kata kunci]" + "\n");
    console.log(result);
    ctx.reply(result.info);
    */
    
});






// ---------------------- [ SPACER ] ---------------------- //





////////////    [ Pendeteksi Kata Tanya ]    ////////////

bot.on("text", (ctx) => {
    if (qd.DetectQuestion(ctx.message.text) !== 0)
        ctx.reply(qd.DetectQuestion(ctx.message.text));
});






// Start Testing



var fm = new fuzzyMatching(['apa', 'siapa', 'dimana', 'kapan', 'kenapa', 'berapa', 'bagaimana']);
 
// Finds words
console.log(fm.get('ap')); // --> { distance: 1, value: 'tough' }
 
// Finds words that are spelled wrong by looking at the closest ressembling word
console.log(fm.get('apa')); // --> { distance: 0.7142857142857143, value: 'thought' }
// Beware when words in your dictionary are very close
console.log(fm.get('sapa')); // --> { distance: 0.875, value: 'through' },
                                 // though you may have wanted to get 'thought'
 
// Case insensitive
console.log(fm.get('dmn').value); // --> through
 
// Accent-proof
console.log(fm.get('kpn').value); // --> Café
 
// Add words after creation
console.log(fm.get('gimana')); // --> { distance: 0, value: null }
                                // because too remote to anything in the dictionary
fm.add('what');
console.log(fm.get('wht')); // --> { distance: 1, value: 'dinosaur' }



// End Testing



bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));