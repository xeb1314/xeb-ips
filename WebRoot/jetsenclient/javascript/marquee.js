//=============================================================================
// jetsennet.ui.Marquee;lixiaomin 2008-05-28 滚动控件
//=============================================================================	
jetsennet.addLoadedUri(jetsennet.getloadUri("marquee"));

jetsennet.ui.Marquee = function (eControl, sContent/*string*/) {

    this.__typeName = "jetsennet.ui.Marquee";
    this.content = sContent;        //滚动内容
    this.speed = 15;                //滚动速度
    this.control = el(eControl);     //滚动控件
    this.direction = 1;             //0:DownToUp 1: RightToLeft

    this.isInit = false;
    this._content1 = null;
    this._content2 = null;
    this._interval = null;

    var owner = this;
    this.marquee = function () {
        if (!owner.isInit) return;
        if (owner.direction == 0) {
            var scrollTop = parseInt(owner.control.scrollTop);
            if (owner._content2.offsetHeight - scrollTop <= 0) {
                owner.control.scrollTop = (scrollTop - parseInt(owner._content1.offsetHeight));
            }
            else {
                owner.control.scrollTop = (scrollTop + 1);
            }
        }
        else {
            var scrollLeft = parseInt(owner.control.scrollLeft);
            if (owner._content2.offsetWidth - scrollLeft <= 0) {
                owner.control.scrollLeft = (scrollLeft - parseInt(owner._content1.offsetWidth));
            }
            else {
                owner.control.scrollLeft = (scrollLeft + 1);
            }
        }
    }
};
jetsennet.ui.Marquee.prototype.init = function () {
    var owner = this;
    if (this.control == null)
        return;

    if (jetsennet.util.isNullOrEmpty(this.content))
        return;

    if (jetsennet.util.trim(this.control.innerHTML) == '' || this._content1 == null || this._content2 == null) {
        this.control.innerHTML = "";

        if (this.direction == 0) {
            this._content1 = document.createElement("DIV");
            this._content2 = document.createElement("DIV");
            this._content1.innerHTML = this.content;
            this._content2.innerHTML = this.content;
            this.control.appendChild(this._content1);
            this.control.appendChild(this._content2);
        }
        else {

            this._content1 = document.createElement("DIV");
            this._content2 = document.createElement("DIV");
            document.body.appendChild(this._content1);
            this._content1.innerHTML = this.content;
            this._content2.innerHTML = this.content;
            if (IS_IE) {
                this._content1.style.styleFloat = "left";
                this._content2.style.styleFloat = "left";
            }
            else {
                this._content1.style.cssFloat = "left";
                this._content2.style.cssFloat = "left";
            }

            var container = document.createElement("DIV");
            container.style.width = (parseInt(this._content1.offsetWidth) * 2) + "px";
            container.appendChild(this._content1);
            container.appendChild(this._content2);
            this.control.appendChild(container);

        }
        this.control.style.overflow = "hidden";
        this.control.onmouseover = function () { window.clearInterval(owner._interval); };
        this.control.onmouseout = function () { owner._interval = window.setInterval(owner.marquee, owner.speed); };
    }
    this.isInit = true;
};
jetsennet.ui.Marquee.prototype.start = function () {
    if (!this.isInit)
        this.init();
    this._interval = window.setInterval(this.marquee, this.speed);
};
jetsennet.ui.Marquee.prototype.stop = function () {
    window.clearInterval(this._interval);
};
jetsennet.marquee = function (container, options) {
    jQuery.extend(new jetsennet.ui.Marquee(container), options).start();
};
