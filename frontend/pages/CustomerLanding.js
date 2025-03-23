import store from "../utils/store.js";

export default {
    template: `
    <div class="container mt-4">
        <h2 class="text-center mb-4">Our Services</h2>

        <div class="row">
            <div class="col-12 mb-3">
                <button class="btn btn-secondary w-100" @click="goToServiceRequests">
                    View Service Requests
                </button>
            </div>

            <div class="col-md-4 mb-4" v-for="service in services" :key="service.id">
                <div class="card shadow-sm">
                    <img :src="service.image || 'https://via.placeholder.com/150'" class="card-img-top" alt="Service Image">
                    <div class="card-body">
                        <h5 class="card-title">{{ service.name }}</h5>
                        <p class="card-text">{{ service.description }}</p>
                        <p class="card-text"><strong>Starting Price:</strong> ₹{{ service.base_payment }}</p>
                        <button class="btn btn-primary" @click="bookService(service.id)">Book Now</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            services: []
        };
    },
    mounted() {
        this.fetchServices();
    },
    methods: {
        async fetchServices() {
            try {
                const response = await fetch('/api/services');
                this.services = await response.json();
            } catch (error) {
                console.error("❌ Error loading services:", error);
            }
        },
        async bookService(serviceId) {
            try {
                console.log("i am in book service")
                const location = store.state.location || '';
                console.log("location:", location)

                const response = await fetch(`/api/service-professionals/filter?service_id=${serviceId}&location=${location}`);
                const professionals = await response.json();
        
                if (professionals.length === 0) {
                    alert("No service professionals available in your area.");
                    return;
                }
        
                this.$router.push({ path: '/custservicebook', query: { service_id: serviceId } });
            } catch (error) {
                console.error("❌ Error fetching professionals:", error);
            }
        },
        goToServiceRequests() {
            this.$router.push('/customer-requests'); // Ensure correct path
        }
    }
};
