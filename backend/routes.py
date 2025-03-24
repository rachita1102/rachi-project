from flask import current_app as app, request, jsonify, render_template,Blueprint
from flask_security import auth_required, verify_password, hash_password, current_user
from backend.models import db, User, Service, ServiceProfessional, ServiceRequest
from datetime import datetime

cache = app.cache
@app.route('/')
def home():
    return render_template('index.html')

@app.get("/protected")
@auth_required()
def protected():
    return "<h1>Only accessible by authenticated users</h1>"

@app.get('/cache')
@cache.cached(timeout = 5)
def cache():
    return {'time': str(datetime.now())}

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Invalid inputs"}), 400

    user = app.security.datastore.find_user(email=email)

    if not user:
        return jsonify({"message": "Invalid email"}), 404

    # 🔹 Check account status before verifying password
    if user.active == 0:
        return jsonify({"message": "Your account is pending approval by the admin."}), 403
    elif user.active == -1:
        return jsonify({"message": "Your account has been declined."}), 403

    if verify_password(password, user.password):
        return jsonify({
            'token': user.get_auth_token(),
            'email': user.email,
            'role': user.roles[0].name,
            'id': user.id,
            'location': user.location
        })
    
    return jsonify({'message': 'Incorrect password'}), 400


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    fname = data.get('fname')
    lname = data.get('lname')
    location = data.get('location')

    if not email or not password or role not in ['admin', 'Customer', 'Service Professional']:
        return jsonify({"message": "Invalid inputs"}), 400

    user = app.security.datastore.find_user(email=email)

    if user:
        return jsonify({"message": "User already exists"}), 409  # Conflict

    # Set active status based on role
    active_status = False if role == 'Service Professional' else True  

    try:
        new_user = app.security.datastore.create_user(
            email=email, 
            password=hash_password(password), 
            roles=[role],  
            active=active_status,
            location=location,
            fname=fname,
            lname=lname
        )

        db.session.add(new_user)
        db.session.commit()

        # if role == 'Customer':
        #     new_customer = Customer(
        #         user_id=new_user.id,
        #         fname=fname,
        #         lname=lname,
        #         location=location
        #     )
        #     db.session.add(new_customer)
        #     db.session.commit()

        if role == 'Service Professional':
            service_id = data.get('serviceType')
            experience = data.get('experience')
            pan_number = data.get('panNumber')

            if not service_id or not experience or not pan_number:
                return jsonify({"message": "Invalid inputs"}), 400

            new_service_professional = ServiceProfessional(
                user_id=new_user.id,
                experience=experience,
                service_id=service_id,
                pan_number=pan_number,
                avg_rating=0.0,
                review_count=0,
                past_client_count=0
            )
            db.session.add(new_service_professional)
            db.session.commit()
        
        return jsonify({"message": "User created"}), 201

    except Exception as e:
        db.session.rollback()
        import traceback
        print(traceback.format_exc())  
        return jsonify({"message": "Error creating user", "error": str(e)}), 500


