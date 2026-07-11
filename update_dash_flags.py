import json
import os

keys = {
    "faqs.autoTranslate": {"en": "✨ Auto Translate", "km": "✨ បកប្រែស្វ័យប្រវត្តិ"},
    "faqs.translating": {"en": "Translating...", "km": "កំពុងបកប្រែ..."},
    "faqs.translateSuccess": {"en": "Translated successfully!", "km": "បកប្រែជោគជ័យ!"},
    "faqs.translateFailed": {"en": "Translation failed. Please try again.", "km": "ការបកប្រែបរាជ័យ។ សូមព្យាយាមម្ដងទៀត។"},
    "faqs.nothingToTranslate": {"en": "Nothing to translate. Please fill out the other language first.", "km": "គ្មានអ្វីត្រូវបកប្រែទេ។ សូមបំពេញភាសាម្ខាងទៀតជាមុនសិន។"}
}

for lang in ["en", "km"]:
    file_path = f"locales/{lang}.json"
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        for k, v in keys.items():
            if k not in data:
                data[k] = v[lang]
                
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
print("Locales updated with translate keys!")
