var s_LANGUAGE_PROPERTY = 'conjugate.lang';
var s_VERB_PROPERTY = 'conjugate.verb';
var s_TRANSLATE_PROPERTY = 'conjugate.translate';
var s_DISCLAIMER_PROPERTY = 'disclaimerShown';

var cookie = {
    setValue: function(name, value, expiryDays) {
        expiryDays = expiryDays || 10;
        var date = new Date();
        date.setTime(date.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + "; " + expires;
    },

    getValue: function(name) {
        name = name + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    }
};

$(document).ready(function(){
    setupFromCookie();

    $('select').material_select();

    $('body').keydown(function(event) {
        if(event.keyCode === 13) {
            $('#btnConjugate').click();
        }
    });

    $('#btnConjugate').click(function(){
        var params = {
            lang: $('#lang').first().val(),
            verb: $('#verb').first().val(),
            translate: $('#translate').is(':checked')
        };

        saveToCookie(params);

        if (params.verb.length === 0) {
            onNoInput();
            return;
        }

        setLoading();

        $.post('conjugate', params).done(onConjugationSucceeded)
                                   .fail(onConjugationFailed);
    });

    $('#lang').change(checkEnglishLanguageSelected);

    function checkEnglishLanguageSelected() {
        var lang = $('#lang').first().val();

        if (lang === 'en') {
            $('#translate').attr('checked', false);
            $('#translate').attr('disabled', true);
        }
        else {
            $('#translate').attr('disabled', false);
        }
    }

    function setupFromCookie() {
        var lang = cookie.getValue(s_LANGUAGE_PROPERTY);
        var verb = cookie.getValue(s_VERB_PROPERTY);
        var translate = cookie.getValue(s_TRANSLATE_PROPERTY);
        var disclaimerAccepted = cookie.getValue(s_DISCLAIMER_PROPERTY);

        if (lang) {
            $('#lang').val(lang);
        }

        if (verb) {
            $('#verb').val(verb);
        }

        if (translate === 'true') {
            $('#translate').prop('checked', true);
        }

        checkEnglishLanguageSelected();

        if (disclaimerAccepted !== 'true') {
            showCookieDisclaimer();
        }
    }

    function saveToCookie(params) {
        cookie.setValue(s_LANGUAGE_PROPERTY, params.lang);
        cookie.setValue(s_VERB_PROPERTY, params.verb);
        cookie.setValue(s_TRANSLATE_PROPERTY, params.translate);
    }

    function showCookieDisclaimer() {
        $('#cookies-modal').openModal({
            dismissible: false,
            complete: function () {
                cookie.setValue(s_DISCLAIMER_PROPERTY, true)
            }
        });
    }

    function onConjugationSucceeded(response) {
        if (!response.verbs ||
            !Array.isArray(response.verbs) ||
            response.verbs.length === 0 ||
            !Array.isArray(response.verbs[0].conjugations) ||
            response.verbs[0].conjugations.length === 0) {
            onConjugationFailed();
        }
        else {
            processVerbs(response.verbs, response.fromEnglish);
        }
    }

    function processVerbs(verbs, fromEnglish) {
        if (fromEnglish) {
            var conjugationsBlock = $('<div></div>');
            var col = $('<div class="col s12 m12 l12"></div>');
            var tabSize = Math.min(12 / verbs.length, 3);
            var tabClass = '"tab col s' + tabSize + ' m' + tabSize + ' l' + tabSize + '"';
            var tabs = $('<ul class="tabs"></ul>');

            console.log(verbs);

            verbs = verbs.filter(function(verb) {
                return Array.isArray(verb.conjugations) &&
                       verb.conjugations.length > 0;
            });

            verbs.forEach(function(verb, index) {
                var href = '"#verb' + index + '"';
                var link =  $('<a href=' + href + '></a>');

                link.append(verb.verb);

                tabs.append(
                    $('<li class=' + tabClass + '></li>').append(
                        link
                    )
                );

                link.click(function() {
                   enableCollapsible();
                });
            });

            col.append(tabs);
            conjugationsBlock.append(col);

            verbs.forEach(function(verb, index) {
                var id = '"verb' + index + '"';
                conjugationsBlock.append(
                    $('<div class="col s12 m12 l12" id=' + id + '></div>').append(
                        processVerb(verb)
                    )
                );
            });

            updateConjugationsContainer(conjugationsBlock);

        }
        else {
            var conjugationsList = processVerb(verbs[0]);
            updateConjugationsContainer(conjugationsList);
        }
    }

    function processVerb(verb) {
        var translationsList = $('<div></div>');
        verb.translations.forEach(function(translation) {
            translationsList.append(
                $('<p></p>').append(
                    translation.english + ': ' + translation.description
                )
            );
        });

        var conjugationList = $('<ul class="collapsible" data-collapsible="accordion"></ul>');
        verb.conjugations.forEach(function(mode) {
            conjugationList.append(createModeBlock(mode));
        });

        return $('<div></div>').append(
            $('<div class="row"></div>').append(
                translationsList
            ),
            $('<div class="row"></div>').append(
                conjugationList
            )
        );
    }

    function createModeBlock(mode) {
        var li = $('<li></li>');
        var header = $('<div class="collapsible-header"><i class="mode-expander mdi-navigation-expand-more"></i></div>')
        var body = $('<div class="collapsible-body"></div>');

        header.append(mode.name);

        header.click(function () {
            $('.mode-expander').each(function(index, expander){
                expander = $(expander);

                var currentName = expander.parent().text();
                var moreClass = 'mdi-navigation-expand-more';
                var lessClass = 'mdi-navigation-expand-less';

                if (currentName !== mode.name || expander.hasClass(lessClass)) {
                    expander.removeClass(lessClass);
                    expander.addClass(moreClass);
                }
                else {
                    expander.removeClass(moreClass);
                    expander.addClass(lessClass);
                }
            });
        });

        li.append(header);
        li.append(body);

        mode.tenses.forEach(function(tense) {
            body.append(createTenseBlock(tense));
        });

        return li;
    }

    function createTenseBlock(tense) {
        var table = $('<table class="hoverable"></table>').append(
            $('<thead></thead>'),
            $('<tbody></tbody>')
        );

        var names = tense.conjugations.every(function(conjugation) {
           return Boolean(conjugation.name);
        });

        if (Boolean(tense.name)) {
            $('thead', table).append(
                $('<tr></tr>').append(
                    $('<th data-field="tense-name"></th>').append(tense.name),
                    $('<th data-field="empty"></th>')
                )
            );
        }

        $('tbody', table).append(tense.conjugations.map(function(conjugation) {
            var tr = $('<tr></tr>');

            if (names) {
                tr.append($('<td></td>').append(conjugation.name));
            }

            var span = $('<span></span>');

            if (conjugation.irregular === true) {
                span.addClass('red-text darken-3');
            }

            tr.append($('<td></td>').append(
                span.append(conjugation.options.join(', ')))
            );

            return tr;
        }));

        return $('<p></p>').append(table);
    }

    function onNoInput() {
        setErrorMessage("Please enter a verb before looking for conjugations.");
    }

    function onConjugationFailed() {
        var errorMsg = "Sorry, we couldn't find any conjugations for that" +
            " verb. Make sure to use the infinitive.";

        setErrorMessage(errorMsg);
    }

    function setErrorMessage(message) {
        var errorBlock = $('<div class="col"></div>').append(
            $('<div class="card-panel red darken-4"></div>').append(
                $('<div class="row"></div>').append(
                    $('<div class="col l2"></div>').append(
                        $('<i class="medium mdi-alert-error"></i>')
                    ),
                    $('<div class="col l10"></div>').append(
                        $('<div class="valign-wrapper"></div>').append(
                            $('<p class="valign"></p>').append(
                                $('<span class="white-text"></span>').append(message)
                            )
                        )
                    )
                )
            )
        );

        updateConjugationsContainer(errorBlock);
    }

    function setLoading() {
        var loadingBlock = $('<div class="col l8 m7 s12"></div>').append(
            $('<div class="row"></div>').append(
                $('<div class="progress"></div>').append(
                    $('<div class="indeterminate"></div>')
                )
            )
        );

        updateConjugationsContainer(loadingBlock);
    }

    function updateConjugationsContainer(element) {
        var conjugationsContainer = $('#conjugations');
        conjugationsContainer.empty();
        element.css('display', 'none');
        element.appendTo(conjugationsContainer).fadeIn('slow');

        enableCollapsible();

        $('ul.tabs').tabs();
    }

    function enableCollapsible() {
        $('.collapsible').collapsible({
            accordion: false
        });
    }
});