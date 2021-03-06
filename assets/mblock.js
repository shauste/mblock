/**
 * Created by joachimdoerr on 30.07.16.
 */
$(function () {
    mblock_init();
    $(document).on('pjax:end', function() {
        mblock_init();
    });
});

var mblock_module = (function(){
    var callbacks = {
        add_item_start: [],
        reindex_end: [],
    };
    var mod = {}

    // Register a callback
    // @input evnt string name of the event
    // @input f function callback
    // @output void
    mod.registerCallback = function(evnt, f) {
        callbacks[evnt].push(f);
    }

    // @input evnt string name of the event
    // @output []function
    mod.getRegisteredCallbacks = function(evnt) {
        if (typeof callbacks[evnt] === 'undefined') {
            return [];
        }
        else {
            return callbacks[evnt];
        }
    }

    // @input evnt string name of the event
    // @output void
    mod.executeRegisteredCallbacks = function(evnt) {
        var list = mod.getRegisteredCallbacks(evnt);
        for (var i=0;i<list.length;i++) {
            list[i]();
        }
    }

    return mod;
})();

function mblock_init() {
    var mblock = $('.mblock_wrapper');
    // init by siteload
    if ($('#REX_FORM').length && mblock.length) {
        mblock.each(function(){
            mblock_sort($(this));
            mblock_set_unique_id($(this), false);
        });
    }
}

// List with handle
function mblock_init_sort(element) {
    // reindex
    mblock_reindex(element);
    // init
    mblock_sort(element);
}

function mblock_sort(element) {
    // add linking
    mblock_add(element);
    // remove mblock_remove
    mblock_remove(element);
    // init sortable
    mblock_sort_it(element);
}

function mblock_remove(element) {
    var finded = element.find('> div');

    if (finded.length == 1) {
        finded.find('.removeme').prop('disabled', true);
    } else {
        finded.find('.removeme').prop('disabled', false);
    }

    // has data?
    if(element.data().hasOwnProperty('max')) {
        if (finded.length >= element.data('max')) {
            element.find('.addme').prop('disabled', true);
        } else {
            element.find('.addme').prop('disabled', false);
        }
    }

    if(element.data().hasOwnProperty('min')) {
        if (finded.length <= element.data('min')) {
            element.find('.removeme').prop('disabled', true);
        } else {
            element.find('.removeme').prop('disabled', false);
        }
    }

    finded.each(function(index){
        // min removeme hide
        if ((index+1)==element.data('min') && finded.length == element.data('min')) {
            $(this).find('.removeme').prop('disabled', true);
        }
        if (index==0) {
            $(this).find('.moveup').prop('disabled', true);
        } else {
            $(this).find('.moveup').prop('disabled', false);
        }
        if ((index + 1)== finded.length) { // if max count?
            $(this).find('.movedown').prop('disabled', true);
        } else {
            $(this).find('.movedown').prop('disabled', false);
        }
    });
}

function mblock_sort_it(element) {
    element.mblock_sortable({
        handle: '.sorthandle',
        animation: 150,
        onEnd: function () {
            mblock_reindex(element);
        }
    });
}

