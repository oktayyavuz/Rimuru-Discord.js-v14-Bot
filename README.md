# Rimuru Discord.js v14 Bot v2.0

Genel Discord Botu


## İçerik tablosu

* [Gereksinimler](#gereksinimler)
* [Başlarken](#başlarken)
* [Yazar](#yazar)

## Gereksinimler

- [Node](https://nodejs.org/en/) - Sürüm 16 veya üzeri
- [NPM](https://www.npmjs.com/)

## Başlarken

Öncelikle yerel makinenizde gerekli tüm araçların kurulu olduğundan emin olun ve ardından bu adımlara devam edin.

### Kurulum

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

`/events/ready.js` dosyasındaki `activity` ve `activityType` değişkenlerini düzenleyerek discord botunuzun durumunu değiştirebilirsiniz. "activityType"ın aşağıdaki [seçenekler](https://discord-api-types.dev/api/discord-api-types-v10/enum/ActivityType) ile bir tam sayıya ayarlanması gerekir.


### Uygulamanın başlatılması

``` bash
node index.js
```


## Yazar

[Oktay Yavuz](https://oktaydev.com.tr/)


## Lisans

Bu proje MIT Lisansı kapsamında lisanslanmıştır - ayrıntılar için [LICENSE.md](LICENSE) dosyasına bakın

