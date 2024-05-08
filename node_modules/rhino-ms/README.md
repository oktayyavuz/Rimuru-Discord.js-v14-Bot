# rhino-ms
MS modülünün Türkçe Değerler İçin Yapılmış Hâli
### Modülün Amacı
<code>Modül insanların ms modülüyle yaptıkları türkçe zaman kavramları (saniye, dakika vb.) konusunda sorun yaşamamaları için yapılmıştır. Hem Türkçe Hem de İngilizce şeklinde zaman çevrimleriyle işinizi çok kolaylaştırmayı amaçlamıştır.</code>

> Rhino Inc., Arda Karagöz tarafından kurulmuş küçük bir şirkettir. Rhino Inc., Kodlama programları, Kod Projeleri, Discord Botları vb. İçerir. Rhino Inc.'in bilinmesi gereken küçük bir çevre vardır, ancak başkalarının bilgisi önümüzdeki aylarda artacaktır.
> Arda Karagöz, 15 yaşında bir Yazılım Geliştirici'dir. Türkiye'denim ve yazılım mühendisi olmak istiyorum. JavaScript ve Python hakkında çok şey biliyorum ve ayrıca C #, C ++, Java, HTML ve CSS biliyorum. Rhino Inc.'in kurucusuyum Bir çok proje yarattım ama en iyileri: Rhino Bot (Yaklaşık 700K Kullanıcı 700 Lonca - En Yararlı Türk Botu), NPM Modülleri (makehandler, ms.tr, rhino-api), MasterG Bot (Sunucumuz İçin Harika Bir Özel Discord Botu), Mental Power Discord Bot Eğitimi (+40 Eps'den fazla sürecek), Github Markdown Repo (Birkaç hafta içinde yayınlanacak.) Ve daha fazlası ...

## Kodun Kullanımı
 * [Tanımlama](#tanımlama)
 * [Örnekler](#örnekler)
 * [İletişim](#iletisim)
 * [Telif](#telif)

 <br>

 ## Güncellemeler
 ### V0.2.5
 ```md
 - Birim Kodu Getirildi
 - Artık Saniye, Dakika, Saat... gibi birimlere de çevirebileceksiniz. Örnek Kullanım:
<br>
<MS>("12 dakika", {birim: "saniye"}) //7200
 ```

 ## Tanımlama
 Modülü Kullanmadan Önce Tanımlamamız Lazım. Bunun için şu kodu kullanmak yeter :)
 ```js
  const ms = require('rhino-ms')
  ```

  ## Örnekler
  Kodları Nasıl Kullanacağınızla İlgili Örnek Aşağıda Verilmiştir:
  ```js
  const ms = require('rhino-ms')
 //Eğer Doğrudan Değer Girilirse Onu Döner
console.log(ms(4000)) //4000

 //Eğer String İçine Doğrudan Veri Girilirse Onu Döner
console.log(ms("4000")) //4000

// Türkçe Değerler İçin Ms Karşılığını Geri Döner
console.log(ms("9 dakika")) //540000
console.log(ms("12 gün")) //1036800000
console.log(ms("26.2 dakika")) //1572000
console.log(ms("2.5 yıl")) //78892314900

//İngilizce Değerler İçin de Ms Karşılığını Geri Döner
console.log(ms("7 min")) //420000
console.log(ms("1 hour")) //3600000

//Sadece MiliSaniye Değil Her Şeye Çevrilebilir!
console.log(ms("3 dakika", {
  birim: "saniye"
})) //180

console.log(ms("17 saat", {
  birim: "dakika"
})) //1020
  ```

  #### Temel Amacı: Timeout Ve Intervallar

  ```js
    const ms = require('rhino-ms')

    setTimeout(function(){
      console.log('Deneme')
    }, ms("17 saniye")) // Belli Bir Süre Sonra Bir Mesaj Attırma

    setInterval(function(){
      console.log('Deneme')
    }, ms("17 saniye")) // Belli bir süre aralıklı döngü mesajı attırma
  ```

  ## Iletisim

  İletişim için (destek, bug vb.) aşağıdaki yerlerden bana ulaşabilirsiniz.

  [E-Mail](mailto:ahmetarda2006@hotmail.com.tr)
  <br>
  [GitHub](https://github.com/ardakaragoz)
  <br>
  [Discord](https.//discord.gg/66qSv9W)
  <br>
  [YouTube](https://www.youtube.com/channel/UCdJN1G13UswgVrnq0PyA5lA)

  ## Telif

  Modül [ms](https://npmjs.org/package/ms) modülünün Türkçesidir. Lisans Dosyası Bulunmaktadır. Kodların 3. şahıslar tarafından çalınıp kendilerinmiş gibi gösterilmesi yasaktır.

  ### Rhino Inc. Ürünüdür!!!
