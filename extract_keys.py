import os, re, json

keys = set()
pattern = re.compile(r't\("([^"]+)"\)')

for root, dirs, files in os.walk('components'):
    for file in files:
        if file.endswith('.tsx'):
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                content = f.read()
                matches = pattern.findall(content)
                for m in matches:
                    keys.add(m)

print(json.dumps(sorted(list(keys)), indent=2))