function mblock_reindex(element) {
    // remove mblock_remove
    mblock_remove(element);

    var initredactor = false,
        initmarkitup = false;

    element.find('> div').each(function(index) {
        // find input elements
        $(this).find('input,textarea,select,button').each(function(key) {
            var attr = $(this).attr('name');
            eindex = key + 1;
            sindex = index + 1;
            // For some browsers, `attr` is undefined; for others,
            // `attr` is false. Check for both.
            if (typeof attr !== typeof undefined && attr !== false) {
                var value = $(this).attr('name').replace($(this).attr('name').match(/\]\[\d+\]\[/g), '][' + index + '][');
                $(this).attr('name', value);
            }

            // if ($(this).attr('id')) {
            //     mblock_replace_for(element, $(this), index);
            // }

            // select rex button
            if ($(this).prop("nodeName") == 'SELECT' && $(this).attr('id') && (
                    $(this).attr('id').indexOf("REX_MEDIALIST_SELECT_") >= 0 ||
                    $(this).attr('id').indexOf("REX_LINKLIST_SELECT_") >= 0
                )) {
                $(this).parent().data('eindex', eindex);
                $(this).attr('id', $(this).attr('id').replace(/_\d+/, '_' + sindex + '00' + eindex));
                if ($(this).attr('name') != undefined) {
                    $(this).attr('name', $(this).attr('name').replace(/_\d+/, '_' + sindex + '00' + eindex));
                }
            }

            // input rex button
            if ($(this).prop("nodeName") == 'INPUT' && $(this).attr('id') && (
                    $(this).attr('id').indexOf("REX_LINKLIST_") >= 0 ||
                    $(this).attr('id').indexOf("REX_MEDIALIST_") >= 0
                )) {
                if ($(this).parent().data('eindex')) {
                    eindex = $(this).parent().data('eindex');
                }
                $(this).attr('id', $(this).attr('id').replace(/\d+/, sindex + '00' + eindex));

                // button
                $(this).parent().find('a.btn-popup').each(function () {
                    $(this).attr('onclick', $(this).attr('onclick').replace(/\(\d+/, '(' + sindex + '00' + eindex));
                    $(this).attr('onclick', $(this).attr('onclick').replace(/_\d+/, '_' + sindex + '00' + eindex));
                });
            }

            // input rex button
            if ($(this).prop("nodeName") == 'INPUT' && $(this).attr('id') && (
                    $(this).attr('id').indexOf("REX_LINK_") >= 0 ||
                    $(this).attr('id').indexOf("REX_MEDIA_") >= 0
                )) {
                if ($(this).attr('type') != 'hidden') {
                    if ($(this).parent().data('eindex')) {
                        eindex = $(this).parent().data('eindex');
                    }
                    $(this).attr('id', $(this).attr('id').replace(/\d+/, sindex + '00' + eindex));

                    if ($(this).next().attr('type') == 'hidden') {
                        $(this).next().attr('id', $(this).next().attr('id').replace(/\d+/, sindex + '00' + eindex));
                    }

                    // button
                    $(this).parent().find('a.btn-popup').each(function () {
                        if($(this).attr('onclick')) {
                            $(this).attr('onclick', $(this).attr('onclick').replace(/\(\d+/, '(' + sindex + '00' + eindex));
                            $(this).attr('onclick', $(this).attr('onclick').replace(/_\d+/, '_' + sindex + '00' + eindex));
                        }
                    });
                }
            }
        });

        var mselect = $(this).find('.multiple-select');
        if (mselect.length > 0) {
            mform_multiple_select(mselect);
        }

        $(this).find('.custom-link').each(function(key){
            eindex = key + 1;
            sindex = index + 1;
            customlink = $(this);
            $(this).find('input').each(function(){
                if($(this).attr('id')) {
                    $(this).attr('id', $(this).attr('id').replace(/\d+/, sindex + '00' + eindex));
                }
            });
            $(this).find('a.btn-popup').each(function(){
                if($(this).attr('id')) {
                    $(this).attr('id', $(this).attr('id').replace(/\d+/, sindex + '00' + eindex));
                }
            });
            customlink.attr('data-id', sindex + '00' + eindex);
            if(typeof mform_custom_link === 'function') mform_custom_link(customlink);
        });

        $(this).find('.redactor-box').each(function(key){
            initredactor = true;
            eindex = key + 1;
            sindex = index + 1;
            $(this).find('textarea').each(function(){
                if($(this).attr('id')) {
                    $(this).attr('id', $(this).attr('id').replace(/\d+/, sindex + '00' + eindex));
                }
            });
        });

        $(this).find('.markitup_markdown, .markitup_textile').each(function(key){
            initmarkitup = true;
            eindex = key + 1;
            sindex = index + 1;
            $(this).find('textarea').each(function(){
                if($(this).attr('id')) {
                    $(this).attr('id', $(this).attr('id').replace(/\d+/, sindex + '00' + eindex));
                }
            })
        });

    });

    if (initredactor) {

        $('.redactor-box').each(function(){
            var area;
            var content = '';
            $(this).find('div.redactor-in').each(function () {
                if ($(this).attr('role')) {
                    content = $(this).html();
                }
            });
            $(this).find('textarea').each(function(){
                var attr = $(this).attr('class');
                if (typeof attr !== typeof undefined && attr !== false) {
                    if ($(this).attr('class').indexOf("redactor") >= 0) {
                        area = $(this).clone().css('display','block');
                    }
                }
            });
            if (typeof area === 'object') {
                if (area.length) {
                    $(this).parent().append(area);
                    $(this).parent().find('textarea').val(content);
                    $(this).remove();
                }
            }
        });

        if(typeof redactorInit === 'function') redactorInit();
    }

    if (initmarkitup) {

        $('.markitup_markdown, .markitup_textile').each(function(){
            var area;
            $(this).find('textarea').each(function(){
                area = $(this).clone();
            });
            if (typeof area === 'object') {
                if (area.length) {
                    $(this).parent().append(area);
                    $(this).remove();
                }
            }
        });

        if(typeof markitupInit === 'function' && typeof autosize === 'function') {
            markitupInit();
            autosize($("textarea[class*=\'markitupEditor-\']"));
        }

    }
    mblock_module.executeRegisteredCallbacks('reindex_end');
}

function mblock_replace_for(element, item, index) {
    if (item.attr('id') && (item.attr('id').indexOf("REX_MEDIA") >= 0 ||
        item.attr('id').indexOf("REX_LINK") >= 0 ||
        item.attr('id').indexOf("redactor") >= 0 ||
        item.attr('id').indexOf("markitup") >= 0
    )) { } else {
        if (item.attr('id')) {
            item.attr('id', item.attr('id').replace(/_\d_+/, '_' + index + '_'));

            var label;

            if (item.find('label').length) {
                label = item.find('label');
            }
            if (item.parent().find('label').length) {
                label = item.parent().find('label');
            }
            if (item.parent().parent().find('label').length) {
                label = item.parent().parent().find('label');
            }
            if (label.length) {
                label.attr('for', label.attr('for').replace(/_\d_+/, '_' + index + '_'));
            }
        }
    }
    mblock_replace_checkbox_for(element);
}

function mblock_replace_checkbox_for(element) {
    element.find('input:checkbox').each(function() {
        $(this).parent().find('label').attr('for', $(this).attr('id'));
    });
}

function mblock_add_item(element, item) {
    mblock_module.executeRegisteredCallbacks('add_item_start');
    if (item.parent().hasClass(element.attr('class'))) {
        // unset sortable
        element.mblock_sortable("destroy");
        // add element
        item.after(item.clone());

        if(element.data().hasOwnProperty('input_delete')) {
            if (element.data('input_delete') == true) {
                item.next().find('div.redactor-in').html('');
                item.next().find('input, textarea').val('');
                item.next().find('textarea').html('');
                item.next().find('option:selected').removeAttr("selected");
                item.next().find('input:checked').removeAttr("checked");
                item.next().find('select').each(function () {
                    if ($(this).attr('id') && ($(this).attr('id').indexOf("REX_MEDIALIST") >= 0
                        || $(this).attr('id').indexOf("REX_LINKLIST") >= 0
                    )) {
                        $(this).find('option').remove();
                    }
                });
            }
        }
        mblock_set_unique_id(item.next(), true);
        // set count
        mblock_set_count(element, item);
        // reinit
        mblock_init_sort(element);
        // scroll to item
        mblock_scroll(element, item.next());
        element.trigger('mblock:add', [element]);
    }
}

function mblock_set_unique_id(item, input_delete) {
    item.find('input').each(function() {
        var unique_id = Math.random().toString(16).slice(2),
            unique_int = parseInt(Math.random()*1000000000000);

        if ($(this).attr('data-unique-int') == 1) {
            unique_id = unique_int;
        }
        if ($(this).attr('data-unique') == 1 || $(this).attr('data-unique-int') == 1) {
            if (input_delete == true) {
                $(this).val('');
            }
            if ($(this).val() == '') {
                $(this).val(unique_id);
            }
        }
    });
}

function mblock_set_count(element, item) {
    var countItem = item.next().find('span.mb_count'),
        count = element.find('> div').length;

    if (element.data('latest')) {
        count = element.data('latest') + 1;
    }

    countItem.text(count);
    element.data('latest', count);
}

function mblock_remove_item(element, item) {
    if (item.parent().hasClass(element.attr('class'))) {
        // unset sortable
        element.mblock_sortable("destory");
        // set prev item
        var prevItem = item.prev();
        // is prev exist?
        if (!prevItem.hasClass('sortitem')) {
            prevItem = item.next(); // go to next
        }
        // remove element
        item.remove();
        // reinit
        mblock_init_sort(element);
        // scroll to item
        mblock_scroll(element, prevItem);
    }
}

function mblock_moveup(element, item) {
    var prev = item.prev();
    if (prev.length == 0) return;
    prev.css('z-index', 99).addClass('mblock_animate').css({ 'position': 'relative', 'top': item.outerHeight(true) });
    item.css('z-index', 100).addClass('mblock_animate').css({ 'position': 'relative', 'top': - prev.outerHeight(true) });

    setTimeout(function(){
        prev.removeClass('mblock_animate').css({ 'z-index': '', 'top': '', 'position': '' });
        item.removeClass('mblock_animate').css({ 'z-index': '', 'top': '', 'position': '' });
        item.insertBefore(prev);
        mblock_reindex(element);
    },150);
}

function mblock_movedown(element, item) {
    var next = item.next();
    if (next.length == 0) return;

    next.css('z-index', 99).addClass('mblock_animate').css({ 'position': 'relative', 'top': - item.outerHeight(true) });
    item.css('z-index', 100).addClass('mblock_animate').css({ 'position': 'relative', 'top': next.outerHeight(true) });

    setTimeout(function(){
        next.removeClass('mblock_animate').css({ 'z-index': '', 'top': '', 'position': '' });
        item.removeClass('mblock_animate').css({ 'z-index': '', 'top': '', 'position': '' });
        item.insertAfter(next);
        mblock_reindex(element);
    },150);
}

function mblock_scroll(element, item) {
    if(element.data().hasOwnProperty('smooth_scroll')) {
        if (element.data('smooth_scroll') == true) {
            $.mblockSmoothScroll({
                scrollTarget: item,
                speed: 500
            });
        }
    }
}

function mblock_add(element) {
    element.find('> div .addme').unbind().bind('click', function() {
        if (!$(this).prop('disabled')) {
            mblock_add_item(element, $(this).closest('div[class^="sortitem"]'));
        }
        return false;
    });
    element.find('> div .removeme').unbind().bind('click', function() {
        if (!$(this).prop('disabled')) {
            mblock_remove_item(element, $(this).closest('div[class^="sortitem"]'));
        }
        return false;
    });
    element.find('> div .moveup').unbind().bind('click', function() {
        if (!$(this).prop('disabled')) {
            mblock_moveup(element, $(this).closest('div[class^="sortitem"]'));
        }
        return false;
    });
    element.find('> div .movedown').unbind().bind('click', function() {
        if (!$(this).prop('disabled')) {
            mblock_movedown(element, $(this).closest('div[class^="sortitem"]'));
        }
        return false;
    });
}
