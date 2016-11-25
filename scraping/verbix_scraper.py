# -*- coding: utf-8 -*-

import urllib2, cookielib
import urllib
import httplib
import socket
import time
import logging
import verbix_parser

class VerbixScraper:

    __languages = {
        'ro': 5,
        'es': 1,
        'pt': 2,
        'fr': 3,
        'ca': 7,
        'de': 13,
        'en': 20
    }

    __retries = 5

    def get_infinitive(self, language, verb):
        base_url = 'http://www.verbix.com/find-verb/'
        params = {
            'verb': verb,
            'Submit': 'Find'
        }

        response = self.__request(self.__post, base_url, params)

        print "AAA"

        if response is None:
            return

        content = self.__get_response_content(response)

        print "BBB"
        parser = verbix_parser.VerbixParser()
        return parser.get_infinitive(VerbixScraper.__languages[language], content)

    def get_verb_info(self, language, verb):
        base_url = 'http://www.verbix.com/webverbix/go.php'
        params = {
            'T1': verb,
            'D1': VerbixScraper.__languages[language]
        }

        response = self.__request(self.__get, base_url, params)

        if response is None:
            return

        content = self.__get_response_content(response)

        parser = verbix_parser.VerbixParser()
        return parser.parse(content)

    def __get_response_content(self, response):
        try:
            return response.read()
        except httplib.IncompleteRead as e:
            return e.partial

    def __request(self, make_request, url, params):
        num_attempts = 0

        while num_attempts < VerbixScraper.__retries:
            try:
                (success, response) = self.__try_request(make_request, url, params)
                if success:
                    return response
                else:
                    logging.warning('Request %d/%d failed' % (num_attempts + 1, VerbixScraper.__retries))
                    num_attempts += 1
                    time.sleep(2)

            except UnicodeEncodeError:
                logging.error('Could not encode parameters')
                return None

        logging.error('Too many attempts, giving up')

    def __try_request(self, make_request, url, params):
        try:
            retrn = make_request(url, params)
            return retrn
        except Exception, e:
            print "System error %s " % e
            return (False, None)

    def __get(self, url, params):
        try:
            hdr = {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
                'Accept-Encoding': 'none',
                'Accept-Language': 'en-US,en;q=0.8',
                'Connection': 'keep-alive'}
            final_url = '%s?%s' % (url, urllib.urlencode(params))
            logging.info('get: %s' % final_url)
            req = urllib2.Request(final_url, headers=hdr)
            response = urllib2.urlopen(req)
            return (True, response)
        except Exception, e:
            print ("System error %s " % e)

    def __post(self, url, params):
        try:
            hdr = {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
                'Accept-Encoding': 'none',
                'Accept-Language': 'en-US,en;q=0.8',
                'Connection': 'keep-alive'}
            logging.info('post: %s' % url)
            request = urllib2.Request(url, urllib.urlencode(params), headers=hdr)
            response = urllib2.urlopen(request)
            return (True, response)
        except Exception, e:
            print ("System error %s " % e)