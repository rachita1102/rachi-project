from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin

db = SQLAlchemy()


class User(db.Model, UserMixin):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    fs_uniquifier = db.Column(db.String, unique=True, nullable=False)  # Flask-Security specific
    active = db.Column(db.Integer, default=True)
    roles = db.relationship("Role", backref="bearers", secondary="user_roles")
    location = db.Column(db.String(100))
    fname = db.Column(db.String(50), nullable= True)
    lname = db.Column(db.String(50), nullable=True)


class Role(db.Model, RoleMixin):
    __tablename__ = "roles"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=False)


class UserRoles(db.Model):
    __tablename__ = "user_roles"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"))


class ServiceProfessional(db.Model):
    __tablename__ = "service_professionals"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    experience = db.Column(db.Integer)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    avg_rating = db.Column(db.Float, default=0.0)
    review_count = db.Column(db.Integer, default=0)
    past_client_count = db.Column(db.Integer, default=0)
    pan_number = db.Column(db.String(10), nullable=True)


# class Customer(db.Model):
#     __tablename__ = "customers"
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
#     fname = db.Column(db.String(50), nullable=False)
#     lname = db.Column(db.String(50), nullable=False)
#     location = db.Column(db.String, nullable=False)


class Service(db.Model):
    __tablename__ = "services"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    min_time_required = db.Column(db.Integer)
    base_payment = db.Column(db.Integer, nullable=False)
    


class ServiceRequest(db.Model):
    __tablename__ = "service_requests"
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    date_of_request = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    date_of_statuschange = db.Column(db.DateTime, nullable=True)
    date_of_service = db.Column(db.DateTime, nullable=True)
    service_status = db.Column(
        db.String(20), default="requested"
    )  # requested, assigned, closed
    rating = db.Column(db.Integer, nullable=True)  # Customer rating for service
    remarks = db.Column(db.Text, nullable=True)
