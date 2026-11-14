# 1 Saatlik 2D Agent Game Jam · KAPLAY

Nov 8, 2026 · @Tuva

## Genel bakış ve kurallar

4 kişi, 60 dakika, herkes **aynı araçlarla** 2D bir oyun yapar: KAPLAY motoru, aynı asset havuzu, terminalde çalışan bir AI agent. Oyun fikri tamamen serbest. Kazananı belirleyen; ne kadar çok asset, animasyon, mekanik ve oynanış derinliği koyabildiğin.

Temel kurallar:

1. **Sadece 2D ve sadece KAPLAY.** Başka oyun motoru veya fizik kütüphanesi eklenmez. Yardımcı küçük npm paketleri (ör. `jsfxr`) serbest.
2. **Agent terminalden çalışır.** Claude Code, Codex CLI, Gemini CLI vb. Görsel editör (Tiled, Unity, Godot) yasak; level'lar kodla veya ASCII harita olarak yazılır.
3. **Asset'ler ortak havuzdan.** Aşağıdaki kaynaklardan istediğin kadar paket kullanabilirsin; ne kadar çok ve uyumlu kullanırsan o kadar puan.
4. **Lisans.** Sadece ücretsiz / CC0 asset. Atıf isteyen varsa README'ye yaz.
5. **Teslim.** 60. dakikada klavyeler bırakılır. Oyun `npm run dev` ile açılmalı; README'de kontroller ve numaralı mekanik listesi olmalı.
6. **Sunum.** Herkes 3 dakika oyununu oynatır, 1 dakika soru; jüri puanlar.

## Ortak stack: KAPLAY

