// Data-driven Rage Books. Adding a book later should only require:
//   1. a new entry here,
//   2. an arena recipe (palette/props/hazards already generic),
//   3. localized text.
// The hub, journal, summary and battle controller all read from this registry.

export const BOOKS = [
  {
    id: "ashen",
    chapter: 1,
    order: 1,
    cover: "book05",
    rageCover: "ragebook_ashen",
    arena: "ashen",
    palette: {
      bg: [26, 15, 13],
      bg2: [44, 26, 21],
      accent: [232, 161, 84],
      danger: [226, 90, 64],
      safe: [127, 231, 224],
      paper: [226, 214, 187],
    },
    enemySprite: "imp_idle",
    enemyRun: "imp_run",
    enemyScale: 3,
    title: { en: "The Ashen Tale", tr: "Kül Masalı" },
    subtitle: { en: "A story that was never read to the end", tr: "Sonuna kadar okunmamış bir masal" },
    enemyName: { en: "Ink Imp", tr: "Mürekkep Cini" },
    intro: {
      en: [
        "The cover is warm. The title has been scratched out.",
        "A child's voice is caught between the pages: \"One more page. Please.\"",
        "The book has been feeding on the silence ever since.",
      ],
      tr: [
        "Kapak sıcak. Başlık tırnakla kazınmış.",
        "Sayfaların arasında bir çocuk sesi sıkışmış: \"Bir sayfa daha. Lütfen.\"",
        "O günden beri kitap sessizlikle besleniyor.",
      ],
    },
    sentence: {
      en: "Once upon a time... but this tale is missing its ___.",
      tr: "Bir varmış, bir yokmuş... ama bu masalın bir ___ yok.",
    },
    options: {
      en: ["Hope", "Ash", "End"],
      tr: ["Umut", "Kül", "Son"],
    },
    answer: 0,
    clues: {
      en: [
        "The dedication is burnt, but one word survives: \"for the child who asked for one more page.\"",
        "The margins are full of small fingerprints. Someone read this book many times.",
        "It did not want to burn. It wanted to be warm.",
      ],
      tr: [
        "İthaf yanmış, ama tek bir kelime kalmış: \"bir sayfa daha isteyen çocuk için.\"",
        "Kenar boşlukları küçük parmak izleriyle dolu. Birisi bu kitabı defalarca okumuş.",
        "Yanmak istememiş. Isınmak istemiş.",
      ],
    },
    listenLines: {
      en: ["The book listens for a voice. For a moment, it is quiet."],
      tr: ["Kitap bir ses bekliyor. Bir an için sessizleşiyor."],
    },
    wrongLines: {
      en: ["Ash fills the air. The story recoils from the word."],
      tr: ["Havayı kül dolduruyor. Hikâye kelimeden geri çekiliyor."],
    },
    correctLines: {
      en: ["A small light catches in the well. The embers slow, as if remembering fireflies."],
      tr: ["Kuyuda küçük bir ışık yanıyor. Korlar yavaşlıyor, sanki ateş böceklerini hatırlıyor."],
    },
    enrageLines: {
      en: ["The book stops pretending. It is all fire now."],
      tr: ["Kitap rol yapmayı bırakıyor. Artık tamamen ateş."],
    },
    sealLines: {
      en: ["The last page does not burn. It waits for you to close it."],
      tr: ["Son sayfa yanmıyor. Kapanmayı bekliyor."],
    },
    summary: {
      en: [
        "Once, a child asked for the same story every night. The book learned the shape of the child's voice, the pause before \"one more page\", the small hand on its cover.",
        "Then the child grew up. The book was shelved, then boxed, then forgotten. It burned its own pages to feel warm again. The ash smelled like the candle in the child's room.",
        "When you wrote HOPE, the ashes remembered fireflies. The story did not become what it had been. It became what it could still be.",
        "On the last page, a new line appeared: \"And the one who listened was not a child anymore. But they stayed until the end.\"",
      ],
      tr: [
        "Bir zamanlar bir çocuk her gece aynı masalı isterdi. Kitap çocuğun sesinin şeklini öğrendi: \"bir sayfa daha\" demeden önceki duraklamayı, kapağına konan küçük eli.",
        "Sonra çocuk büyüdü. Kitap rafa, sonra kutuya, sonra unutuluşa kaldırıldı. Yeniden ısınmak için kendi sayfalarını yaktı. Küller, çocuğun odasındaki mum gibi kokuyordu.",
        "Sen UMUT yazdığında küller ateş böceklerini hatırladı. Hikâye eskiden olduğu şeye dönüşmedi. Hâlâ olabileceği şeye dönüştü.",
        "Son sayfada yeni bir dize belirdi: \"Ve dinleyen artık bir çocuk değildi. Ama sonuna kadar kaldı.\"",
      ],
    },
    beats: [
      { subtitle: { en: "The fire remembers.", tr: "Ateş hatırlıyor." }, pattern: "embers" },
      { subtitle: { en: "No one came to read.", tr: "Kimse okumaya gelmedi." }, pattern: "walls" },
      { subtitle: { en: "It burned its own pages.", tr: "Kendi sayfalarını yaktı." }, pattern: "aimed" },
    ],
    arenaProps: {
      houses: [76, 548],
      well: 250,
      moon: false,
      pillars: [],
      tower: false,
    },
    safeZone: { x: 250, y: 224, r: 72 },
    duration: 9,
    spawnEvery: 0.46,
    baseDamage: 2,
  },
  {
    id: "poem",
    chapter: 1,
    order: 2,
    cover: "book08",
    rageCover: "ragebook_poem",
    arena: "poem",
    palette: {
      bg: [12, 18, 25],
      bg2: [20, 31, 40],
      accent: [159, 216, 224],
      danger: [183, 156, 230],
      safe: [127, 231, 224],
      paper: [218, 224, 211],
    },
    enemySprite: "necro_idle",
    enemyRun: "necro_run",
    enemyScale: 3,
    title: { en: "The Silent Poem", tr: "Sessiz Şiir" },
    subtitle: { en: "A poem with its last line torn away", tr: "Son dizesi yırtılmış bir şiir" },
    enemyName: { en: "Whisper Wraith", tr: "Fısıltı Hayaleti" },
    intro: {
      en: [
        "The pages are cold and smooth, like a window at night.",
        "Every line is addressed to someone who never came back.",
        "The last line has been torn away. The tear is too clean to be an accident.",
      ],
      tr: [
        "Sayfalar soğuk ve pürüzsüz, geceleyin bir pencere gibi.",
        "Her dize geri dönmeyen birine yazılmış.",
        "Son dize yırtılmış. Yırtık, kaza olamayacak kadar temiz.",
      ],
    },
    sentence: {
      en: "Every line waited for someone to hear; in the end it left its voice as an ___.",
      tr: "Her dize birinin duymasını bekledi; sonunda sesini ___ bıraktı.",
    },
    options: {
      en: ["Echo", "Ink", "Silence"],
      tr: ["Yankı", "Mürekkep", "Sessizlik"],
    },
    answer: 0,
    clues: {
      en: [
        "The dedication is addressed to \"the one who always came back.\" The page is worn at the edge.",
        "A last line was torn away. The tear is clean; it was removed on purpose.",
        "In the margin: \"If you cannot answer, at least let me hear you.\"",
      ],
      tr: [
        "İthaf \"her zaman geri dönen kişiye\" yazılmış. Sayfanın kenarı aşınmış.",
        "Son dize yırtılmış. Yırtık temiz; bilerek çıkarılmış.",
        "Kenarda: \"Cevap veremiyorsan bile, bari seni duyayım.\"",
      ],
    },
    listenLines: {
      en: ["A sound travels through the page. It is almost a word."],
      tr: ["Sayfada bir ses dolaşıyor. Neredeyse bir kelime."],
    },
    wrongLines: {
      en: ["The poem folds into itself. The silence becomes heavier."],
      tr: ["Şiir kendi içine kapanıyor. Sessizlik ağırlaşıyor."],
    },
    correctLines: {
      en: ["The torn line returns as an echo. The empty stage answers back."],
      tr: ["Yırtık dize bir yankı olarak geri dönüyor. Boş sahne cevap veriyor."],
    },
    enrageLines: {
      en: ["The poem screams in a language made only of echoes."],
      tr: ["Şiir yalnızca yankılardan oluşan bir dilde çığlık atıyor."],
    },
    sealLines: {
      en: ["The last line is not restored. It is answered."],
      tr: ["Son dize geri getirilmiyor. Cevaplanıyor."],
    },
    summary: {
      en: [
        "A librarian wrote this poem for a reader who came to the library every evening. They talked about books, weather, and the small light above the reading desk. The librarian never said the poem was for them.",
        "Then the reader stopped coming. The librarian tore out the last line so the poem could never end. If it never ended, perhaps the reader would have to come back to finish it.",
        "When you wrote ECHO, the empty library answered. Not with the reader's voice, but with the librarian's: \"I should have read it to you.\"",
        "The poem is still sad. But it is no longer waiting alone. Some stories need a listener more than they need an ending.",
      ],
      tr: [
        "Bu şiiri bir kütüphaneci, her akşam kütüphaneye gelen bir okur için yazdı. Kitaplardan, havadan ve okuma masasının üstündeki küçük lambadan konuşurlardı. Kütüphaneci şiirin o kişi için olduğunu hiç söylemedi.",
        "Sonra okur gelmeyi bıraktı. Kütüphaneci son dizeyi yırttı; şiir asla bitmesin istedi. Bitmezse, belki okur onu tamamlamak için geri dönmek zorunda kalırdı.",
        "Sen YANKI yazdığında boş kütüphane cevap verdi. Okurun sesiyle değil, kütüphanecinin sesiyle: \"Sana okumalıydım.\"",
        "Şiir hâlâ hüzünlü. Ama artık yalnız beklemiyor. Bazı hikâyelerin bir sondan çok bir dinleyiciye ihtiyacı vardır.",
      ],
    },
    beats: [
      { subtitle: { en: "A line was written.", tr: "Bir dize yazıldı." }, pattern: "rings" },
      { subtitle: { en: "No one answered.", tr: "Kimse cevap vermedi." }, pattern: "waves" },
      { subtitle: { en: "The last line tore.", tr: "Son dize yırtıldı." }, pattern: "aimed" },
    ],
    arenaProps: {
      houses: [],
      well: null,
      moon: true,
      pillars: [40, 590],
      tower: false,
    },
    safeZone: { x: 320, y: 222, r: 66 },
    duration: 9,
    spawnEvery: 0.7,
    baseDamage: 2,
  },
  {
    id: "last",
    chapter: 1,
    order: 3,
    cover: "book11",
    rageCover: "ragebook_last",
    arena: "last",
    palette: {
      bg: [20, 12, 18],
      bg2: [36, 19, 27],
      accent: [226, 112, 112],
      danger: [255, 96, 96],
      safe: [214, 178, 104],
      paper: [214, 200, 176],
    },
    enemySprite: "demon_idle",
    enemyRun: "demon_run",
    enemyScale: 2.2,
    title: { en: "The Last Page", tr: "Son Sayfa" },
    subtitle: { en: "The library's own final book", tr: "Kütüphanenin kendi son kitabı" },
    enemyName: { en: "The Last Page", tr: "Son Sayfa" },
    intro: {
      en: [
        "This book has no title. The cover is the same colour as the dark between shelves.",
        "It contains the last page of every story in the library. It has been turning that page for a very long time.",
        "It does not want to end. It is afraid that an ending means being forgotten.",
      ],
      tr: [
        "Bu kitabın başlığı yok. Kapağı, raflar arasındaki karanlıkla aynı renkte.",
        "Kütüphanedeki her hikâyenin son sayfasını içeriyor. O sayfayı çok uzun zamandır çeviriyor.",
        "Bitmek istemiyor. Sonun unutulmak olduğundan korkuyor.",
      ],
    },
    sentence: {
      en: "Every story must one day ___, but everything told remains.",
      tr: "Her hikâye bir gün ___, ama anlatılan her şey kalır.",
    },
    options: {
      en: ["End", "Continue", "Forget"],
      tr: ["Biter", "Devam", "Unutulur"],
    },
    answer: 0,
    clues: {
      en: [
        "The book has no final sentence. Every time it reaches the end, the last page turns back to the beginning.",
        "In the margin, in a librarian's hand: \"A story that never ends cannot be remembered.\"",
        "Under the ink, a smaller line: \"I am not afraid of the end. I am afraid of the empty shelf.\"",
      ],
      tr: [
        "Kitabın son cümlesi yok. Her sona geldiğinde son sayfa başa dönüyor.",
        "Kenarda, bir kütüphanecinin el yazısıyla: \"Bitmeyen hikâye hatırlanamaz.\"",
        "Mürekkebin altında daha küçük bir satır: \"Sondan korkmuyorum. Boş raftan korkuyorum.\"",
      ],
    },
    listenLines: {
      en: ["The book is breathing. Each page is a slow, careful breath."],
      tr: ["Kitap nefes alıyor. Her sayfa yavaş, dikkatli bir nefes."],
    },
    wrongLines: {
      en: ["The tower shudders. The ink rises faster."],
      tr: ["Kule sarsılıyor. Mürekkep daha hızlı yükseliyor."],
    },
    correctLines: {
      en: ["The pages settle. For the first time, the book looks small enough to hold."],
      tr: ["Sayfalar duruluyor. Kitap ilk kez elinde tutulabilecek kadar küçük görünüyor."],
    },
    enrageLines: {
      en: ["The last page turns backward. The whole library holds its breath."],
      tr: ["Son sayfa geriye dönüyor. Bütün kütüphane nefesini tutuyor."],
    },
    sealLines: {
      en: ["The book closes. It does not disappear. It waits to be opened again."],
      tr: ["Kitap kapanıyor. Kaybolmuyor. Yeniden açılmayı bekliyor."],
    },
    summary: {
      en: [
        "The library is a book. Its shelves are chapters, its doors are margins, and its final page has been missing for a long time.",
        "The Last Page was written to hold the end of every story. It refused to end because endings felt like erasure. So it kept turning, and the library kept holding its breath.",
        "When you wrote END, the book closed. The library did not disappear. It exhaled. The end was not an erasure; it was a page turning.",
        "In the margin, a name appeared in fresh ink: {name}. Under it, a smaller line: \"This one is not in the ledger yet.\"",
      ],
      tr: [
        "Kütüphane bir kitaptır. Rafları bölümler, kapıları kenar boşluklarıdır ve son sayfası uzun zamandır kayıptır.",
        "Son Sayfa, her hikâyenin sonunu tutmak için yazıldı. Bitmeyi reddetti, çünkü sonlar silinmek gibi geliyordu. O yüzden çevirmeye devam etti ve kütüphane nefesini tuttu.",
        "Sen BİTER yazdığında kitap kapandı. Kütüphane kaybolmadı. Nefes verdi. Son, silinmek değildi; bir sayfanın çevrilmesiydi.",
        "Kenar boşluğunda taze mürekkeple bir isim belirdi: {name}. Altında daha küçük bir satır: \"Bu henüz defterde yok.\"",
      ],
    },
    beats: [
      { subtitle: { en: "The story reached its end.", tr: "Hikâye sonuna ulaştı." }, pattern: "pagewalls" },
      { subtitle: { en: "It refused.", tr: "Reddetti." }, pattern: "ink" },
      { subtitle: { en: "The library held its breath.", tr: "Kütüphane nefesini tuttu." }, pattern: "spiral" },
    ],
    phaseTwoBeats: [
      { subtitle: { en: "The last page turns.", tr: "Son sayfa çevriliyor." }, pattern: "all" },
      { subtitle: { en: "Every story is a door.", tr: "Her hikâye bir kapıdır." }, pattern: "all" },
    ],
    arenaProps: {
      houses: [],
      well: null,
      moon: false,
      pillars: [28, 604],
      tower: true,
    },
    safeZone: { x: 320, y: 220, r: 58 },
    duration: 10,
    spawnEvery: 0.58,
    baseDamage: 2,
  },
];

