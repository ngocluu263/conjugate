# -*- coding: utf-8 -*-

import logging
from bs4 import BeautifulSoup

class VerbixParser:
    def parse(self, document):
        try:
            translation = self.__get_translation(document)
            translation['modes'] = self.__get_modes(document)

            return translation
        except Exception as e:
            logging.error('Error parsing document:\n{0}'.format(e.message))

    def get_infinitive(self, language, document):
        soup = BeautifulSoup(document, 'html5')

        for a_element in soup.select('li > a'):
            if a_element['href'].find('D1=%s&'%language) != -1:
                return unicode(a_element.string).encode('utf-8')

    def __get_translation(self, document):
        soup = BeautifulSoup(document, 'html5')

        return {
            'name': soup.h1.string.replace('\n', '').split(':')[1].replace(' ', ''),
            'meanings': self.__get_english(soup),
        }

    def __get_english(self, soup):
        meanings = []
        meaning_blocks = soup.find_all('div', {'class': 'pure-u-1-2'})[:-1]

        print meaning_blocks

        for meaning_block in meaning_blocks:
            print meaning_block.h3.string
            description = meaning_block.h3.string
            #description = meaning_block.h3.string.lower()
            #link = meaning_block.a.string
            link = meaning_block.p.span.string
            print meaning_block.p.span.string
            meanings.append({
                'eng': link.string,
                'description': description
            })

        return meanings

    def __get_modes(self, document):
        document = self.__cleanse_document(document)
        soup = BeautifulSoup(document, 'html5')
        modes = soup.find_all('div', {'class': 'column'})
        return [self.__get_mode(mode) for mode in modes if mode is not None]

    def __cleanse_document(self, document):
        tags = [
            {
                'start': '<!-- #BeginEditable "Full_width_text" -->',
                'end': '<!-- #EndEditable -->'
            },
            {
                'start': '<!-- InstanceBeginEditable name="Full_width_text" -->',
                'end': '<!-- InstanceEndEditable -->'
            }
        ]

        for tag_pair in tags:
            start_idx = document.rfind(tag_pair['start'])
            end_idx = document.find(tag_pair['end'])

            if start_idx == -1 or end_idx == -1:
                continue

            document = document[start_idx:end_idx].replace('<br>', '').replace('\n', '')
            return '<html><body><div>' + document + '</div></body></html>'

        return document

    def __get_mode(self, mode_element):
        try:
            return {
                'name': self.__get_mode_name(mode_element),
                'tenses': self.__get_tenses(mode_element)
            }
        except Exception as e:
            logging.error('Error processing mode: {0}'.format(e.message))

    def __get_mode_name(self, mode_element):
        return self.__process_str(mode_element.h3.get_text())

    def __get_tenses(self, mode_element):
        tenses = []
        current_tense = None
        current_conjugation = None

        for block in mode_element.select('td > p'):
            try:
                for element in block.children:
                    if element.name is None:
                        continue

                    if element.name == 'b':
                        tense_name = self.__process_str(element.text)
                        current_tense = self.__create_tense(tense_name)
                        tenses.append(current_tense)
                    elif element.name == 'font' and element.span and element.span.string:
                        pronoun = self.__process_str(element.span.string)

                        if current_tense is None:
                            current_tense = self.__create_tense('')
                            tenses.append(current_tense)

                        conjugation = self.__create_conjugation(pronoun)
                        current_tense['conjugations'].append(conjugation)
                        current_conjugation = conjugation
                    elif element.name == 'span':
                        option = self.__process_str(element.string)
                        irregular = 'irregular' in element.attrs['class']

                        if len(option) < 1:
                            continue

                        if current_tense is None:
                            current_tense = self.__create_tense('')
                            tenses.append(current_tense)

                        if len(current_tense['conjugations']) == 0:
                            conjugation = self.__create_conjugation('')
                            current_tense['conjugations'].append(conjugation)
                            current_conjugation = conjugation

                        current_conjugation['options'].append(option)

                        if 'irregular' in current_conjugation:
                            current_conjugation['irregular'] = current_conjugation['irregular'] or irregular
                        else:
                            current_conjugation['irregular'] = irregular

            except Exception as e:
                logging.error('Error processing block: {0}'.format(e.message))

        return [tense for tense in tenses if len(tense['conjugations']) > 0]

    def __create_tense(self, name):
        return {
            'name': name,
            'conjugations': []
        }

    def __create_conjugation(self, name):
        return {'name': name, 'options': []}

    def __process_str(self, str):
        return str.replace('\n', ' ').replace(':', '').lstrip().rstrip()