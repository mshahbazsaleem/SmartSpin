 (function($) {
    $.fn.extend({
        spinit: function(options) {
            var settings = $.extend({ min: 'none', max: 'none', initValue: 0, callback: null, stepInc: 1, pageInc: 10,  roundPrecision : 'none', width: 'inherit', height: 'inherit', btnWidth: 10, mask: '' }, options);
            return this.each(function() {
                var UP = 38;
                var DOWN = 40;
                var PAGEUP = 33;
                var PAGEDOWN = 34;
                var mouseCaptured = false;
                var mouseIn = false;
                var interval;
                var direction = 'none';
                var isPgeInc = false;
                var value = getNewValueByInputValueAndMinOption(settings.initValue);
                var el = $(this).val(value).addClass('smartspinner');
                if (settings.width != 'inherit') {
                    el.css('width', (settings.width) + 'px');
                }
                if (settings.height != 'inherit') {
                    el.css('height', settings.height + 'px');
                }
                raiseCallback(value);
                if (settings.mask != '') el.val(settings.mask);
                $.fn.reset = function(val) {
                    if (isNaN(val)) val = 0;
                    value = getNewValueByInputValueAndMinOption(val);
                    $(this).val(value);
                    raiseCallback(value);
                };
                function setDirection(dir) {
                    direction = dir;
                    isPgeInc = false;
                    switch (dir) {
                        case 'up':
                            setClass('up');
                            break;
                        case 'down':
                            setClass('down');
                            break;
                        case 'pup':
                            isPgeInc = true;
                            setClass('up');
                            break;
                        case 'pdown':
                            isPgeInc = true;
                            setClass('down');
                            break;
                        case 'none':
                            setClass('');
                            break;
                    }
                }
                el.focusin(function() {
                    el.val(value);
                });
                el.click(function(e) {
                    mouseCaptured = true;
                    isPgeInc = false;
                    clearInterval(interval);
                    onValueChange();
                });
                el.mouseenter(function(e) {
                    el.val(value);
                });
                el.mousemove(function(e) {
                    if (e.pageX > (el.offset().left + el.width()) - settings.btnWidth - 4) {
                        if (e.pageY < el.offset().top + el.height() / 2)
                            setDirection('up');
                        else
                            setDirection('down');
                    }
                    else
                        setDirection('none');
                });
                el.mousedown(function(e) {
                    isPgeInc = false;
                    clearInterval(interval);
                    interval = setInterval(onValueChange, 100);
                });
                el.mouseup(function(e) {
                    mouseCaptured = false;
                    isPgeInc = false;
                    clearInterval(interval);

                });
                el.mouseleave(function(e) {
                    setDirection('none');
                    if (settings.mask != '') el.val(settings.mask);
                });
                el.keydown(function(e) {
                    switch (e.which) {
                        case UP:
                            setDirection('up');
                            onValueChange();
                            break; // Arrow Up
                        case DOWN:
                            setDirection('down');
                            onValueChange();
                            break; // Arrow Down
                        case PAGEUP:
                            setDirection('pup');
                            onValueChange();
                            break; // Page Up
                        case PAGEDOWN:
                            setDirection('pdown');
                            onValueChange();
                            break; // Page Down
                        default:
                            setDirection('none');
                            break;
                    }
                });

                el.keyup(function(e) {
                    setDirection('none');
                });
                el.keypress(function(e) {
                    if (el.val() == settings.mask) el.val(value);
                    var sText = getSelectedText();
                    if (sText != '') {
                        sText = el.val().replace(sText, '');
                        el.val(sText);
                    }
                    if (e.which >= 48 && e.which <= 57) {
                        var temp = parseFloat(el.val() + (e.which - 48));
                        if (isValueInMinMaxSegment(temp)) {
                            value = temp;
                            raiseCallback(value);
                        }
                        else {
                            e.preventDefault();
                        }
                    }
                });
                el.blur(function() {
                    if (settings.mask == '') {
                        if (el.val() == '')
                            el.val(settings.min != 'none' ? settings.min  : 0);
                    }
                    else {
                        el.val(settings.mask);
                    }
                });
                el.bind("mousewheel", function(e) {
                    if (e.wheelDelta >= 120) {
                        setDirection('down');
                        onValueChange();
                    }
                    else if (e.wheelDelta <= -120) {
                        setDirection('up');
                        onValueChange();
                    }

                    e.preventDefault();
                });
                if (this.addEventListener) {
                    this.addEventListener('DOMMouseScroll', function(e) {
                        if (e.detail > 0) {
                            setDirection('down');
                            onValueChange();
                        }
                        else if (e.detail < 0) {
                            setDirection('up');
                            onValueChange();
                        }
                        e.preventDefault();
                    }, false);
                }

                function raiseCallback(val) {
                    if (settings.callback != null) settings.callback(val);
                }
                function getSelectedText() {

                    var startPos = el.get(0).selectionStart;
                    var endPos = el.get(0).selectionEnd;
                    var doc = document.selection;

                    if (doc && doc.createRange().text.length != 0) {
                        return doc.createRange().text;
                    } else if (!doc && el.val().substring(startPos, endPos).length != 0) {
                        return el.val().substring(startPos, endPos);
                    }
                    return '';
                }
                function setValue(a, b) {
                    if (isValueInMinMaxSegment(a)) {
                        value = b;
                    } el.val(value);
                }
                function onValueChange() {
                    if (direction == 'up') {
                        value += settings.stepInc;
                        value = getNewValueByInputValueAndMaxOption(value);
                        if (settings.roundPrecision != 'none') {
                            value = roundValueToPrecision(value);
                        }
                        value = getNewValueByInputValueAndMaxOption(value);
                        setValue(parseFloat(el.val()), value);
                    }
                    if (direction == 'down') {
                        value -= settings.stepInc;
                        value = getNewValueByInputValueAndMinOption(value);
                        if (settings.roundPrecision != 'none') {
                            value = roundValueToPrecision(value);
                        }
                        setValue(parseFloat(el.val()), value);
                    }
                    if (direction == 'pup') {
                        value += settings.pageInc;
                        value = getNewValueByInputValueAndMaxOption(value);
                        if (settings.roundPrecision != 'none') {
                            value = roundValueToPrecision(value);
                        }
                        setValue(parseFloat(el.val()), value);
                    }
                    if (direction == 'pdown') {
                        value -= settings.pageInc;
                        value = getNewValueByInputValueAndMinOption(value);
                        if (settings.roundPrecision != 'none') {
                            value = roundValueToPrecision(value);
                        }
                        setValue(parseFloat(el.val()), value);
                    }
                    raiseCallback(value);
                }
                function setClass(name) {
                    el.removeClass('up').removeClass('down');
                    if (name != '') el.addClass(name);
                }
                function getNewValueByInputValueAndMinOption(val) {
                    return settings.min != 'none' ? Math.max(val, settings.min) : val;
                }
                function getNewValueByInputValueAndMaxOption(val) {
                    return settings.max != 'none' ? Math.min(val, settings.max) : val;
                }           
                function isValueInMinMaxSegment (val) {
                    return ((settings.min == 'none' || val >= settings.min) && (settings.max == 'none' || val <= settings.max));
                }
                function roundValueToPrecision(value)
                {
                    var preFactor = Math.pow(10, settings.roundPrecision);
                    return Math.round(value * preFactor)/preFactor;
                }
            });
        }
    });
})(jQuery);
