# Rimuru Discord.js v14 Bot v2.9

<p align="center">
  <a href="https://api.weblutions.com/discord/invite/dvCKjxHn35">
    <img src="https://api.weblutions.com/discord/invite/dvCKjxHn35" alt="Rimuru Shop Discord" />
  </a>
</p>
 

Genel Discord Botu

# Yapılan Değişiklikler: 
   * doğruluk cesaretlik, 
   * çekiliş, 
   * emoji kopyalama veya toplu emoji çekme, 
   * random anime, random manga, 
   * bazı bugların fixlenmesi ve kritik hata çözümleri

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

* [Glitch Kurulum](#glitch)
* [Vds Kurulum](#vds)



## Glitch


``` bash

# Glitch'e gir.
# Yeni bir proje oluşturun.
# Projenizi açın.
# Projenin alt tarafında bulunan "Tools" butonuna tıklayın.
# "Import/Export" seçeneğini seçin.
# "Import from GitHub" seçeneğini seçin.
# "https://github.com/RimuruBot/Rimuru-Discord.js-v14-Bot.git" adresini girin.
# "Import" butonuna tıklayın.
# `index.js` dosyasına gidin.
# `config.token` değerini 'process.env.token' değişkenini değiştirin.
# .env dosyasına gidin.
# `token` değerini botunuzun tokeni ile değiştirin.



```


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

