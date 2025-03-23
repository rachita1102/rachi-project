export default { 
    template: `
    <div class="container mt-4">
        <div class="card p-4 shadow">
            <h3 class="text-center mb-3">Register</h3>

            <div class="form-group">
                <input class="form-control" placeholder="Email" v-model="email"/>  
            </div>
            <div class="form-group">
                <input class="form-control" placeholder="Password" type="password" v-model="password"/> 
            </div>
            <div class="form-group">
                <input class="form-control" placeholder="First Name" v-model="fname"/> 
            </div>
            <div class="form-group">
                <input class="form-control" placeholder="Last Name" v-model="lname"/> 
            </div>

            <!-- Location Dropdown -->
            <div class="form-group">
                <label for="location">Select Location:</label>
                <select class="form-control" v-model="location" id="location">
                    <option disabled value="">Choose a location</option>
                    <option>New Delhi</option>
                    <option>Bangalore</option>
                    <option>Chennai</option>
                    <option>Mumbai</option>
                    <option>Gurgaon</option>
                    <option>Noida</option>
                </select>
            </div>

            <!-- Role Selection -->
            <div class="form-group">
                <label for="role">Select Role:</label>
                <select class="form-control" v-model="role" id="role">
                    <option value="Customer">Customer</option>
                    <option value="Service Professional">Professional</option>
                </select>
            </div> 
            
            <!-- Service Professional Fields -->
            <div v-if="role === 'Service Professional'">
                <div class="form-group">
                    <label for="serviceType">Select Service Type:</label>
                    <select class="form-control" v-model="serviceType" id="serviceType">
                        <option v-for="service in services" :key="service.id" :value="service.id">{{ service.name }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="experience">Experience (in years):</label>
                    <input class="form-control" type="number" v-model="experience" id="experience" />
                </div>
                <div class="form-group">
                    <label for="panNumber">PAN Number:</label>
                    <input class="form-control" type="text" v-model="panNumber" id="panNumber" />
                </div>
            </div>
            
            <button class="btn btn-primary w-100 mt-3" @click="submitRegister">Register</button>
        </div>
    </div>
    `,
    
    data() {
        return {
            email: '',
            password: '',
            fname: '',
            lname: '',
            location: '',
            role: '',
            serviceType: '',
            experience: '',
            panNumber: '',
            services: []
        };
    },

    mounted() {
        this.loadServices();
    },

    methods: {
        async loadServices() {
            try {
                const response = await axios.get('/api/services');  
                this.services = response.data;  
                console.log("📌 Services loaded:", this.services); 
            } catch (error) {
                console.error("❌ Error loading services:", error);
            }
        },

        async submitRegister() {  
            const payload = {
                email: this.email,
                password: this.password,
                fname: this.fname,
                lname: this.lname,
                location: this.location,
                role: this.role,
                serviceType: this.role === "Service Professional" ? this.serviceType : null,
                experience: this.role === "Service Professional" ? this.experience : null,
                panNumber: this.role === "Service Professional" ? this.panNumber : null
            };
        
            console.log("📌 Sending Data:", payload);
        
            try {
                const res = await fetch(location.origin + '/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
        
                if (res.ok) {
                    console.log('✅ User registered successfully');
                    const data = await res.json();
                    localStorage.setItem('user', JSON.stringify(data));
                    this.$store.commit('setUser');
                    this.$router.push('/login');
                } else {
                    const errorData = await res.json();
                    console.error("❌ Registration failed:", errorData.message);
                    alert(errorData.message);
                }
            } catch (error) {
                console.error("❌ Error during registration:", error);
            }
        }
    }
};
