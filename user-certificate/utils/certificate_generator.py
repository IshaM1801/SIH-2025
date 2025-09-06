from PIL import Image, ImageDraw, ImageFont

import os

def generate_certificate(user_name, issue_title, resolution_date, location):
    # Load pre-designed template
    template = Image.open("templates/certificate_template.png")
    draw = ImageDraw.Draw(template)
    
    def draw_text_bold(position, text, font, fill):
      x, y = position
      # Draw text with 1 pixel offset in a few directions
      draw.text((x-1, y), text, font=font, fill=fill)
      draw.text((x+1, y), text, font=font, fill=fill)
      draw.text((x, y-1), text, font=font, fill=fill)
      draw.text((x, y+1), text, font=font, fill=fill)
      
      draw.text((x, y), text, font=font, fill=fill)
    
    # Load font
    font_other = ImageFont.truetype("fonts/ARIAL.TTF", 40)
    font_name = ImageFont.truetype("fonts/Alice-Regular.ttf", 40)
    # font_other = ImageFont.truetype("fonts/arial.ttf", 24)
    
    # Overlay dynamic text
    draw_text_bold((937, 756), user_name, font=font_name, fill="black")
    draw.text((550, 1149), f"{issue_title}", font=font_other, fill="black")
    # draw.text((400, 1100), f"Description: {issue_description}", font=font_other, fill="black")
    draw.text((695, 1291), f"{location}", font=font_other, fill="black")
    draw.text((695, 1356), f"{resolution_date}", font=font_other, fill="black")
    
    # Save certificate
    if not os.path.exists("certificates"):
        os.makedirs("certificates")
    final_path = f"certificates/{user_name}_{issue_title[:10]}.png"
    template.save(final_path)
    return final_path