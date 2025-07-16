import bcrypt
import jwt
import datetime
from ..config import Config


class User:

    def __init__(self, email, password, id = None, password_hash = None):
        self.id = id
        self.email = email
        self.password = password
        self.password_hash = password_hash

    def set_id(self, id):
        self.id = id

    def hash_password(self):
        self.password_hash = bcrypt.hashpw(self.password.encode('utf-8'), bcrypt.gensalt())

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash)

    def encode_auth_token(self):
        try:
            payload = {
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7, seconds=5),
                'iat': datetime.datetime.utcnow(),
                'sub': self.id
            }
            return jwt.encode(
                payload,
                Config.SECRET_KEY,
                algorithm='HS256'
            )
        except Exception as e:
            return e
    
    @staticmethod  
    def decode_auth_token(auth_token):
        try:
            payload = jwt.decode(auth_token, Config.SECRET_KEY, algorithms=["HS256"])
            return payload['sub']
        except jwt.ExpiredSignatureError:
            raise jwt.ExpiredSignatureError('Token has expired. Please log in again.')
        except jwt.InvalidTokenError:
            raise jwt.InvalidTokenError('Invalid token. Please log in again.')