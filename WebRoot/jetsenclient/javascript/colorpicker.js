// lixiaomin 2010/07/21
//=============================================================================
// Jetsen UI ColorPicker
//=============================================================================
jetsennet.addLoadedUri(jetsennet.getloadUri("colorpicker"));

jetsennet.ui.ColorPicker = function (container) {
    this.__typeName = "jetsennet.ui.ColorPicker";
    this.container = container == null ? document.body : container;
    this.onchange = function () { };
    this.colorSelected = null;
    this.currentRGB = '#000000';
    this.currentGRAY = '120';
    this.lastRGB = '';
    this.hexch = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F');
};
jetsennet.ui.ColorPicker.prototype.create = function (doc) {
    doc = doc == null ? document : doc;

    var control = doc.getElementById('jetsen-control-colorpicker');
    if (control != null)
        return control;

    var cnum = new Array(1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0);
    var owner = this;

    control = doc.createElement("div");
    control.id = 'jetsen-control-colorpicker';
    control.style.width = "250px";
    control.className = "title";

    var containertable = doc.createElement("table");
    containertable.cellSpacing = 5;
    var containerbody = doc.createElement("tbody");
    containertable.appendChild(containerbody);
    var containertr = doc.createElement("tr");
    containerbody.appendChild(containertr);

    var colortd = doc.createElement("td");
    var graytd = doc.createElement("td");
    containertr.appendChild(colortd);
    containertr.appendChild(graytd);

    var colortable = doc.createElement("table");
    colortable.id = "colorpicker-colortable";
    colortable.cellSpacing = 0;
    colortable.cellPadding = 0;
    colortable.style.cursor = "pointer";
    colortd.appendChild(colortable);

    colortable.onclick = function () {
        owner.currentRGB = jetsennet.getEvent().srcElement.bgColor;
        owner.endColor();
        jetsennet.cancelEvent();
    };
    colortable.onmouseover = function () {
        el('colorpicker-rgb').innerText = jetsennet.getEvent().srcElement.bgColor.toUpperCase();
        owner.endColor();
        jetsennet.cancelEvent();
    };
    colortable.onmouseout = function () {
        el('colorpicker-rgb').innerText = owner.currentRGB;
        owner.endColor();
        jetsennet.cancelEvent();
    };

    var colortablebody = doc.createElement("tbody");
    colortable.appendChild(colortablebody);

    for (i = 0; i < 16; i++) {
        var tr = doc.createElement("tr");
        colortablebody.appendChild(tr);

        for (j = 0; j < 30; j++) {
            n1 = j % 5;
            n2 = Math.floor(j / 5) * 3;
            n3 = n2 + 3;

            var td = doc.createElement("td");
            td.style.width = "8px";
            td.style.height = "8px";
            td.bgColor = this.toColor((cnum[n3] * n1 + cnum[n2] * (5 - n1)),
                (cnum[n3 + 1] * n1 + cnum[n2 + 1] * (5 - n1)),
                (cnum[n3 + 2] * n1 + cnum[n2 + 2] * (5 - n1)), i);

            tr.appendChild(td);
        }

    }

    var graytable = doc.createElement("table");
    graytable.cellSpacing = 0;
    graytable.cellPadding = 0;
    graytable.id = "colorpicker-graytable";
    graytable.style.cursor = "pointer";
    graytd.appendChild(graytable);

    var graytablebody = doc.createElement("tbody");
    graytable.appendChild(graytablebody);

    for (i = 255; i >= 0; i -= 8.5) {
        var tr = doc.createElement("tr");
        graytablebody.appendChild(tr);
        var td = doc.createElement("td");
        td.style.width = "20px";
        td.style.height = "4px";
        td.title = Math.floor(i * 16 / 17);
        tr.bgColor = '#' + this.toHex(i) + this.toHex(i) + this.toHex(i);
        tr.appendChild(td);
    }
    graytable.onclick = function () {
        owner.currentGRAY = jetsennet.getEvent().srcElement.title;
        owner.endColor();
        jetsennet.cancelEvent();
        return false;
    };
    graytable.onmouseover = function () {
        el('colorpicker-gray').innerText = jetsennet.getEvent().srcElement.title;
        owner.endColor();
        jetsennet.cancelEvent();
        return false;
    };
    graytable.onmouseout = function () {
        el('colorpicker-gray').innerText = owner.currentGRAY;
        owner.endColor();
        jetsennet.cancelEvent();
        return false;
    };

    control.appendChild(containertable);

    var notecontrol = doc.createElement("div");
    var notetable = doc.createElement("table");
    notetable.cellSpacing = 0;
    notetable.cellPadding = 0;
    notetable.style.width = "100%";
    notecontrol.appendChild(notetable);

    var notetablebody = doc.createElement("tbody");
    notetable.appendChild(notetablebody);

    var notetr = doc.createElement("tr");
    notetablebody.appendChild(notetr);

    var td = doc.createElement("td");
    td.innerHTML = "<table border=\"1\" width=\"25\" height=\"25\" cellspacing=\"0\" cellpadding=\"0\"><tr><td ID=\"colorpicker-showcolor\" bgcolor=\"#000000\" ></td></tr></table><span id=\"colorpicker-selcolor\">#000000</span>";
    td.align = "center";
    td.style.width = "80px";
    notetr.appendChild(td);
    //td.onclick = function(){jetsennet.cancelEvent();};

    td = doc.createElement("td");
    td.innerHTML = "基色 :<span id=\"colorpicker-rgb\">#000000</SPAN><BR>亮度 :<span id=\"colorpicker-gray\">120</span>";
    notetr.appendChild(td);
    //td.onclick = function(){jetsennet.cancelEvent();};

    td = doc.createElement("td");
    td.align = "center";
    td.style.width = "60px";
    var okbutton = doc.createElement("input");
    okbutton.type = "button";
    okbutton.className = "btn btn-primary btn-sm";
    okbutton.value = "确定";
    okbutton.onclick = function () {
        if (owner.colorSelected)
            owner.colorSelected(el('colorpicker-selcolor').innerHTML);
    };
    td.appendChild(okbutton);
    notetr.appendChild(td);

    notecontrol.onclick = function () { jetsennet.cancelEvent(); };

    control.appendChild(notecontrol);

    return control;
};
jetsennet.ui.ColorPicker.prototype.toColor = function (r, g, b, n) {
    r = ((r * 16 + r) * 3 * (15 - n) + 0x80 * n) / 15;
    g = ((g * 16 + g) * 3 * (15 - n) + 0x80 * n) / 15;
    b = ((b * 16 + b) * 3 * (15 - n) + 0x80 * n) / 15;

    return '#' + this.toHex(r) + this.toHex(g) + this.toHex(b);
};
jetsennet.ui.ColorPicker.prototype.toHex = function (n) {
    var h, l;
    n = Math.round(n);
    l = n % 16;
    h = Math.floor((n / 16)) % 16;
    return (this.hexch[h] + this.hexch[l]);
};
jetsennet.ui.ColorPicker.prototype.doColor = function (c, l) {
    var r, g, b;

    r = '0x' + c.substring(1, 3);
    g = '0x' + c.substring(3, 5);
    b = '0x' + c.substring(5, 7);

    if (l > 120) {
        l = l - 120;

        r = (r * (120 - l) + 255 * l) / 120;
        g = (g * (120 - l) + 255 * l) / 120;
        b = (b * (120 - l) + 255 * l) / 120;
    }
    else {
        r = (r * l) / 120;
        g = (g * l) / 120;
        b = (b * l) / 120;
    }
    return '#' + this.toHex(r) + this.toHex(g) + this.toHex(b);
};
jetsennet.ui.ColorPicker.prototype.endColor = function () {
    if (this.lastRGB != this.currentRGB) {
        var i;
        this.lastRGB = this.currentRGB;
        for (i = 0; i <= 30; i++) {
            el('colorpicker-graytable').rows[i].bgColor = this.doColor(this.currentRGB, 240 - i * 8);
        }
    }

    el('colorpicker-selcolor').innerHTML = this.doColor(el('colorpicker-rgb').innerText, el('colorpicker-gray').innerText);
    el('colorpicker-showcolor').bgColor = el('colorpicker-selcolor').innerHTML;
};

jetsennet.pickColor = function (control, callBack) {
    var controlColorPicker = document.getElementById('jetsen-control-colorpicker');
    if (controlColorPicker == null) {
        var cp = new jetsennet.ui.ColorPicker();
        controlColorPicker = cp.create();
        document.body.appendChild(controlColorPicker);
        controlColorPicker.colorPicker = cp;
    }

    jetsennet.popup(controlColorPicker, { reference: control });
    controlColorPicker.colorPicker.colorSelected = function (val) {
        if (val != null) {
            if (callBack != null) {
                callBack(val);
            }
            else {
                if (control != null) {
                    control.value = val;
                    control.fireEvent("onchange");
                }
            }
        }
        jetsennet.hide(controlColorPicker);
    };
    return false;
};

jQuery.fn.pickColor = function (options) {
    this.click(
        function () {
            jetsennet.pickColor(this);
        }
    );

};