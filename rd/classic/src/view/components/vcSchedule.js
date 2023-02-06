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
			var val = !record.get('mo')
			record.set('mo',val);
			record.set('tu',val);
			record.set('we',val);
			record.set('th',val);
			record.set('fr',val);
			record.set('sa',val);
			record.set('su',val);
		}
		if(columnIndex == 1){
			record.set('mo',!record.get('mo'));
		}
		if(columnIndex == 2){
			record.set('tu',!record.get('tu'));
		}
		if(columnIndex == 3){
			record.set('we',!record.get('we'));
		}
		if(columnIndex == 4){
			record.set('th',!record.get('th'));
		}
		if(columnIndex == 5){
			record.set('fr',!record.get('fr'));
		}
		if(columnIndex == 6){
			record.set('sa',!record.get('sa'));
		}
		if(columnIndex == 7){
			record.set('su',!record.get('su'));
		}
		record.commit();
	}

});
