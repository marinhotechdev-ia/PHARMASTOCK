from PIL import Image, ImageDraw

def make_circle_icon(img_path, output_path):
    # Open image and convert to RGBA
    img = Image.open(img_path).convert("RGBA")
    
    # Crop to a square if not already
    width, height = img.size
    min_dim = min(width, height)
    left = (width - min_dim) / 2
    top = (height - min_dim) / 2
    right = (width + min_dim) / 2
    bottom = (height + min_dim) / 2
    img = img.crop((left, top, right, bottom))
    
    # Create a circular mask
    mask = Image.new('L', img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0) + img.size, fill=255)
    
    # Create an empty image and paste using the mask
    output = Image.new('RGBA', img.size, (0, 0, 0, 0))
    output.paste(img, (0, 0), mask=mask)
    
    # Resize for favicon
    output = output.resize((128, 128), Image.Resampling.LANCZOS)
    output.save(output_path)

make_circle_icon('assets/logo.png', 'assets/favicon.png')
print("Favicon circular criado com sucesso!")
