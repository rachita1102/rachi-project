from flask import current_app as app
from backend.models import db
from flask_security import SQLAlchemyUserDatastore, hash_password

with app.app_context():
    db.create_all()

    userdatastore : SQLAlchemyUserDatastore = app.security.datastore

    userdatastore.find_or_create_role(name = 'admin', description = 'superuser')
    userdatastore.find_or_create_role(name = 'Service Professional', description = 'professional')
    userdatastore.find_or_create_role(name = 'Customer', description = 'customer')
    
    if (not userdatastore.find_user(email = 'admin@gmail.com')):
        userdatastore.create_user(
                    email='admin@gmail.com', 
                    password=hash_password('pass'), 
                    roles=['admin'],
                    fname='Admin',  # ✅ Add first name
                    lname='User'    # ✅ Add last name
                )

    if (not userdatastore.find_user(email = 'customer@gmail.com')):
        userdatastore.create_user(
            email='customer@gmail.com', 
            password=hash_password('pass'), 
            roles=['Customer'],
            fname='Test',  # ✅ Add first name
            lname='Customer'  # ✅ Add last name
        )


    db.session.commit()