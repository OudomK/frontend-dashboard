import json
import sys

def get_keys(d, prefix=''):
    keys = []
    for k, v in d.items():
        full_key = prefix + k
        keys.append(full_key)
        if isinstance(v, dict):
            keys.extend(get_keys(v, full_key + '.'))
    return keys

en = json.load(open('locales/en.json', encoding='utf-8'))
km = json.load(open('locales/km.json', encoding='utf-8'))

en_keys = set(get_keys(en))
km_keys = set(get_keys(km))

print("Missing in km:", en_keys - km_keys)
print("Missing in en:", km_keys - en_keys)
