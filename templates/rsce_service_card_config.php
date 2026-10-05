<?php

return [
    'label' => [
        'de' => ['Leistungskarte', 'Karte mit Titel, Kurztext und Link im ERTNER&SO-Design.'],
        'en' => ['Service card', 'Card with title, description and link in the ERTNER&SO design.'],
    ],
    'types' => ['content'],
    'contentCategory' => 'texts',
    'beTemplate' => 'be_wildcard',
    'wrapper' => ['type' => 'none'],
    'fields' => [
        'eyebrow' => [
            'label' => ['de' => ['Kennzeichnung', 'Zum Beispiel: 01 / ERKLÄRFILM'], 'en' => ['Eyebrow', 'For example: 01 / EXPLAINER FILM']],
            'inputType' => 'text',
            'eval' => ['mandatory' => true, 'maxlength' => 80],
        ],
        'cardTitle' => [
            'label' => ['de' => ['Titel', ''], 'en' => ['Title', '']],
            'inputType' => 'text',
            'eval' => ['mandatory' => true, 'maxlength' => 120],
        ],
        'description' => [
            'label' => ['de' => ['Kurztext', ''], 'en' => ['Description', '']],
            'inputType' => 'textarea',
            'eval' => ['mandatory' => true, 'rows' => 3],
        ],
        'detail' => [
            'label' => ['de' => ['Fußzeile', 'Zum Beispiel: AUS CAD-DATEN'], 'en' => ['Footer label', 'For example: FROM CAD DATA']],
            'inputType' => 'text',
            'eval' => ['mandatory' => true, 'maxlength' => 80],
        ],
        'link' => [
            'label' => ['de' => ['Ziel-Link', 'Interne Seite oder URL'], 'en' => ['Target link', 'Internal page or URL']],
            'inputType' => 'url',
            'eval' => ['mandatory' => true],
        ],
        'linkLabel' => [
            'label' => ['de' => ['Link-Beschriftung', 'Für Screenreader, zum Beispiel: Erklärfilme ansehen'], 'en' => ['Link label', 'For screen readers, for example: View explainer films']],
            'inputType' => 'text',
            'eval' => ['mandatory' => true, 'maxlength' => 120],
        ],
    ],
];