Herkes [KAPLAY](https://github.com/kaplayjs/kaplay) kullanır: Kaboom.js'in devamı olan, editörsüz, tamamen kodla çalışan bir 2D JavaScript oyun kütüphanesi. API'si çok kısa olduğu için agent az hata yapar ve 60 dakikanın çoğu kuruluma değil mekaniğe gider.

| Parça | Ne kullanılıyor |
| --- | --- |
| Motor | KAPLAY, kararlı sürüm (3001.x). `kaplay@next` / v4000 alfa **kullanılmaz** |
| Fizik | Dahili: `setGravity()`, `area()`, `body()`, `body({ isStatic: true })`, `onCollide()` |
| Kurulum | `npx create-kaplay oyun` → `cd oyun` → `npm run dev` → tarayıcıda `localhost:5173` |
| Level | `addLevel()` ile ASCII harita (Tiled yok) |
| Ses | KAPLAY `loadSound()` + `play()`; istersen `npm i jsfxr` ile kodda ses üretimi |
| Agent | Terminalde çalışan herhangi bir AI coding agent |
| Tarayıcı | Chrome; konsol hataları agent'a yapıştırılır |

Neden alfa değil: v4000 alfa API'sinde değişiklikler var; agent eski ve yeni sözdizimini karıştırıp zaman kaybettirir.

## Ortak asset havuzu

Organizatör tüm paketleri önceden indirir ve aynı `asset-havuzu/` klasörünü herkese kopyalar; böylece kimse 60 dakikanın içinde site gezmez. Havuzdaki her şey serbest, ne kadar çok paket ve animasyon kullanılırsa o kadar puan.

| Paket | İçerik | Tür | Lisans |
| --- | --- | --- | --- |
| [Pixel Adventure 1](https://pixelfrog-assets.itch.io/pixel-adventure-1) · Pixel Frog | 4 animasyonlu karakter, tuzaklar (testere, trambolin, diken), meyveler, tile | Platformer | Ücretsiz |
| [Kings and Pigs](https://pixelfrog-assets.itch.io/kings-and-pigs) · Pixel Frog | Kral, bomba atan domuzlar, kapılar, kalp ve elmas, tile | Platformer | CC0 |
| [Treasure Hunters](https://pixelfrog-assets.itch.io/treasure-hunters) · Pixel Frog | Korsan oyuncu, düşmanlar, tuzaklar, eşyalar, UI | Platformer | CC0 |
| [Sunny Land](https://ansimuz.itch.io/sunny-land-pixel-game-art) · ansimuz | Tilki karakter, düşmanlar, parallax arka plan katmanları | Platformer | Ücretsiz |
| [Kenney](https://kenney.nl/assets) | Pixel Platformer, UI paketleri, ses paketleri, fontlar | Her tür | CC0 |
| 16x16 DungeonTileset II · 0x72 (itch.io) | Zindan tile'ları, animasyonlu kahraman ve canavarlar, silahlar | Top-down | CC0 |
| [sfxr.me](https://sfxr.me) | 8-bit ses efekti üretici (zıplama, coin, patlama) | Ses | Serbest |
| [Freesound](https://freesound.org) | Gerçek ses kayıtları (CC0 filtresiyle) | Ses | CC0 |

İpuçları:

- **Piksel ölçeğini sabitle.** Pixel Frog paketleri 32 px, Sunny Land ve 0x72 16 px karakter kullanır. Karıştırırken birini 2x büyüt, yoksa stil puanı düşer.
- **Animasyon dosya yapısı.** Pixel Frog'da her animasyon ayrı bir yatay şerit PNG'dir (ör. `Run (32x32).png`); kare sayısı = dosya genişliği / 32. Agent'a bunu ölçtür.
- **Arka planı katmanla.** Sunny Land'in arka plan katmanları farklı hızda kaydırılınca (parallax) derinlik verir; bu ekstra puan getirir.

## Oyun fikirleri

Fikir tamamen serbest; aşağıdakiler sadece ilham. Aynı fikri iki kişi seçebilir, birden fazla paketi karıştırmak teşvik edilir.

| Fikir | Tür | Uygun paket | Mekanik tohumları |
| --- | --- | --- | --- |
| Meyve Koşusu | Endless runner | Pixel Adventure 1 + Sunny Land arka plan | Çift zıplama, duvar zıplaması, trambolin, testere tuzağı, hız artışı |
| Domuz Kalesi | Platformer / brawler | Kings and Pigs | Çekiçle vurma, bomba atan düşman, kapıdan oda geçişi, kalp toplama |
| Korsan Hazinesi | Aksiyon platformer | Treasure Hunters | Kılıç kombosu, sandık açma, coin ekonomisi, düşman devriyesi |
| Zindan Dalgaları | Top-down arena | DungeonTileset II | Dalga sistemi, silah değiştirme, iksir, dash |
| Tilki Ormanı | Mini metroidvania | Sunny Land | Anahtar-kapı, yetenek açma (çift zıplama sonradan gelir), checkpoint |
| Karışık Evren | Serbest | Birden fazla paket | Her dünya farklı paketle; portal ile dünyalar arası geçiş |

Güçlü bir başlangıç stratejisi: önce tek ekranda oynanabilir çekirdek, sonra her 5–8 dakikada bir yeni mekanik veya yeni animasyonlu düşman.

## 60 dakikalık zaman çizelgesi

En kritik an 15. dakika: ekranda hareket eden bir oyuncu yoksa o yarışmacı mekanik yarışını kaybeder. Organizatör 15. ve 30. dakikalarda yüksek sesle süre anonsu yapar.

&#91;embedded content: 60 dakikalık plan · 6 aşama, 15. dakikada kontrol\]

İsteğe bağlı olarak 30. dakikada bir **twist kartı** açılır (bkz. son bölüm). Süre bitince her yarışmacı 3 dk oynatır + 1 dk soru alır (\~16 dk), ardından puanlama \~5 dk sürer.

## Puanlama ve kazanan

Toplam puan = **jüri puanı (50)** + **içerik puanı (sınırsız)**. Jüri kaliteyi ölçer; içerik puanı ise koyduğun her ekstra asset, animasyon ve mekanik için sayılarak verilir. Yani daha çok şey yapan öne geçer, ama kalitesiz yığın jüri puanında kaybeder.

### Jüri puanı (en fazla 50)

| Kriter | Puan | Ne bakılır |
| --- | --- | --- |
| Eğlence / oynanabilirlik | 20 | Jüri 3 dk oynar; kontroller iyi mi, tekrar oynamak istiyor mu |
| Görsel bütünlük | 15 | Paketler uyumlu mu, piksel ölçeği tutarlı mı, ekran dolu ve canlı mı |
| Tamlık | 10 | Başlangıç ekranı, skor/can, game over, yeniden başlatma |
| Stabilite | 5 | 3 dk boyunca çökmeden, takılmadan çalışıyor mu |

### İçerik puanı (sınırsız, sayılarak)

| Ne eklendi | Puan | Sayılma şartı |
| --- | --- | --- |
| Çalışan mekanik | +3 her biri | Oyuncunun deneyimini değiştiren bağımsız kural (zıplama, dash, bomba, anahtar-kapı...) |
| Animasyonlu karakter / düşman tipi | +2 her biri | En az 2 animasyon durumu olan, farklı davranan tip |
| Ek animasyon durumu | +1 her biri | idle, run, jump, fall, hit, attack, death vb.; oyunda tetiklenmeli |
| Level / oda / sahne | +2 her biri | Gerçekten oynanabilen ayrı alan; menü sayılmaz |
| Parallax katmanı | +1 her biri | 2'den fazla katman varsa, 3. katmandan itibaren |
| Juice efekti | +1 her biri | Parçacık, ekran sarsıntısı, hit flash, tween, yavaş çekim vb. |
| UI öğesi | +1 her biri | Can barı, skor, kombo sayacı, mini harita, duraklatma menüsü |
| Ses | +1 her 2 efekt, müzik +2 | Oyunda tetiklenen farklı sesler |
| Twist kartı uygulandı | +3 | 30. dakikada çekilen twist oyunda çalışıyor |

**Kurallar:**

- Sadece sunumda **gösterilen** şey sayılır. README'de yazıp ekranda gösterilemeyen puan almaz.
- Aynı şeyin renk değişimi sayılmaz: farklı renkte ama aynı davranan düşman tek tiptir.
- Bozuk çalışan öğe sayılmaz; jüri tek bir öğeyi "stil dışı" diye reddedebilir.
- Her yarışmacı README'ye bu kategorilerle **puan listesi** yazar; jüri sunumda tek tek işaretler.
- Eşitlikte jüri puanı yüksek olan kazanır.

Ek ödüller (isteğe bağlı): **En çok mekanik**, **En iyi görsel**, **En eğlenceli**. Yarışmacılar oy veriyorsa kimse kendine oy veremez.

## Hazırlık ve agent başlangıç promptu

Yarışmadan bir gün önce kurulumu her bilgisayarda bir kez denemek ilk 10 dakikayı kurtarır.

### Hazırlık listesi

- [ ] Her bilgisayarda Node.js (güncel LTS) ve Chrome kurulu
- [ ] Agent CLI kurulu ve oturum açık
- [ ] `npx create-kaplay oyun` denendi; boş proje `npm run dev` ile açılıyor
- [ ] Tüm asset ZIP'leri indirilip açıldı, `asset-havuzu/` klasörü her bilgisayara kopyalandı
- [ ] Her proje klasöründe `git init` yapıldı (agent bozarsa geri dönmek için)
- [ ] Twist kartları yazdırılıp zarfa kondu
- [ ] 60 dk sayaç ve 15 / 30 / 50. dakika anonsları ayarlandı
- [ ] Sunum için ekran paylaşımı veya projeksiyon test edildi
- [ ] Puanlama tabloları jüri sayısı kadar çoğaltıldı

### Agent başlangıç promptu

Herkes köşeli parantezleri doldurup ilk mesaj olarak gönderir; sonrası serbest.

```text
Sen bir 2D oyun geliştiricisisin. Toplam 60 dakikamız var.
Motor: KAPLAY (kararlı 3001.x sürümü, dahili fizik). Başka motor veya fizik kütüphanesi ekleme.
Asset'ler ./public/assets klasöründe. Spritesheet kare sayılarını dosya genişliğinden hesapla, tahmin etme.
Oyun fikri: [FİKİR]. Kullanacağım paketler: [PAKETLER].
Hedef: mümkün olduğunca çok mekanik, animasyonlu karakter/düşman, efekt ve level.
Çalışma şekli:
1. Önce en fazla 10 dakikada çalışan çekirdek oyunu kur: animasyonlu oyuncu, hareket, zemin, kamera.
2. Sonra her adımda TEK bir şey ekle (mekanik, düşman tipi, animasyon, efekt, level), çalıştığını doğrula.
3. Her eklemeyi README'deki puan listesine kategorisiyle yaz (Mekanik / Karakter / Animasyon / Level / Efekt / UI / Ses).
4. Her adımdan sonra git commit at.
5. Hata olursa konsol çıktısını oku, küçük düzeltme yap; büyük yeniden yazım yapma.
```

### KAPLAY hızlı başvuru

Agent'a örnek olarak verilebilecek minimum iskelet (Pixel Adventure'daki Ninja Frog'un 12 karelik koşu şeridiyle):

```js
import kaplay from "kaplay";
kaplay({ width: 640, height: 360, letterbox: true });
setGravity(1600);

loadSprite("frog", "assets/frog-run.png", {
  sliceX: 12,
  anims: { run: { from: 0, to: 11, loop: true, speed: 20 } },
});
loadSprite("ground", "assets/ground.png");

scene("game", () => {
  addLevel([
    "                    ",
    "        $$   ^      ",
    "====================",
  ], {
    tileWidth: 32, tileHeight: 32,
    tiles: {
      "=": () => [sprite("ground"), area(), body({ isStatic: true })],
    },
  });

  const player = add([sprite("frog", { anim: "run" }), pos(64, 0), area(), body(), "player"]);
  onKeyDown("right", () => player.move(200, 0));
  onKeyPress("space", () => { if (player.isGrounded()) player.jump(600); });
  player.onCollide("enemy", () => shake(8));
});

go("game");
```

Kısa notlar: sahne geçişi `scene()` + `go()`, kamera `camPos()`, efekt için `shake()` ve `tween()`, ses için `loadSound()` + `play()`. Tam API: [kaplayjs.com](https://kaplayjs.com).

## Twist kartları

Yarışmanın 30. dakikasında zarftan bir twist çekilir ve **herkese aynı twist** uygulanır. Eklemek zorunlu değil; oyunda çalışırsa +3 içerik puanı getirir.

1. **Ters yerçekimi:** Bir tuşla veya belirli aralıklarla yerçekimi döner.
2. **Tek tuş modu:** Oyun tek bir tuşla da oynanabilir olmalı.
3. **Boss:** En az 2 aşamalı bir boss düşmanı.
4. **Geri sayım:** Her şey 90 saniyede bitiyor; süre uzatan toplanabilir eklenir.
5. **Ölüm bir araçtır:** Ölünce geride bir şey kalır (platform, hayalet, engel).
6. **Renk kuralı:** Bir mekanik renk değişimine bağlı (sadece aynı renkle etkileşim gibi).

### Kaynaklar

- [KAPLAY GitHub](https://github.com/kaplayjs/kaplay)
- [KAPLAY v4000 Alpha 26 duyurusu](https://kaplay4000.pages.dev/blog/release-v4000-alpha-26) (alfa sürümün neden kullanılmadığı)
- [Kings and Pigs](https://pixelfrog-assets.itch.io/kings-and-pigs) ve [Treasure Hunters](https://pixelfrog-assets.itch.io/treasure-hunters) lisans sayfaları
- [jsfxr GitHub](https://github.com/chr15m/jsfxr)
