Ext.define('Rd.model.mApViewEntry', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',            type: 'int'     },
        {name: 'name',          type: 'string'  },
        {name: 'ap_profile_entry_id'},
        {name: 'mac'},
        {name: 'vendor'},
        {name: 'vendor'},
        {name: 'tx_bytes',      type: 'int' },
        {name: 'rx_bytes',      type: 'int' },
        {name: 'signal_avg' },
        {name: 'signal_avg_bar' },
        {name: 'signal' },
        {name: 'signal_bar' },

        //Some latest connection stuff which will be shown in a pop-up
        {name: 'l_tx_bitrate',    type: 'int' },
        {name: 'l_rx_bitrate',    type: 'int' },
        {name: 'l_tx_bytes',      type: 'int' },
        {name: 'l_rx_bytes',      type: 'int' },
        {name: 'l_MFP'},
        {name: 'l_tx_failed',   type: 'int'},
        {name: 'l_tx_retries',  type: 'int'},
        {name: 'l_modified'},
        {name: 'l_modified_human'},
        {name: 'l_authenticated'},
        {name: 'l_authorized'},
        {name: 'l_node'}
        ]
});
