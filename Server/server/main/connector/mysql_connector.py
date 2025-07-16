from sqlalchemy import create_engine
from ..config import Config

class MySQLConnector:
    def __init__(self):
        url = 'mysql://' + Config.MYSQL_USER + ':' + Config.MYSQL_PASSWORD + '@' + Config.MYSQL_HOST + '/' + Config.MYSQL_DB
        self.engine = create_engine(url, echo=True)
        self._conn = self.engine.connect()

    @property
    def connection(self):
        return self._conn

    def execute(self, sql, params=None):
        return self.connection.execute(sql, params or ())

    def query(self, sql, params=None):
        cursor = self.connection.execute(sql, params or ())
        result = [dict(row) for row in cursor]
        return result


    
        