@app.route('/createservice', methods=['POST'])
@auth_required('token')
def createservice():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    min_time_required = data.get('min_time_required')
    base_payment = data.get('base_payment')

    if not all([name, description, min_time_required, base_payment]):
        return jsonify({"message": "Missing required fields"}), 400

    try:
        min_time_required = int(min_time_required)
        base_payment = float(base_payment)
    except ValueError:
        return jsonify({"message": "Invalid numeric values"}), 400

    try:
        new_service = Service(
            name=name,
            description=description,
            min_time_required=min_time_required,
            base_payment=base_payment,
        )
        db.session.add(new_service)
        db.session.commit()

        return jsonify({"message": "Service created successfully", "service_id": new_service.id}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Server error", "error": str(e)}), 500


@app.route('/api/services', methods=['GET'])
def get_services():
    try:
        services = Service.query.all()
        return jsonify([
            {'id': s.id, 'name': s.name, 'description': s.description, 'base_payment': s.base_payment}
            for s in services
        ]), 200
    except Exception as e:
        return jsonify({"message": "Error fetching services", "error": str(e)}), 500


@app.route('/api/service-professionals', methods=['GET'])
def get_service_professionals():
    try:
        service_pros = db.session.query(
            User.fname,    # ✅ Get from User table
            User.lname,    # ✅ Get from User table
            User.location, # ✅ Get from User table
            ServiceProfessional.experience,
            ServiceProfessional.pan_number,
            Service.name.label("service"),
            User.active,
            User.id.label("user_id")
        ).join(User, User.id == ServiceProfessional.user_id) \
         .join(Service, Service.id == ServiceProfessional.service_id).all()

        professionals_list = [
            {
                "name": f"{sp.fname} {sp.lname}",
                "location": sp.location,
                "service": sp.service,
                "experience": sp.experience,
                "pan_number": sp.pan_number,
                "status": int(sp.active),
                "user_id": sp.user_id
            }
            for sp in service_pros
        ]

        return jsonify(professionals_list), 200
    except Exception as e:
        return jsonify({"message": "Error fetching professionals", "error": str(e)}), 500



@app.route('/api/service-professionals/<int:user_id>/update-status', methods=['POST'])
def update_service_professional_status(user_id):
    try:
        data = request.get_json()
        new_status = data.get("status")

        if new_status not in [1, -1]:  
            return jsonify({"message": "Invalid status"}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        user.active = new_status
        db.session.commit()

        return jsonify({"message": "Status updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating status", "error": str(e)}), 500


@app.route('/api/service-professionals/filter', methods=['GET'])
def get_filtered_service_professionals():
    try:
        service_id = request.args.get('service_id')
        location = request.args.get('location')
        print(service_id, location)

        if not service_id or not location:
            return jsonify({"message": "Missing required parameters"}), 400

        professionals = db.session.query(
            User.fname, User.lname, ServiceProfessional.experience,
            Service.name.label("service"), Service.base_payment, User.id.label("user_id")
        ).join(User, User.id == ServiceProfessional.user_id) \
         .join(Service, Service.id == ServiceProfessional.service_id) \
         .filter(ServiceProfessional.service_id == service_id, User.location == location, User.active == 1) \
         .all()

        return jsonify([
            {"name": f"{sp.fname} {sp.lname}", "experience": sp.experience,"price": sp.base_payment, "service": sp.service, "user_id": sp.user_id}
            for sp in professionals
        ]), 200
    except Exception as e:
        return jsonify({"message": "Error fetching professionals", "error": str(e)}), 500


@app.route('/api/book-service', methods=['POST'])
def book_service():
    try:
        data = request.get_json()
        print("📥 Received booking request:", data)  # ✅ Debugging

        customer_id = data.get('customer_id')
        professional_id = data.get('professional_id')
        service_id = data.get('service_id')
        service_date = data.get('service_date')

        if not all([customer_id, professional_id, service_id, service_date]):
            return jsonify({"message": "Missing required fields"}), 400

        new_request = ServiceRequest(
            customer_id=customer_id,
            professional_id=professional_id,
            service_id=service_id,
            date_of_service=datetime.strptime(service_date, "%Y-%m-%d"),
            service_status="requested"
        )

        db.session.add(new_request)
        db.session.commit()

        return jsonify({"message": "Service booked successfully"}), 201
    except Exception as e:
        db.session.rollback()
        print("❌ Error:", str(e))  # ✅ Print error for debugging
        return jsonify({"message": "Error booking service", "error": str(e)}), 500




@app.route("/customer/service-requests", methods=["GET"])
@auth_required('token')
def get_customer_requests():
    try:
        # Fetch service requests with service professionals and services
        requests = (
            db.session.query(
                ServiceRequest.id,
                User.fname.label("fname"),
                User.lname.label("lname"),
                Service.name.label("service_name"),
                Service.description.label("service_description"),
                Service.base_payment.label("base_payment"),
                ServiceRequest.date_of_request,
                ServiceRequest.date_of_service,
                ServiceRequest.service_status.label("status"),
                ServiceRequest.rating,
                ServiceRequest.remarks
            )
            .join(Service, ServiceRequest.service_id == Service.id)  # Join with Service table
            .outerjoin(User, ServiceRequest.professional_id == User.id)  # Left Join with Service Professional
            .filter(ServiceRequest.customer_id == current_user.id)  # Filter by logged-in customer
            .all()
        )

        # Convert data into JSON-friendly format
        data = [
            {
                "id": req.id,
                "professional_name": f"{req.fname or ''} {req.lname or ''}".strip() if req.fname else "N/A",
                "service_name": req.service_name,
                "description": req.service_description,
                "base_payment": req.base_payment,
                "date_of_request": req.date_of_request.strftime("%Y-%m-%d"),
                "date_of_service": req.date_of_service.strftime("%Y-%m-%d") if req.date_of_service else "Not Assigned",
                "status": req.status,
                "rating": req.rating if req.rating else "Not Rated",
                "remarks": req.remarks if req.remarks else "No Remarks",
            }
            for req in requests
        ]

        return jsonify(data), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch service requests", "message": str(e)}), 500



@app.route("/professional/service-requests", methods=["GET"])
@auth_required('token')
def get_professional_requests():
    try:
        print(f"Fetching requests for professional_id={current_user.id}")  # Debugging

        requests = (
            db.session.query(ServiceRequest, User)
            .join(User, ServiceRequest.customer_id == User.id)
            .filter(ServiceRequest.professional_id == current_user.id)
            .all()
        )

        if not requests:
            print("No requests found!")  # Debugging

        data = [
            {
                "id": req.ServiceRequest.id,
                "customer_name": f"{req.User.fname} {req.User.lname}",
                "date_of_request": req.ServiceRequest.date_of_request.strftime("%Y-%m-%d"),
                "date_of_service": (
                    req.ServiceRequest.date_of_service.strftime("%Y-%m-%d")
                    if req.ServiceRequest.date_of_service
                    else "N/A"
                ),
                "status": req.ServiceRequest.service_status,
            }
            for req in requests
        ]

        return jsonify(data), 200

    except Exception as e:
        print(f"Error fetching service requests: {str(e)}")  # Debugging
        return jsonify({"error": "Internal Server Error"}), 500



# Accept a service request
@app.route("/professional/service-requests/accept/<int:request_id>", methods=["POST"])
@auth_required('token')
def accept_request(request_id):
    service_request = ServiceRequest.query.get_or_404(request_id)
    if service_request.professional_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    service_request.service_status = "assigned"
    db.session.commit()
    return jsonify({"message": "Service request accepted."})

# Reject a service request
@app.route("/professional/service-requests/reject/<int:request_id>", methods=["POST"])
@auth_required('token')
def reject_request(request_id):
    service_request = ServiceRequest.query.get_or_404(request_id)
    if service_request.professional_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    service_request.service_status = "rejected"
    db.session.commit()
    return jsonify({"message": "Service request rejected."})

# Mark service as completed
@app.route("/professional/service-requests/complete/<int:request_id>", methods=["POST"])
@auth_required('token')
def complete_request(request_id):
    service_request = ServiceRequest.query.get_or_404(request_id)
    if service_request.professional_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    service_request.service_status = "completed"
    db.session.commit()
    return jsonify({"message": "Service request marked as completed."})

# Close service request with feedback
@app.route("/customer/service-requests/close/<int:request_id>", methods=["POST"])
@auth_required('token')
def close_request(request_id):
    data = request.json
    rating = int(data.get("rating"))
    remarks = data.get("remarks")

    if not (1 <= rating <= 5) or not remarks:
        return jsonify({"error": "Invalid rating or missing remarks"}), 400

    service_request = ServiceRequest.query.get_or_404(request_id)
    if service_request.customer_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    service_request.service_status = "closed"
    service_request.rating = rating
    service_request.remarks = remarks

    professional = ServiceProfessional.query.filter_by(user_id=service_request.professional_id).first()
    if professional:
        professional.review_count += 1
        professional.past_client_count += 1

        total_ratings = db.session.query(
            db.func.sum(ServiceRequest.rating)
        ).filter(
            ServiceRequest.professional_id == service_request.professional_id, 
            ServiceRequest.rating.isnot(None)
        ).scalar()

        total_reviews = ServiceRequest.query.filter(
            ServiceRequest.professional_id == service_request.professional_id, 
            ServiceRequest.rating.isnot(None)
        ).count()

        professional.avg_rating = total_ratings / total_reviews if total_reviews > 0 else 0.0

    db.session.commit()
    return jsonify({"message": "Service closed and feedback recorded."})

# Get all services
@app.route("/admin/services", methods=["GET"])
@auth_required('token')
def get_services_admin():
    services = Service.query.all()
    return jsonify([{
        "id": s.id,
        "name": s.name,
        "description": s.description,
        "base_payment": s.base_payment,
        "min_time": s.min_time_required
    } for s in services])

# Update a service
@app.route("/admin/services/<int:service_id>", methods=["PUT"])
@auth_required('token')
def update_service(service_id):
    data = request.json
    service = Service.query.get_or_404(service_id)

    service.name = data.get("name", service.name)
    service.description = data.get("description", service.description)
    service.base_payment= data.get("base_payment", service.base_payment)
    service.min_time_required = data.get("min_time", service.min_time_required)

    db.session.commit()
    return jsonify({"message": "Service updated successfully."})

# Delete a service
@app.route("/admin/services/<int:service_id>", methods=["DELETE"])
@auth_required('token')
def delete_service(service_id):
    service = Service.query.get_or_404(service_id)
    db.session.delete(service)
    db.session.commit()
    return jsonify({"message": "Service deleted successfully."})
