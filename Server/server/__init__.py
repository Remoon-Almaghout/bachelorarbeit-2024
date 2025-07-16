from flask import Flask

from flask_cors import CORS

# import routes
from main.routes.auth_routes import auth_bp
from main.routes.topic_routes import topic_bp
from main.routes.course_routes import course_bp
from main.routes.profile_routes import profile_bp
from main.routes.recommendation_routes import recommendation_bp
from main.routes.educational_package_routes import educational_package_bp
from main.routes.oer_routes import oer_bp
from main.routes.relation_routes import relation_bp
from main.routes.session_routes import session_bp
from main.routes.message_routes import message_bp
from main.routes.file_routes import file_bp
from main.routes.invite_routes import invite_bp
from main.routes.admin_routes import admin_bp
from main.routes.journey_routes import journey_bp
from main.routes.user_routes import user_bp

from main.routes import chat_routes


# create flask app
app = Flask(__name__)
socketio = chat_routes.socketio
socketio.init_app(app)




# allow cors
CORS(app, supports_credentials=True)

# register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(topic_bp)
app.register_blueprint(course_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(recommendation_bp)
app.register_blueprint(educational_package_bp)
app.register_blueprint(oer_bp)
app.register_blueprint(relation_bp)
app.register_blueprint(session_bp)
app.register_blueprint(message_bp)
app.register_blueprint(file_bp)
app.register_blueprint(invite_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(journey_bp)
app.register_blueprint(user_bp)

# run app
socketio.run(app,host='localhost', port=5000, debug=True)
