$j.fn.customInput = function(){
	  return this.each(function(){
	  	var options = {
	  		id: $j(this).get(0).name,
	  		type: $j(this).get(0).title,
	  		name: $j(this).attr('rel'),
	  		select: false
	  	};
	  	$j.extend(options, $j(this).data());
	  	
	  new $j.customInput($j(this), options);
	  });
};

$j.customInput = function(content,options){
	this.$elem = $j(content);
	this.options = options;
	this._construct();
};

$j.customInput.prototype = {
    _construct: function(){
        var self = this;
        this._n = 0;
        this.$inputs = [];
        this._imgPreviewFlg = false;//画像プレビュー機能
        
        this.$elem.hide();//json表示を隠す
        
        var val = this.$elem.val();
        //this.options.typeがcustomであれば設定を配列に変換しておく
        if(this.options.type == 'custom'){
            this.options.inputs = this.options.inputs.split(',');
        }
        
        //テーブルを用意
        var html = this._getTableSet();
        this.$table = $j(html).insertAfter(this.$elem);
        this.$table.filter('table').dragTable();
        
        //デフォルトデータの準備
        this.inputtemp = this._getInputtemp();
        
        if(val == ''){//何も入っていなかったら
            this._addInput(this.inputtemp);
        }else{//何か入っていたら変換してフォームオブジェクトへセットする
            this._setInput(val);
        }
        
        //画像プレビュー
        if(this._imgPreviewFlg){
            this.$table.find('input.imageField').each(function(i){
                self._previewImg($(this));
            });
        }
        var filescript = function(){/*
			<script type="text/javascript">
					var lastImageCtrl;
					var lastFileCtrl;
					function OpenServerBrowser(url, width, height ) {
						var iLeft = (screen.width  - width) / 2 ;
						var iTop  = (screen.height - height) / 2 ;

						var sOptions = 'toolbar=no,status=no,resizable=yes,dependent=yes' ;
						sOptions += ',width=' + width ;
						sOptions += ',height=' + height ;
						sOptions += ',left=' + iLeft ;
						sOptions += ',top=' + iTop ;

						var oWindow = window.open( url, 'FCKBrowseWindow', sOptions ) ;
					}
					function BrowseServer(ctrl) {
						lastImageCtrl = ctrl;
						var w = screen.width * 0.5;
						var h = screen.height * 0.5;
						OpenServerBrowser('/manager/media/browser/mcpuk/browser.php?Type=images', w, h);
					}
					function BrowseFileServer(ctrl) {
						lastFileCtrl = ctrl;
						var w = screen.width * 0.5;
						var h = screen.height * 0.5;
						OpenServerBrowser('/manager/media/browser/mcpuk/browser.php?Type=files', w, h);
					}
					function SetUrlChange(el) {
						if ('createEvent' in document) {
							var evt = document.createEvent('HTMLEvents');
							evt.initEvent('change', false, true);
							el.dispatchEvent(evt);
						} else {
							el.fireEvent('onchange');
						}
					}
					function SetUrl(url, width, height, alt) {
						if(lastFileCtrl) {
							var c = document.getElementById(lastFileCtrl);
							if(c && c.value != url) {
							    c.value = url;
								SetUrlChange(c);
							}
							lastFileCtrl = '';
						} else if(lastImageCtrl) {
							var c = document.getElementById(lastImageCtrl);
							if(c && c.value != url) {
							    c.value = url;
								SetUrlChange(c);
							}
							lastImageCtrl = '';
						} else {
							return;
						}
					}
			</script>
			*/}.toString().split("\n").slice(1,-1).join("\n");
        this.$table.prepend(filescript);

        //イベント
        this._eventify();
    },
	_eventify: function(){
		var self = this;
		self.timerflg = true;
		//フォーム追加
		self.$table.on('click','#add_prev,#add_next',function(e){
			e.preventDefault();
			if(e.target.id == 'add_prev'){
				self._addInput();
			}else{
				self._addInput(self.inputtemp);
			}
		});
		
		//削除ボタン
		self.$table.on('click','input.del', function(e){
			e.preventDefault();
			self._removeInput(this);
		});
		
		//編集があったら更新
		self.$table.on('change', 'input,textarea,select', function(e,f){
			var f = f || false;
			self._setJson();
			if($j(this).hasClass('imageField')||f){
					self._previewImg(this);
			}
		});
		
		
		/*
		 * ImageFieldはchangeイベントを発行しない為、監視して変更があったらtriggerでchangeイベントを発行します
		 */
		var checkInput = function(elem,val){
			if(elem.val() !== val){
				elem.trigger('change', true);//changeイベントを発行
            }
            if(self.timerflg){
                setTimeout(function(){checkInput(elem,val);},500);
            }
		};
		
		//監視を開始
		self.$table.on('click','input.imageChange,img',function(){
			var elem = $j(this).closest('td').find('.imageField');
			var val = elem.val();
			self.timerflg = true;
			self.Timer = setTimeout(function(){
				checkInput(elem,val);
				}, 500);
		});
		
		//ソート
		self.$table.on('sort', function(e,$clone){
			//配列から移動したセルを削除
			for(var i=0; i < self.$inputs.length; i++){
				if(self.$table.find('tr').index(self.$inputs[i])===-1){
					delete self.$inputs[i];
				}
			}
			//セルを新しく追加
			self.$inputs.push($clone);
			//ソート
			self._sortInput();
		});
	},
	//JSONの雛形オブジェクトを作成
	_getInputtemp: function(){
	    var self = this;
	    var inputtemp;
	    switch(self.options.type){
            case 'imageList':
                inputtemp = {url:'',txt:'',alt:''};
            break;
            case 'faq':
                inputtemp = {q:'',a:''};
            break;
            case 'custom':
                inputtemp = {};
                for(var i=0; i < self.options.inputs.length; i++){
                    var input = self.options.inputs[i].split(':');
                    inputtemp[input[0]] = '';
                }
            break;
            default:
                inputtemp = {tit:'',txt:''};
        }
        return inputtemp;
	},
	//フォームオブジェクトを追加
	_addInput: function(obj){
		var self = this;
		var action = !(typeof(obj) === 'undefined');
		var obj = obj || self.inputtemp;
		var inputname = self.options.id+'_'+self._n;
		//フォームオブジェクトを取得
		var list = self._getInputSet(inputname, obj);
		
		//フォームオブジェクトが1つ以上あれば削除ボタンを表示
		list += '</td><td><input type="button" name="'+ inputname +'_del" id="'+ inputname +'_del" class="del" value="削除" />';
		list += '</td></tr>';
		//テーブルの最後にオブジェクトを追加
		if(action){
			self.$inputs[self._n] = $j(list).insertAfter(self.$table.find('tr:last'));
		}else{//新規追加
			self.$inputs[self._n] = $j(list).insertBefore(self.$table.find('tr:eq(1)'));
			setTimeout(function(){self._sortInput();}, 500);//並び替え機能の為に時間差でソートする
		}
		//並び替え用にトリガー発行
		self.$inputs[self._n].trigger('addInput');
		//インクリメント
		self._n++;
	},
	//フォームオブジェクトを削除
	_removeInput: function(elem){
		var n = this._getElemId(elem.name);
		if(confirm("この項目を削除しますか？")){
			//要素を削除
			$j(elem).closest('tr').remove();
			//配列からも削除
			this.$inputs.splice(n, 1);
			
			this._setJson();
		}
	},
	//フォームオブジェクトの内容をJSONへ変換してセットする
	_setJson: function(){
		var self = this;
		var ary = [];
		var obj = {};
		var key = this._getJsonKey();
		var $input;
		var $select;
		var chkflg;
		self.$inputs.map(function(i){
			$input = $j(i).find('input[type=text],textarea,select');
			chkflg = true;
			//要素が無ければreturn true
			if($input.length === 0){
				return true;
			}
			obj = {};//初期化
			for(var j=0; j < $input.length; j++){
				//空値チェック
				if($input.eq(j).val() !== ''){
					chkflg = false;
				}
				obj[key[j]] = $input.eq(j).val();
				
				//ダブルコーテーションをエスケープ
				obj[key[j]] = obj[key[j]].replace(/\"/g, '\\"');
				obj[key[j]] = obj[key[j]].replace(/\//g, '\/');
				if($input[j].tagName == 'SELECT'){
                    var key_name = key[j] + '_txt';
                    obj[key_name] = $input.eq(j).find('option:selected').text();
                }
				
			}
			
			//全ての要素が空だったらスルー
			if(chkflg) return true;
						
			//カスタムインプットの名前を入れる
			obj['name'] = self.options.name;
            
			ary.push(obj);
		});
		var json = ary.length===0 ? '' : $j.encodeJSON(ary);
		this.$elem.val(json);
	},
	//JSONデータをフォームオブジェクトへセット
	_setInput: function(json){
		var obj = $j.parseJSON(json);
		for(var i=0; i < obj.length; i++){
			this._addInput(obj[i]);
		};
	},
	//テーブルを出力
	_getTableSet: function(){
	var html = '<p><a id="add_prev" href="#">項目を上に追加する</a></p>';
		html += '<table class="custominput_table"><tr>';
		switch(this.options.type){
			case 'imageList':
				html += '<th>画像URL:url</th><th>説明:txt</th><th>alt</th>';
			break;
			case 'faq':
				html += '<th>質問:q</th><th>回答:a</th>';
			break;
			case 'custom':
			    for(var i=0; i < this.options.inputs.length; i++){
			        var input = this.options.inputs[i].split(':');
			        html += '<th>' + input[1] + ':' + input[0] + '</th>';
			    }
			break;
			default:
			    html += '<th>見出し（日付とか）:tit</th><th>本文:txt</th>';
		}
		if(!!this.options.selects){
		    html += '<th>選択:selecttxt</th>';
		}
		html += '<th></th></tr></table>';
		html += '<p><a id="add_next" href="#">項目を下に追加する</a></p>';
		return html;
	},
	//フォームオブジェクトを出力
	_getInputSet: function(inputname, obj){
		var html = '<tr><td>';
		switch(this.options.type){
			case 'imageList':
            self._imgPreviewFlg = true;
			html += '<input type="text" id="'+ inputname +'" name="'+ inputname +'" value="'+ obj['url'] +'" class="imageField"><input type="button" class="imgChange" value="挿入" onclick="BrowseServer(\''+ inputname +'\')">';
			html += '</td><td>';
			html += '<textarea id="'+ inputname +'_txt" name="'+ inputname +'_txt" class="inputBox" style="width: 500px">'+ obj['txt'] +'</textarea>';
			html += '</td><td>';
			html += '<input type="text" id="'+ inputname +'_alt" name="'+ inputname +'_alt" value="'+ obj['alt'] +'" class="inputBox">';
			
			break;
			case 'faq':
			html += '<input type="text" id="'+ inputname +'_q" name="'+ inputname +'_q" value="'+ obj['q'] +'" class="inputBox">';
			html += '</td><td>';
			html += '<textarea id="'+ inputname +'_a" name="'+ inputname +'_a" class="inputBox" style="width: 500px">'+ obj['a'] +'</textarea>';
			break;
			
			case 'custom':
			html += this._getCustomInput(inputname, obj);
			break;
			
			default:
			html += '<input type="text" id="'+ inputname +'_tit" name="'+ inputname +'_tit" value="'+ obj['tit'] +'" class="inputBox">';
            html += '</td><td>';
            html += '<textarea id="'+ inputname +'_txt" name="'+ inputname +'_txt" class="inputBox" style="width: 500px">'+ obj['txt'] +'</textarea>';
            break;
		}
		//選択機能
		if(!!this.options.selects){
			html += '</td><td>';
			html += this._getSelectForm(inputname, obj['select']);
		}
		return html;
	},
	//選択機能
	_getSelectForm: function(inputname,selected){
		var self = this;
		var html = '<select id="'+ inputname +'_select">';
		var ary = this.options.selects.split(',');
		for(var i = 0; i < ary.length; i++){
		    if(i == selected){
		        html += '<option value="'+ i +'" selected>'+ ary[i] +'</option>';
		    }else{
                html += '<option value="'+ i +'">'+ ary[i] +'</option>';
		    }
		}
		html += '</select>';
		return html;
	},
	
	//Jsonキーを出力
	_getJsonKey: function(){
	    var ary;
	    ary = Object.keys(this.inputtemp);
		if(!!this.options.selects){
		    ary.push('select');
		};
		return ary;
	},
	//要素のn番目を抽出
	_getElemId: function(id){
		id = id.split('_');
		return id[1];
	},
	//imageFieldの画像プレビュー
	_previewImg: function(elem){
		var $elem = $j(elem);
		var id = $elem.attr('name');
		var preview = 'div#'+ id + 'PreviewContainer';
		var val = $elem.val();
		var f;
		var html;
		//Timerを停止
		clearInterval(this.Timer);
		this.timerflg = false;
		//フォームが空であればプレビューを削除
		if(val === ''){
			$j(preview).remove();
			return false;
		}else{
			val = 'http://'+ location.hostname + '/' +val;
			//画像ファイルの存在チェック
			$j('<img />').load( val, function( response, status, xhr ) {
				f = status ==='error';
				  
				if($j(preview)[0]){
					if(f){
						$j(preview).remove();
						return false;
					}
					$j(preview).find('img').attr('src', val);
				}else{
					if(f) return false;
					
					html = '<div class="tvimage" id="'+ id +'PreviewContainer">';
					html += '<img src="'+ val +'" style="max-width:300px; max-height:100px; margin: 4px 0; cursor: pointer;" id="'+ id +'Preview" onclick="BrowseServer(\''+ id +'\')">';
					html += '</div>';
					$elem.closest('td').append(html);
				}
			});
		}
	},
	//ソート
	_sortInput: function(){
	var self = this;
	var $tr = self.$table.find('tr');
	var _a,_b;
	
	//ソート
	self.$inputs.sort(function(a,b){
		_a = $tr.index(a);
		_b = $tr.index(b);
		if( _a < _b ) return -1;
        if( _a > _b ) return 1;
        return 0;
	});
	
	//Jsonデータを更新
	self._setJson();
    },
    //カスタムインプット生成
    _getCustomInput: function(inputname, obj){
        var self = this;
        var html = '';
        var inputsary = self.options.inputs;
        var input;
        for(i=0; i < inputsary.length; i++){
            input = inputsary[i].split(':');
            switch(input[2]){
                case 'text':
                html += '<input type="text" id="'+ inputname +'_'+ input[0] +'" name="'+ inputname +'_'+ input[0] +'" value="'+ obj[input[0]] +'" class="inputBox">';
                break;
                case 'textarea':
                html += '<textarea id="'+ inputname +'_'+ input[0] +'" name="'+ inputname +'_'+ input[0] +'" class="inputBox" style="width: 500px">'+ obj[input[0]] +'</textarea>';
                break;
                case 'image':
                self._imgPreviewFlg = true;
                html += '<input type="text" id="'+ inputname +'" name="'+ inputname +'" value="'+ obj[input[0]] +'" class="imageField"><input type="button" value="挿入" class="imageChange" onclick="BrowseServer(\''+ inputname +'\')">';
                break;
                case 'select':
                html += '<select id="'+ inputname +'" name="'+ inputname +'">';
                var options  = input[3].split('/');
                for(j=0; j < options.length; j++){
                    if(j == obj[input[0]]){
                        html += '<option value="'+ j +'" selected>'+ options[j] +'</option>';
                    }else{
                        html += '<option value="'+ j +'">'+ options[j] +'</option>';
                    }
                }
                html += '</select>';
                break;
            }
            if(i+1 !== inputsary.length){
                html += '</td><td>';
            }
        }
        return html;
    }
};

//JSON形式へ変換
jQuery.encodeJSON = function ($) {
	var enc = function (data) {
		var res = "", a, b;
		switch (typeof data) {		
			case "number" :
				return data + "";
			
			case "string" :
				data = data.replace(/\n/g, "\\n");
				return '"' + data + '"';
			
			case "object" :
				if ($.isArray(data)) {
					res = "";
					for (a = 0; a < data.length; a ++) {
						if (a) {
							res += ",";
						}
						res += enc(data[a]);
					}
					return "[" + res + "]";
				}
				
				else if (data === null) {
					return "null";
				}
				
				else {
					b = 0;
					res = "";
					for (a in data) {
						if (data.hasOwnProperty(a)) {
							b ? (res += ",") : (b ++);
							res += enc(a);
							res += ":";
							res += enc(data[a]);
						}
					}
					return "{" + res + "}";
				}
			
			case "boolean":
				return data ? "true" : "false";
			
			default :
				return enc(null);
		}
	};
	return enc;
}(jQuery);

	$j(document).ready(function(){
		$j('.customInput').customInput();
	});