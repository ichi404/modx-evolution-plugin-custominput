/*
 * CUSTOMINPUT並び替え機能
 */
$j.fn.dragTable = function(options){
	  return $j(this).each(function(){
		  options = $j.extend(options, {
		  	type: 'drag'//入れ替え方法[drag,button]
		  });	  
	  new $j.dragTable($j(this), options);
	  });
};
$j.dragTable = function(content,options){
	this.$elem = $j(content);
	$j('#tv_body').addClass('dragtable');
	this.$elem.find('tr').prepend('<th>並び替え</th>');
	this.options = options;
	//イベント設置
	  this._eventify();
};
$j.dragTable.prototype = {
	_eventify: function(){
		var self = this;
		self.dragevent = function(){
				if(!$j(this).hasClass('drag') && !$j(this).prev().hasClass('drag')){
					$j(this).toggleClass('fc');	
				}
		};
		//並び替えボタンを追加
		self.$elem.on({
			'addInput': function(){
				$j(this).prepend(self._getElem());
			}
		}, 'tr');
		
		if(self.options['type'] === 'drag'){
			//ドラッグ開始
			self.$elem.on({
				'mousedown': function(){
					self._dragStart($j(this).closest('tr'));
				}
			}, 'td.sort');
		}else if(self.options['type'] === 'button'){
			//ボタンで並び替え
			self.$elem.on({
				'click': function(){
					self._clickSort($j(this).closest('tr'), $j(this).attr('title'));
				}
			}, 'td.sort>input');
		}
		
	},
	//ドラッグ開始
	_dragStart: function($elem){
		var self = this;
		$elem.addClass('drag');
		//ドラッグイベントを開始
		self.$elem.on('mouseenter mouseleave','tr', self.dragevent).addClass('dragable');
		
		//マウスが離れたら順番を確定
		self.$elem.on({
				'mouseup': function(){self._dragEnd();}
		});
		
		//エリア外でマウスが離れたらキャンセル扱いに
		$j('body').on('mouseup', function(){
			self._dragCancel();
		});
	},
	//ドラッグ終了
	_dragEnd: function(){
		var self = this;
		var $insert = self.$elem.find('tr.fc');
		var $cell = self.$elem.find('tr.drag');
		
		if($insert.length === 0){
			self._dragCancel();
			return false;
		}
		//ソート確定
		self._sort($insert, $cell, 'up');
		
		//フォーカスを解除
		self.$elem.find('tr').removeClass('fc');
		setTimeout(function(){self.$elem.find('tr').removeClass('drag');}, 300);
		
		//マウスイベントを解除
		self.$elem.off('mouseenter mouseleave','tr').removeClass('dragable');
		self.$elem.off('mouseup');
		$j('body').off('mouseup');
	},
	//ドラッグキャンセル
	_dragCancel: function(){
		this.$elem.removeClass('dragable').find('tr.drag').removeClass('drag');
		this.$elem.off('mouseenter mouseleave','tr');
	},
	//ソート
	_sort: function($insert, $cell, action){
		var self = this;
		var $cell_clone = $cell.clone();
		//指定位置にセルの複製を追加
		if(action === 'up'){
			$insert.before($cell_clone);
		}else{
			$insert.after($cell_clone);
		}
		//元のセルは削除
		$cell.remove();
		//配列をソート（順番を変更したセルを送る）
		self.$elem.trigger('sort', $cell_clone);
	},
	//ボタンでソート
	_clickSort: function($elem, action){
		var self = this;
		var $insert = action === 'up' ? $elem.prev() : $elem.next();
		var i = self.$elem.find('tr').index($insert);
		if(i < 0){
			return false;
		}
		if(action === 'up'){
			if($insert.find('th').length !== 0){
				return false;
			}
		}
		
		self._sort($insert, $elem, action);
	},
	//並び替え方法
	_getElem: function(){
		var self = this;
		switch(self.options['type']){
			case 'drag':
			return '<td class="sort"><span>≡</span></td>';
			break;
			case 'button':
			return '<td class="sort btn"><input type="button" value="↑" title="up" /><input type="button" value="↓" title="down" /></td>';
			break;
		}
	}
};
