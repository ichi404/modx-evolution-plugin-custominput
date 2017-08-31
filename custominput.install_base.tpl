 //<?php
/**
 * jqCustominput
 * カスタム変数に複数の情報をもたせてJson形式で保存します。jsonexportと合わせて使って下さい。
 * @category   plugin
 * @version    1.0 - August 31, 2017
 * @internal    @events OnDocFormPrerender
 * @internal    @modx_category Manager and Admin
 */
 
//【使い方】
//テンプレート変数の作成でCustom Formを選択し、以下をコピペしてください。
// <textarea tvtype="textarea" id="tv[+field_id+]" name="tv[+field_id+]" class="customInput" title="$カスタムタイプ(normal,faq,imageList,custom)">[+field_value+]</textarea>
// ※data-xxxと付けると全てthis.optionsへ格納されます
//
//【注意】jqCustominputだけでは画面に出力出来ません。出力するにはjsonExportスニペットを使ってください。
//
//$カスタムタイプ
//いくつかのテンプレートが入っています。
//見出し名を変えたり、カスタマイズしたい場合はtitle="custom"を設定してください。
//
//normal
//タイトル+本文の組み合わせ。お知らせなどの管理に向いています。
//├tit:見出し（日付とか）
//└txt:本文
//
// faq
// normalと同じ。見出しが違います。faqの管理に向いています。
// ├q：質問
// └a:回答
// 
// imageList
// ファイルブラウザが開いて画像を選択できます。スライドショーの管理などに向いています。
// ├url:画像のURL
// ├txt:説明テキスト
// └alt:altの内容
//
// custom
// 自由にフォームオブジェクトが作成できます。設定はCustom Formのタグにdata-inputs="***"として記述します。
// 以下のように[変数名:見出し名：フォームのタイプ]で1セットでカンマで区切っていくつでも追加できます。
// 例）data-inputs="date:text:日付,tit:見出し:text,txt:本文:textarea"
// 
// [customで使用可能なフォームオブジェクト] 
// text,textarea,select,image（imageListで使っているものと同じです）（checkbox,radio非対応）
// selectを使う場合は以下のようになります。
// data-inputs="変数名:見出し:select:option名00/option名01/option名03"
// 変数名には選択された項目の順番が、変数名_txtには選択された項目のテキストが保存されます。
//
//
//

$js = '<link rel="stylesheet" href="/assets/plugins/custominput/custominput.css" /><link rel="stylesheet" href="/assets/plugins/custominput/dragtable.css" /><script type="text/javascript" src="/assets/plugins/custominput/custominput.js"></script><script type="text/javascript" src="/assets/plugins/custominput/dragtable.js"></script>';

$modx->event->output($js);