export const PAGES = [
  {
    id: "p1",
    x: 560,
    y: 150,
    note: {
      en: "A margin note in your own handwriting: \"Do not forget why you came.\" You do not remember writing it.",
      tr: "Kendi el yazınla bir kenar notu: \"Neden geldiğini unutma.\" Yazdığını hatırlamıyorsun.",
    },
  },
  {
    id: "p2",
    x: 108,
    y: 232,
    note: {
      en: "A library rule, underlined twice: \"A book that is not read does not die. It waits.\"",
      tr: "İki kez altı çizilmiş bir kütüphane kuralı: \"Okunmayan kitap ölmez. Bekler.\"",
    },
  },
  {
    id: "p3",
    x: 340,
    y: 246,
    note: {
      en: "A drawing of a small ghost with a long, curling tail. Under it: \"The library keeps what it cannot name.\"",
      tr: "Gölgesi olmayan küçük bir hayalet çizimi. Altında: \"Kütüphane adlandıramadığını saklar.\"",
    },
  },
  {
    id: "p4",
    x: 426,
    y: 264,
    note: {
      en: "A list of names. Every name is crossed out except one: {name}. The ink is still wet.",
      tr: "Bir isim listesi. Biri hariç hepsinin üstü çizili: {name}. Mürekkep hâlâ ıslak.",
    },
  },
  {
    id: "p5",
    x: 920,
    y: 246,
    note: {
      en: "A torn page from a book about the library itself: \"The librarian is not chosen. The librarian is remembered.\"",
      tr: "Kütüphanenin kendisini anlatan bir kitaptan yırtık sayfa: \"Kütüphaneci seçilmez. Kütüphaneci hatırlanır.\"",
    },
  },
];

