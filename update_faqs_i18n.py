import json
import os

keys = {
    "faqs.editTitle": {"en": "Edit FAQ", "km": "កែប្រែសំណួរ និងចម្លើយ (FAQ)"},
    "faqs.addDesc": {"en": "Fill in the details to add a new frequently asked question.", "km": "បំពេញព័ត៌មានលម្អិតដើម្បីបន្ថែមសំណួរ និងចម្លើយថ្មី។"},
    "faqs.editDesc": {"en": "Update the question, answer, or settings below.", "km": "ធ្វើបច្ចុប្បន្នភាពសំណួរ ចម្លើយ ឬការកំណត់ខាងក្រោម។"},
    "faqs.questionLabel": {"en": "Question", "km": "សំណួរ"},
    "faqs.questionPlaceholder": {"en": "e.g. What are the early signs of pregnancy?", "km": "ឧទាហរណ៍៖ តើមានរោគសញ្ញាអ្វីខ្លះនៅពេលមានផ្ទៃពោះដំបូង?"},
    "faqs.answerLabel": {"en": "Answer", "km": "ចម្លើយ"},
    "faqs.answerPlaceholder": {"en": "Provide a clear and concise answer...", "km": "ផ្តល់ចម្លើយដែលច្បាស់លាស់ និងខ្លី... "},
    "faqs.publishFaq": {"en": "Publish FAQ", "km": "ផ្សព្វផ្សាយ FAQ"},
    "faqs.visibleDesc": {"en": "This FAQ is visible to users", "km": "FAQ នេះនឹងបង្ហាញដល់អ្នកប្រើប្រាស់"},
    "faqs.draftDesc": {"en": "This FAQ is saved as a draft", "km": "FAQ នេះត្រូវបានរក្សាទុកជាសេចក្ដីព្រាង"},
    "faqs.cancel": {"en": "Cancel", "km": "បោះបង់"},
    "faqs.saveChanges": {"en": "Save Changes", "km": "រក្សាទុកការកែប្រែ"},
    "faqs.fillBoth": {"en": "Please fill out at least one language for Question and Answer.", "km": "សូមបំពេញយ៉ាងហោចណាស់មួយភាសាសម្រាប់សំណួរ និងចម្លើយ។"},
    "faqs.saving": {"en": "Saving modifications...", "km": "កំពុងរក្សាទុកការកែប្រែ..."},
    "faqs.adding": {"en": "Adding FAQ...", "km": "កំពុងបន្ថែម FAQ..."},
    "faqs.updatedSuccess": {"en": "FAQ updated successfully!", "km": "FAQ ត្រូវបានកែប្រែដោយជោគជ័យ!"},
    "faqs.createdSuccess": {"en": "FAQ created successfully!", "km": "FAQ ត្រូវបានបង្កើតដោយជោគជ័យ!"}
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
            
print("Locales updated successfully!")
