import store from "../utils/store.js";

export default { 
    template: `
    <div class="container mt-4">
        <h2 class="text-center mb-4">Available Professionals</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Experience</th>
                    <th>Avg_rating </th>
                    <th>Price</th>
                    <th>Schedule</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="pro in professionals" :key="pro.user_id">
                    <td>{{ pro.name }}</td>
                    <td>{{ pro.experience }} years</td>
                    <td>{{ pro.contact || "N/A" }}</td>
                    <td>₹{{ pro.price }}</td>
                    <td>
                        <button class="btn btn-success" @click="openModal(pro.user_id)">Schedule</button>
                    </td>
                </tr>
                <tr v-if="professionals.length === 0">
                    <td colspan="5" class="text-center">No professionals found.</td>
                </tr>
            </tbody>
        </table>

        <!-- 📌 Booking Modal -->
        <div v-if="showModal" class="modal fade show d-block" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Select Service Date</h5>
                        <button type="button" class="close" @click="closeModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <label for="serviceDate">Choose Date:</label>
                        <input type="date" id="serviceDate" v-model="selectedDate" class="form-control" required>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
                        <button type="button" class="btn btn-primary" @click="scheduleService">Confirm Booking</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="showModal" class="modal-backdrop fade show"></div> 
    </div>
    `,
    
    data() {
        return { 
            professionals: [],
            showModal: false,  // Modal visibility
            selectedDate: "",  // Date input
            selectedProfessional: null,  // Stores the professional's ID
        };
    },
    
    mounted() {
        this.fetchProfessionals();
    },
    
    methods: {
        async fetchProfessionals() {
            const service_id = this.$route.query.service_id;
            const user_location = store.state.location || "";
            console.log("🔍 Fetching professionals for:", { service_id, user_location });

            if (!service_id) {
                alert("Service ID is missing!");
                return;
            }

            try {
                const response = await fetch(`/api/service-professionals/filter?service_id=${service_id}&location=${encodeURIComponent(user_location)}`);
                const data = await response.json();
                this.professionals = data;
            } catch (error) {
                console.error("❌ Error fetching professionals:", error);
            }
        }, 

        // 📌 Opens modal with professional ID
        openModal(professionalId) {
            this.selectedProfessional = professionalId;
            this.showModal = true;
        },

        // 📌 Closes the modal
        closeModal() {
            this.showModal = false;
            this.selectedDate = "";
            this.selectedProfessional = null;
        },

        async scheduleService() {
            if (!this.selectedDate) {
                alert("Please select a date!");
                return;
            }

            const customerId = store.state.user_id;
            if (!customerId) {
                alert("You must be logged in to book a service.");
                return;
            }

            try {
                const response = await fetch("/api/book-service", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        customer_id: customerId,
                        professional_id: this.selectedProfessional,
                        service_id: this.$route.query.service_id,
                        service_date: this.selectedDate
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to book service.");
                }

                const result = await response.json();
                alert(result.message);
                this.closeModal();  // Close modal after booking
            } catch (error) {
                console.error("❌ Error booking service:", error);
            }
        }
    }
};

