// List available themes here!
var themes = {
    // Display name : actual filename (without .css)
    "Swag 1.0": "swag1.0",
    "Better YTM: Cleaner, smaller, more intuitive": "BetterYTM"
};

$(document).ready(function () {
    // Load the themes into select, and initalize all selects
    $.each(themes, function (name, value) {
        $("select[name='theme']").append(`<option value="${value}">${name}</ooption>`);
    });
    $('select').formSelect();

    // Load settings from storage
    $(".inputs").each(function() {
        var elem = $(this);
        var name = $(this).attr('name');

        var data = {};
        data[name] = '';
        chrome.storage.sync.get(data, function(items) {
            var value = items[name];
            elem.val(value);
            if (elem.prop("tagName") == "SELECT") {
                elem.formSelect();
            } else {
                M.updateTextFields(); // Reinit text fields cause labels overlap if values prefilled.
            }
        });
    });

    // Autosave each setting
    $(".inputs").change(function () {
        var name = $(this).attr('name');
        var value = $(this).val();

        var data = {};
        data[name] = value;
        chrome.storage.sync.set(data);
    });
});
