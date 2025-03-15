import os
from PIL import Image
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration
import spacy

nlp = spacy.load("en_core_web_sm")

def load_model():
    processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
    return processor, model

def clean_caption(caption):
    words = caption.split()
    if len(words) > 3 and len(set(words)) < len(words) / 2:
        return " ".join(sorted(set(words), key=words.index))
    if len(words) > 1 and len(words[-1]) < 3 and not words[-1].isalnum():
        return " ".join(words[:-1])
    return caption

def extract_score(caption):
    doc = nlp(caption)
    food = []
    for token in doc:
        if token.pos_ == "NOUN" and token.text.lower() not in {"woman", "man", "person", "bowl", "plate", "hand"}:
            food.append(token.text.lower())
    score = get_nutrition_score(food)
    return score, food

def describe_food_image(image, processor, model):
    try:
        # print(f"Processor type: {type(processor)}")
        # print(f"Model type: {type(model)}")
        # print(f"Image type: {type(image)}")
        if image.mode != "RGB":
            image = image.convert("RGB")  # Ensure RGB mode
        inputs = processor(images=image, return_tensors="pt")
        with torch.no_grad():
            output_ids = model.generate(
                **inputs,
                max_length=100,
                num_beams=7,
                no_repeat_ngram_size=2,
                early_stopping=True
            )
            caption = processor.decode(output_ids[0], skip_special_tokens=True)
        caption2 = clean_caption(caption)
        print(f"Caption: {caption2}")
        return caption2
    except Exception as e:
        return f"Error processing image: {str(e)}"

def get_nutrition_score(food):
    # Search up the food in the database, return score. 
    # in future, will return multiple food items. need to use vector database to calculate overall score
    return 9.9

def populate_database():
    # Insert food items into the database, need to use aus open food database to calculate nutrition score
    # No clue how to do that
    pass

def main():
    print("Loading BLIP model (this may take a moment)...")
    processor, model = load_model()
    
    image_dir = "../images/image_downloads"
    if not os.path.exists(image_dir):
        print(f"Directory '{image_dir}' does not exist.")
        return
    
    image_files = [f for f in os.listdir(image_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    if not image_files:
        print(f"No image files found in '{image_dir}'.")
        return
    
    print(f"\nFound {len(image_files)} images in '{image_dir}'.")
    for image_file in image_files:
        image_path = os.path.join(image_dir, image_file)
        
        description = describe_food_image(image_path, processor, model)
        print(f"{image_path}: {description}")

if __name__ == "__main__":
    main()