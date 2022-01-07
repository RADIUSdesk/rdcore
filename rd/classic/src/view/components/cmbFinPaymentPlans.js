Ext.define('Rd.view.components.cmbFinPaymentPlans', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbFinPaymentPlans',
    fieldLabel      : 'Payment plan',
    labelSeparator  : '',
    forceSelection  : true,
    queryMode       : 'remote',
    valueField      : 'id',
    displayField    : 'name',
    typeAhead       : true,
    allowBlank      : false,
    mode            : 'local',
    name            : 'fin_payment_plan_id',
    labelClsExtra   : 'lblRd',
    extraParam      : false,
	store			: 'sFinPaymentPlans',
    initComponent   : function() {

        this.callParent(arguments);
    }
});
