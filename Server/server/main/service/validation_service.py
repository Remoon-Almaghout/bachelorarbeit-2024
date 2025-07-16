import re

class ValidationService:
    @staticmethod
    def validate_password(password):
        return re.fullmatch(r'[A-Za-z0-9@#$%^&+=]{8,}', password)

    @staticmethod
    def validate_email(email):
        return re.fullmatch(r'[^@]+@[^@]+\.[^@]+', email)

