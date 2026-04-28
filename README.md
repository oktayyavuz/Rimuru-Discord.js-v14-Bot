# Rimuru Discord.js v14 Bot v2.9

<p align="center">
  <a href="https://api.weblutions.com/discord/invite/dvCKjxHn35">
    <img src="https://api.weblutions.com/discord/invite/dvCKjxHn35" alt="Rimuru Shop Discord" />
  </a>
</p>
 

Genel Discord Botu

# Yapılan Değişiklikler: 
   * teknik sorun düzeltme
   * web ui paneli (basit)
   * node uyumluluk sorunları
   * bazı bugların fixlenmesi ve kritik hata çözümleri

### Son Güncellemeler ve Optimizasyonlar:
* **Modül (C++) Derleme Hatası Çözümü:** Windows/Linux sunucularda C++ Development Kit (`node-gyp`) kaynaklı indirme hatalarına yol açan eski `canvas` modülü kaldırılarak, yerine derleme gerektirmeyen `@napi-rs/canvas` modülü entegre edildi (`helpers/rcapchta.js` buna göre uyarlandı).
* **Syntax Hatası Giderildi:** `commands/botlist.js` komutunda botun çökmesine sebep olan yazım hatası düzeltildi.
* **Port Çakışması Engellendi:** Bot başlatılırken Web arayüzünün aynı portu iki defa dinlemeye çalışmasından doğan `ERR_SERVER_ALREADY_LISTEN` hatası `events/ready.js` üzerinden giderildi. Artık panel hatasız başlatılıyor.
* **API Çökmesi (Invalid Form Body) Çözüldü:** `events/guildDelete.js` içerisinde sunucu sahibinin `null` dönmesi (DiscordAPIError[50035]) kaynaklı çökme tespit edilip `null` kontrolü ile onarıldı.
* **Discord.js Deprecation Uyarısı:** Bot aktif olduğunda konsolda beliren `DeprecationWarning: The ready event has been renamed to clientReady` uyarısı, tüm "ready" olay dosyaları "clientReady" ile değiştirilerek ortadan kaldırıldı.

## İçerik tablosu

* [Gereksinimler](#gereksinimler)
* [Başlarken](#başlarken)
* [Yazar](#yazar)



## Gereksinimler

- [Node](https://nodejs.org/en/) 
- [NPM](https://www.npmjs.com/)

## Başlarken

Öncelikle yerel makinenizde gerekli tüm araçların kurulu olduğundan emin olun ve ardından bu adımlara devam edin.

### Kurulum

* [Vds Kurulum](#vds)

## Vds
``` bash
# Repoyu klonla
git clone https://github.com/oktayyavuz/Rimuru-Discord.js-v14-Bot.git

# Dizine girin
cd Rimuru-Discord.js-v14-Bot/

# npm kurun
npm install

# Discord Bot Token'ı Yapılandır
  echo "token='Tokenini yapıştır.'" > config.json
```

### Gerekli izinler

Botunuzda, [geliştirici portalındaki](https://discord.com/developers/applications/) "OAuth2" sekmesi altında bulunabilecek "applications.commands" uygulama kapsamının etkinleştirildiğinden emin olun.

[Geliştirici portalında](https://discord.com/developers/applications/) "Bot" sekmesi altında bulunabilecek "Server_Member Intents" ve "Message Intents"nı etkinleştirin

### Yapılandırma

Projeyi klonladıktan ve tüm bağımlılıkları yükledikten sonra Discord API jetonunuzu 'config.token' dosyasına eklemeniz gerekir.

### Durumu değiştirme

`/events/ready.js` dosyasındaki `activities` değişkenlerini düzenleyerek discord botunuzun durumunu değiştirebilirsiniz. `ActivityType.Watching` kısmını değiştirerek `İzliyor`,`Oynuyor` gibi şeyler yapabilirsiniz.


### Uygulamanın başlatılması

```bash
node index.js
```


## Yazar

[Oktay Yavuz](https://oktaydev.com.tr/)


## Lisans

Bu proje MIT Lisansı kapsamında lisanslanmıştır - ayrıntılar için [LICENSE.md](LICENSE) dosyasına bakın

