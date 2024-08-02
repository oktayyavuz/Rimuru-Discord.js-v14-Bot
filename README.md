# Rimuru Discord.js v14 Bot v3.0

<p align="center">
  <a href="https://api.weblutions.com/discord/invite/dvCKjxHn35">
    <img src="https://api.weblutions.com/discord/invite/dvCKjxHn35" alt="Rimuru Shop Discord" />
  </a>
</p>
 

Genel Discord Botu 

[Click here for the English version of this README](READMEENG.md)


# Yapılan Değişiklikler: 

   * Öneri alma sistemi
   * Sunucu Banner
   * Snipe (Kanalda son silinen mesajı gösterme)
   * Buton Rol
   * Özel Oda sistemi

## İçerik tablosu

* [Gereksinimler](#gereksinimler)
* [Başlarken](#başlarken)
* [Yazar](#yazar)
* [Kurulum](#kurulum)



## Gereksinimler

- [Node](https://nodejs.org/en/) 

## Başlarken

Öncelikle yerel makinenizde gerekli tüm araçların kurulu olduğundan emin olun ve ardından bu adımlara devam edin.

## Kurulum

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
veya 

```bash
npm run start
```
veya 

```bash
# start.bat dosyasını çalıştırın.
```
## Yazar

[Oktay Yavuz](https://oktaydev.com.tr/)


## Lisans

Bu proje MIT Lisansı kapsamında lisanslanmıştır - ayrıntılar için [LICENSE.md](LICENSE) dosyasına bakın

