Ext.define('Rd.model.mDynamicPhoto', {
    extend: 'Ext.data.Model',
    fields: [
            'id', 'dynamic_detail_id', 'title', 'description','url','file_name', 'img',
            {name: 'active',type: 'bool'},
            'fit',
            'background_color',
            'slide_duration',
            {name: 'include_title',type: 'bool'},
            {name: 'include_description',type: 'bool'}
        ]
});
