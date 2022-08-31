Ext.define('Rd.model.mMeshViewNodeNode', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',            type: 'int'     },
        {name: 'name',          type: 'string'  },
        {name: 'mac'},
        {name: 'tx_bytes',      type: 'int' },
        {name: 'rx_bytes',      type: 'int' },
        {name: 'signal_avg' },
        {name: 'signal_avg_bar' },
        {name: 'signal' },
        {name: 'signal_bar' },
        
        {name: 'peer_name' },
        {name: 'peer_last_contact'},
        {name: 'peer_l_contact_human'},
        {name: 'peer_state'},

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
        {name: 'l_entry'},
        {name: 'l_contact'},
        {name: 'l_contact_human'},
        {name: 'state'}
        ]
});
