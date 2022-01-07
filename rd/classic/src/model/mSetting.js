Ext.define('Rd.model.mSetting', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'google_map_api_key', type: 'string' },
        { name: 'baidu_map_api_key', type: 'string' },
        {name: 'map_to_use', type: 'string' }
    ]
});
