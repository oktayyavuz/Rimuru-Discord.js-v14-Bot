const ms = require('./index.js')
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