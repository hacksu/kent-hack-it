# Converts a string into a GIF of semaphore flags using images from _flags/
import os
from PIL import Image

def string_to_semaphore_gif(text, flags_dir='_flags', output_path='_output.gif', duration=500):
	# Use a relative path for the flags directory and output GIF based on the location of this Python file
	base_dir = os.path.dirname(os.path.abspath(__file__))
	flags_dir = os.path.join(base_dir, flags_dir)
	output_path = os.path.join(base_dir, output_path)
	frames = []
	text = ''.join(c for c in input_text if c.isalpha()).lower()

	# Add starting frame with _letters.png
	letters_path = os.path.join(flags_dir, '_letters.png')
	if os.path.exists(letters_path):
		letters_img = Image.open(letters_path).convert('RGBA')
		bg = Image.new('RGBA', letters_img.size, (255, 255, 255, 255))
		bg.paste(letters_img, (0, 0), letters_img)
		frames.append(bg)
	else:
		print('Warning: _letters.png not found, starting frame skipped.')

	for char in text:
		img_path = os.path.join(flags_dir, f'{char}.png')
		if os.path.exists(img_path):
			flag_img = Image.open(img_path).convert('RGBA')
			bg = Image.new('RGBA', flag_img.size, (255, 255, 255, 255))
			bg.paste(flag_img, (0, 0), flag_img)
			frames.append(bg)
		else:
			print(f'Warning: No flag image for {char}, skipping frame.')
	if frames:
		frames[0].save(output_path, save_all=True, append_images=frames[1:], duration=duration, loop=0)
		print(f'GIF saved to {output_path}')
	else:
		print('No valid frames to create GIF.')

if __name__ == '__main__':
	# Example usage
	input_text = 'khi{unstoppable_telegraph_operator}'
	string_to_semaphore_gif(input_text, duration=300)
