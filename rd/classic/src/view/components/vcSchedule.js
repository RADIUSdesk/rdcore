Ext.define('Rd.view.components.vcSchedule', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcSchedule',
    colClick: function(a,b,c){
    	var c = b.dataIndex;
    	var g = this.getView();
       	var first = g.getStore().first();
       	var v = !first.get(c);		               	
		g.getStore().each(function(record) {
			record.set(c,v);
			record.commit();	
		}, g);
    },
    cellClick: function(gridView,htmlElement,columnIndex,record){
		if(columnIndex == 0){
			var val = !record.get('mon')
			record.set('mon',val);
			record.set('tue',val);
			record.set('wed',val);
			record.set('thu',val);
			record.set('fri',val);
			record.set('sat',val);
			record.set('sun',val);
		}
		if(columnIndex == 1){
			record.set('mon',!record.get('mon'));
		}
		if(columnIndex == 2){
			record.set('tue',!record.get('tue'));
		}
		if(columnIndex == 3){
			record.set('wed',!record.get('wed'));
		}
		if(columnIndex == 4){
			record.set('thu',!record.get('thu'));
		}
		if(columnIndex == 5){
			record.set('fri',!record.get('fri'));
		}
		if(columnIndex == 6){
			record.set('sat',!record.get('sat'));
		}
		if(columnIndex == 7){
			record.set('sun',!record.get('sun'));
		}
		record.commit();
	}

});