export const CHAPTERS = [
  {
    id: 1,
    name: { en: "The First Three", tr: "İlk Üç" },
    bookIds: ["ashen", "poem", "last"],
  },
  {
    id: 2,
    name: { en: "The Unwritten", tr: "Yazılmamış" },
    bookIds: [],
  },
];

export function getBook(id) {
  return BOOKS.find((book) => book.id === id) ?? BOOKS[0];
}

export function getChapterBooks(chapter = 1) {
  return BOOKS.filter((book) => book.chapter === chapter).sort((a, b) => a.order - b.order);
}

export function getPage(id) {
  return PAGES.find((page) => page.id === id);
}

export const MARGIN_LINES = {
  beforeFirst: {
    en: [
      "You are new. Or old. Hard to tell with ghosts.",
      "The books call it rage. I call it hunger. Same thing, mostly.",
      "Read them before you write. A word without a clue is just noise.",
    ],
    tr: [
      "Yenisin. Ya da çok eskisin. Hayaletlerde anlaşılmıyor.",
      "Kitaplar buna hırs diyor. Ben açlık diyorum. Çoğunlukla aynı şey.",
      "Yazmadan önce oku. İpucu olmayan kelime sadece gürültüdür.",
    ],
  },
  afterAshen: {
    en: [
      "One down. The shelves feel lighter already.",
      "The next one is quieter. Listen more than you read. And when the sound comes, do not stand still.",
    ],
    tr: [
      "Bir tanesi gitti. Raflar şimdiden hafifledi.",
      "Sıradaki daha sessiz. Okumaktan çok dinle. Ses geldiğinde kıpırdamadan durma.",
    ],
  },
  afterPoem: {
    en: [
      "Two down. You are getting good at listening.",
      "The last one is the library's own ending. It will not go quietly. Use everything you learned.",
    ],
    tr: [
      "İki tanesi gitti. Dinlemekte iyileşiyorsun.",
      "Sonuncusu kütüphanenin kendi sonu. Sessizce gitmeyecek. Öğrendiğin her şeyi kullan.",
    ],
  },
  afterAll: {
    en: [
      "Three. The archive door is awake.",
      "Only three Rage Books stand in this hall. Behind that door there are far more than these shelves could hold.",
      "These three were chosen as a test. The door's seal is tied to their meaning. Anyone can pull a door open. Not everyone can make it listen.",
      "I have been here a long time. I have never seen it open for a ghost.",
      "Go on. I will keep the desk warm.",
    ],
    tr: [
      "Üç. Arşiv kapısı uyandı.",
      "Bu salonda sadece üç Hırs Kitabı var. O kapının ardında, bu rafların taşıyamayacağı kadar çok kitap var.",
      "Bu üçü bir sınav olarak seçildi. Kapının mührü onların anlamına bağlı. Herkes bir kapıyı çekebilir. Herkes onu dinletemez.",
      "Uzun zamandır buradayım. Bir hayalet için açıldığını hiç görmedim.",
      "Git. Ben masayı sıcak tutarım.",
    ],
  },
};

