from flask import Flask
# from flask_login import login_required
from backend.config import LocalDevelopmentConfig
from backend.models import db, User, Role
from flask_security import Security, SQLAlchemyUserDatastore, auth_required
from flask_caching import Cache
from backend.celery.celery_factory import celery_init_app
import flask_excel as excel


def createApp():
    print("Creating Flask app...") 
    app = Flask(__name__, template_folder='frontend', static_folder='frontend', static_url_path='/')

    app.config.from_object(LocalDevelopmentConfig)
    print("Configuration loaded.") 

    
    # model init
    db.init_app(app)
    print("Database initialized.")
    
    # cache init
    cache = Cache(app)
    app.cache = cache


    #flask security
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    # app.cache = cache

    app.security = Security(app, datastore= datastore, register_blueprint=False)
    app.app_context().push()

    print("Flask-Security initialized.")

    # from backend.resources import api
    # flask-restful init
    # api.init_app(app)

    return app
print("Starting app creation...")
app = createApp()

celery_app = celery_init_app(app)

import backend.create_initial_data

import backend.routes

# import backend.celery.celery_schedule

excel.init_excel(app)
# @app.get('/')
# def home():
#     return '<h1> home page </h1>'

# @app.get('/protected')
# @auth_required()

# def protected():
#     return '<h1> only accessible by auth user</h1>'


if __name__ == '__main__':
    print("Running Flask app...")  # Add this line
    app.run()
   