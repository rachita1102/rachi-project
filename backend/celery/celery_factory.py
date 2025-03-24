from celery import Celery, Task
from flask import Flask

class CeleryConfig():
    broker_url = 'redis:///localhost:6379/0'
    results_backend = 'redis://localhost:6379/1'
    timezone = 'Asia/Kolkata'
    
def celery_init_app(app: Flask) -> Celery:
    class FlaskTask(Task):
        def _call_(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(app.config["CELERY"])
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app