export const ARCHIVE_LINES = {
  locked: {
    en: [
      "The archive door is warm to the touch. Three small seals are dark.",
      "Three Rage Books must be restored before it will listen. The rest of the archive is sealed behind them, and there is far more of it than this hall holds.",
      "The seal is tied to their meaning. A stranger cannot simply pull this door open.",
    ],
    tr: [
      "Arşiv kapısı dokununca sıcak. Üç küçük mühür karanlık.",
      "Dinlemesi için üç Hırs Kitabı'nın geri getirilmesi gerekiyor. Arşivin geri kalanı onların ardında mühürlü ve bu salonun alabileceğinden çok daha fazla.",
      "Mühür onların anlamına bağlı. Yabancı biri bu kapıyı öylece çekip açamaz.",
    ],
  },
  unlocked: {
    en: [
      "The three seals glow. The door is listening.",
      "Every Rage Book behind it was waiting for the same three words you just read. This door was only ever a test.",
      "A voice on the other side is waiting for a name.",
    ],
    tr: [
      "Üç mühür parlıyor. Kapı dinliyor.",
      "Ardındaki her Hırs Kitabı, senin az önce okuduğun aynı üç kelimeyi bekliyordu. Bu kapı baştan beri bir sınavdı.",
      "Diğer taraftaki bir ses bir isim bekliyor.",
    ],
  },
  afterInterlude: {
    en: ["The door is a little open. Chapter Two has not been written yet."],
    tr: ["Kapı biraz aralık. İkinci Bölüm henüz yazılmadı."],
  },
};
