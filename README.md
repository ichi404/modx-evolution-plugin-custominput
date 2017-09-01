Modx-jqCustominput
====

Modxで1つのテンプレート変数に複数の情報を持たせる事ができるプラグインです。  
jqCustominputだけでは画面に出力出来ません。出力するにはjsonExport [<https://github.com/ichi404/modx-evolution-snippet-jsonexport>]を使用します。

## Description
テンプレート変数を複数のフォームに変換してデータを保存できます。  
1つ1つリソース管理するまでもない程のお知らせや、FAQ、スライドショーの画像など、1リソースで管理ができます。

## Demo
![demo_custominput_01](https://user-images.githubusercontent.com/912482/29911155-ccd952b4-8e67-11e7-8edc-7f73683801f4.jpg)

カスタムタイプ[FAQ]を使用  
![demo_custominput_02](https://user-images.githubusercontent.com/912482/29911156-ccda2db0-8e67-11e7-916c-7315bfd6e2e1.jpg)

カスタムタイプ[custom]でオリジナルのフォームも作成可能  
![demo_custominput_03](https://user-images.githubusercontent.com/912482/29911157-ccdf1e1a-8e67-11e7-8f84-82bf45a9931e.jpg)

## Usage
テンプレート変数の作成でCustom Formを選択し、以下をコピペしてください。
```
<textarea tvtype="textarea" id="tv[+field_id+]" name="tv[+field_id+]" class="customInput" title="$カスタムタイプ(normal,faq,imageList,custom)">[+field_value+]</textarea>
```
### $カスタムタイプ
いくつかのテンプレートが入っています。  
見出し名を変えたり、カスタマイズしたい場合はtitle="custom"を設定してください。

#### normal
├tit:見出し（日付とか）  
└txt:本文  
タイトル+本文の組み合わせ。お知らせなどの管理に向いています。  

#### faq
├q：質問  
└a:回答  
normalと同じ。見出しが違います。faqの管理に向いています。  

#### imageList
├url:画像のURL  
├txt:説明テキスト  
└alt:altの内容  
ファイルブラウザが開いて画像を選択できます。スライドショーなど画像管理などに向いています。

#### custom
自由にフォームオブジェクトが作成できます。フォームの設定はCustom Formのタグにdata-inputs="*"として記述します。  
以下のように[変数名:見出し名：フォームのタイプ]で1セットでカンマで区切っていくつでも追加できます。  
例）data-inputs="date:text:日付,tit:見出し:text,txt:本文:textarea"  
 
##### [customで使用可能なフォームオブジェクト]
text,textarea,select,image（imageListで使っているものと同じです）（checkbox,radio非対応）  
selectを使う場合は以下のようになります。  
data-inputs="変数名:見出し:select:option名00/option名01/option名03"  
変数名には選択された項目の順番が、変数名_txtには選択された項目のテキストが保存されます。

## Install
/assets/plugins/ディレクトリへこのディレクトリを入れてupdateを行って下さい。  
※手動でインストールしたい場合は、custominput.install_base.tplをコピペして下さい。  


## Licence

[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

## Author

[ichi404](https://github.com/ichi404)