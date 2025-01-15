# Rimuru Discord.js v14 Bot v3.1

<p align="center">
  <a href="https://api.weblutions.com/discord/invite/dvCKjxHn35">
    <img src="https://api.weblutions.com/discord/invite/dvCKjxHn35" alt="Rimuru Shop Discord" />
  </a>
</p>

Genel Discord Botu 

[Click here for the English version of this README](READMEENG.md)

# Yapılan Değişiklikler: 

   * Hata Düzeltmeleri.


## İçerik tablosu

* [Özellikler](#özellikler)
* [Gereksinimler](#gereksinimler)
* [Başlarken](#başlarken)
* [Yazar](#yazar)
* [Kurulum](#kurulum)

## Özellikler

<details>
<summary> Özellikler </summary>

<details>
<summary>Kayıt Sistemi</summary>

- Kullanıcıların kayıt edilmesini sağlar.
- Kayıt sistemi açma ve kapatma desteği.

</details>

<details>
<summary>AFK Sistemi</summary>

- Kullanıcılar AFK (Away From Keyboard) durumuna geçebilir.
- Geri döndüklerinde AFK durumunu otomatik kaldırır.

</details>

<details>
<summary>Aşk Ölçer</summary>

- İki kullanıcı arasındaki aşk oranını eğlenceli bir şekilde ölçer.

</details>

<details>
<summary>Ban Yönetimi</summary>

- Kullanıcıları sunucudan banlama ve ban listesini görüntüleme.
- Forceban ile kullanıcıyı sunucuda olmadan da banlama.

</details>

<details>
<summary>Çekiliş Sistemi</summary>

- Çekiliş oluşturma, yönetme ve kazananları yeniden seçme.
- Emojiler ve zamanlayıcı ile zenginleştirilmiş çekiliş mesajları.

</details>

<details>
<summary>Emoji Yönetimi</summary>

- Sunucuya emoji ekleme ve mevcut emojileri görüntüleme.

</details>

<details>
<summary>Giriş/Çıkış Mesajları</summary>

- Sunucuya giriş ve çıkış yapan kullanıcılar için özel mesajlar ayarlama.
- Özellikleri açma ve kapatma desteği.

</details>

<details>
<summary>Küfür ve Reklam Koruması</summary>

- Küfür ve reklamları otomatik olarak engelleme.

</details>

<details>
<summary>Level Sistemi</summary>

- Kullanıcıların seviyesini takip etme ve ödüller verme.
- Özel XP ekleme ve kaldırma.
- Seviye sıralaması görüntüleme.

</details>

<details>
<summary>Mod Log</summary>

- Sunucuda gerçekleşen önemli olayları takip etme.

</details>

<details>
<summary>Mute Yönetimi</summary>

- Kullanıcıları belirli bir süre için susturma.
- Mute ayarlarını yönetme.

</details>

<details>
<summary>Oylama Sistemi</summary>

- Sunucuda oylama başlatma ve sonuçları görüntüleme.

</details>

<details>
<summary>Oto Rol ve Oto Tag</summary>

- Yeni kullanıcılar için otomatik rol ve tag verme.
- Özellikleri kapatma desteği.

</details>

<details>
<summary>Ping ve İstatistikler</summary>

- Botun pingini ve diğer istatistiklerini görüntüleme.

</details>

<details>
<summary>Rol Yönetimi</summary>

- Kullanıcılara rol verme ve alma.
- Yeni roller oluşturma.

</details>

<details>
<summary>Silme ve Temizleme</summary>

- Belirli sayıda mesajı hızlıca temizleme.

</details>

<details>
<summary>Yasaklı Kelime Sistemi</summary>

- Belirli kelimeleri engelleme ve listeden kaldırma.

</details>

<details>
<summary>Özel Oda Sistemi</summary>

- Kullanıcıların kendilerine özel sesli odalar oluşturmasını sağlar.

</details>

<details>
<summary>Öneri Sistemi</summary>

- Kullanıcıların önerilerini toplama ve haftalık önerileri görüntüleme.

</details>

</details>

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
