import os
from PIL import Image
import re

image_dir = r"a:\alex\Petakus\image"
html_file = r"a:\alex\Petakus\index.html"

# 1. Convert images
for filename in os.listdir(image_dir):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        filepath = os.path.join(image_dir, filename)
        basename = os.path.splitext(filename)[0]
        webp_filename = basename + '.webp'
        webp_filepath = os.path.join(image_dir, webp_filename)
        
        try:
            with Image.open(filepath) as img:
                # Convert RGBA to RGB if saving as WebP (WebP supports RGBA, but just in case)
                # Actually WebP supports alpha, so we can just save it directly.
                img.save(webp_filepath, 'webp', quality=80)
            print(f"Converted {filename} to {webp_filename}")
            # Remove old file
            os.remove(filepath)
        except Exception as e:
            print(f"Failed to convert {filename}: {e}")

# 2. Update index.html
with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace image extensions in the HTML
# We need to be careful to only replace extensions for files in the image/ folder
# e.g., image/1.png -> image/1.webp
def replace_ext(match):
    return match.group(1) + '.webp'

# Regex to match image/something.png or .jpg or .jpeg
new_content = re.sub(r'(image/[^"\'\s>]+)\.(png|jpg|jpeg)', replace_ext, content, flags=re.IGNORECASE)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated index.html")
