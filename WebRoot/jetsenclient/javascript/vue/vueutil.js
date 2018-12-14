function Vue_Notify($this, eventName, params) {
    var func = $($this.$el).attr(eventName);
    if (func) {
        $this = $this.$parent;
        while ($this) {
            var target = $this[func];
            if (typeof target == "function") {
                target.apply($this, params);
                break;
            }
            $this = $this.$parent;
        }
    }
}
