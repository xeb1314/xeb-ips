jetsennet.require(['gridlist', 'pagebar', 'window', 'crud', 'pageframe']);

//=============== 变量声明 ===============//
var gContactCrud;

/**
 * 初始化页面
 */
function pageInit() {
    $('#divPageFrame').pageFrame({showSplit: false, minSize: {width: '100%', height: 0}, splitType: 1, layout: [100, 42, 'auto', 35]}).sizeBind(window);
    // 初始化告警联系人
    alarmContactInit();
    gContactCrud.load();
}

/**
 * 告警联系人列表
 */
function alarmContactInit() {
    var columns = [
        {fieldName: 'ALARMOBJ_ID', width: 30, align: 'center', isCheck: 1, checkName: 'chkContact'},
        {fieldName: 'NAME', sortField: 'NAME', width: '100%', align: 'left', name: '联系人名'},
        {fieldName: 'ALARM_TYPE', sortField: 'ALARM_TYPE', width: 200, align: 'center', name: '告警类型', format: function(val, vals) {
            switch(parseInt(val, 10)) {
            case 100:
                return '白名单';
            case 200:
                return '黑名单';
            default:
                return '';
            }
        }},
        {fieldName: 'IP', sortField: 'IP', width: 300, align: 'center', name: 'ip地址'},
        {fieldName: 'EMAIL', sortField: 'EMAIL', width: 300, align: 'center', name: '邮件地址'},
        {fieldName: 'PHONE', sortField: 'PHONE', width: 200, align: 'center', name: '联系人电话'},
        {fieldName: 'ALARMOBJ_ID', width: 45, align: 'center', name: '编辑', format: function(val, vals) {
            return jetsennet.Crud.getEditCell("gContactCrud.edit('" + val + "')");
        }},
        {fieldName: 'ALARMOBJ_ID', width: 45, align: 'center', name: '删除', format: function(val, vals) {
            return jetsennet.Crud.getDeleteCell("gContactCrud.remove('" + val + "')");
        }}
    ];
    
    gContactCrud = $.extend(new jetsennet.Crud('divAlarmContactList', columns, 'divAlarmContactPage'), {
        dao: IPSDAO,
        tableName: 'IPS_ALARMCONTACTS',
        keyId: 'ALARMOBJ_ID',
        checkId: 'chkContact',
        cfgId: 'divAlarmContactWin',
        resultFields: 't.*',
        name: '告警',
        className: 'jetsennet.ips.schema.IpsAlarmcontacts',
        onAddValid: function() {
            return true;
        },
        onAddGet: function() {
            var data = {
                ALARM_TYPE: el('selType').value,
                IP: el('txtIP').value,
                EMAIL: el('txtEmail').value,
                PHONE: el('txtPhone').value,
                NAME: el('txtName').value
            };
            return data;
        },
        onAddSuccess: function(obj) {
        },
        onEditSet: function(obj) {
            el('selType').value = obj['ALARM_TYPE'];
            el('txtIP').value = obj['IP'];
            el('txtEmail').value = obj['EMAIL'];
            el('txtPhone').value = obj['PHONE'];
            el('txtName').value = obj['NAME'];
        },
        onEditValid: function(id, obj) {
            return true;
        },
        onEditGet: function(id) {
            var data = {
                ALARMOBJ_ID: id,
                ALARM_TYPE: el('selType').value,
                IP: el('txtIP').value,
                EMAIL: el('txtEmail').value,
                PHONE: el('txtPhone').value,
                NAME: el('txtName').value
            };
            return data;
        },
        onEditSuccess: function(obj) {
        }
    });
}

/**
 * 新增告警联系人
 */
function addContact() {
    gContactCrud.add();
}

/**
 * 编辑告警联系人
 */
function editContact() {
    var ids = jetsennet.form.getCheckedValues('chkContact');
    if (ids.length === 0) {
        jetsennet.warn('请选择要编辑的告警联系人!');
        return;
    }
    if (ids.length === 1) {
        gContactCrud.edit(ids[0]);
    } else {
        jetsennet.warn('一次只能编辑一条告警联系人!');
        return;
    }
}

/**
 * 删除告警联系人
 */
function delContact() {
    var ids = jetsennet.form.getCheckedValues('chkContact');
    if (ids.length === 0) {
        jetsennet.warn('请选择要删除的告警联系人!');
        return;
    }
    jetsennet.confirm('删除后无法恢复！确定删除?', function () {
        var params = new HashMap();
        params.put('className', 'jetsennet.ips.schema.IpsAlarmcontacts');
        params.put('deleteIds', ids.join(','));
        var result = IPSDAO.execute('commonObjDelete', params);
        if (result && result.errorCode == 0) {
            jetsennet.message('删除成功！');
            gContactCrud.load();
            return true;
        }
    });
}

/**
 * 告警查询
 */
function searchAlarmContact() {
    var conditions = [],
        keyword = el('txtKeyWord').value,
        selType = el('selSearchType').value;
    if (!!selType) {
        conditions.push(['ALARM_TYPE', selType, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
    }
    if (!!keyword) {
        conditions.push(['NAME', keyword , jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like]);
    }
    gContactCrud.search(conditions);
}