Ext.define('Rd.view.components.vCmbLanguages', {
    extend			: 'Ext.form.ComboBox',
    alias 			: 'widget.cmbLanguages',
    fieldLabel		: i18n('sChoose_a_language'),
    labelSeparator	: '',
    store			: 'sLanguages',
    queryMode		: 'local',
    valueField		: 'id',
    displayField	: 'text',
    typeAhead		: true,
    mode			: 'local',
    itemId			: 'cmbLanguage',
    tpl	            : Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<div class="x-boundlist-item">',
		        '<img src="{icon_file}" style="float:left;margin:5px;"/>',
		        '<div style="margin-left:70px;font-weight:bold;font-size:16px;">{country}</div>',
               	'<div style="margin-left:70px;font-size: 14px;color: #4d4d4d;">{language}</div>',    
            '</div>',
        '</tpl>'
    ),
    displayTpl		: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '{country} - {language}',
        '</tpl>'
    )
});
