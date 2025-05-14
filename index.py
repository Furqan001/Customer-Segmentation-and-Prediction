import os

with open('output.txt', 'w') as f:
f.write('Initial content\n')

with open('input.txt', 'r') as f:
    content = f.read()

print('File Content:', content)

os.remove('input.txt')

with open('output.txt', 'a') as f:
f.write('Appended content\n')

with open('output.txt', 'r') as f:
    for line in f:
        print(line.strip())
