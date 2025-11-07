import os
from django.conf import settings

class ProfanityFilter:
    def __init__(self, bad_words_file=None):
        if bad_words_file is None:
            bad_words_file = os.path.join(settings.BASE_DIR, 'bad_words.txt')
        
        self.bad_words = self._load_bad_words(bad_words_file)
    
    def _load_bad_words(self, file_path):
        """Загружает список нецензурных слов из файла"""
        bad_words = set()
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                for line in file:
                    word = line.strip().lower()
                    if word and not word.startswith('#'):
                        bad_words.add(word)
        except FileNotFoundError:
            print(f"Файл {file_path} не найден. Создайте файл с нецензурными словами.")
        return bad_words
    
    def contains_profanity(self, text):
        """Проверяет текст на наличие нецензурных слов"""
        if not text or not self.bad_words:
            return False
        
        text_lower = text.lower()
        
        for bad_word in self.bad_words:
            if bad_word in text_lower:
                return True
        
        return False
    
    def check_multiple_fields(self, **fields):
        """Проверяет несколько полей на наличие нецензурных слов"""
        for field_name, field_value in fields.items():
            if field_value and self.contains_profanity(str(field_value)):
                return field_name
        return None

profanity_filter = ProfanityFilter()