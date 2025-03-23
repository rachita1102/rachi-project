export default {
    template: `
        <div>
            <h2>My Service Requests</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Professional</th>
                        <th>Service</th>
                        <th>Description</th>
                        <th>Base Payment</th>
                        <th>Requested On</th>
                        <th>Service Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="req in requests" :key="req.id">
                        <td>{{ req.professional_name }}</td>
                        <td>{{ req.service_name }}</td>
                        <td>{{ req.description }}</td>
                        <td>{{ req.base_payment }}</td>
                        <td>{{ req.date_of_request }}</td>
                        <td>{{ req.date_of_service }}</td>
                        <td>{{ req.status }}</td>
                        <td>
                            <button v-if="req.status === 'completed'" class="btn btn-success btn-sm" @click="openFeedback(req)">Close Service</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Feedback Modal -->
            <div v-if="selectedRequest" class="modal fade show d-block" @click.self="closeModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Leave Feedback</h5>
                            <button type="button" class="btn-close" @click="closeModal"></button>
                        </div>
                        <div class="modal-body">
                            <label>Rating (1-5):</label>
                            <input type="number" v-model="feedback.rating" min="1" max="5" class="form-control"/>
                            <label>Remarks:</label>
                            <textarea v-model="feedback.remarks" class="form-control"></textarea>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary btn-sm" @click="closeModal">Cancel</button>
                            <button class="btn btn-primary btn-sm" @click="submitFeedback">Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            requests: [],
            selectedRequest: null,
            feedback: { rating: "", remarks: "" },
        };
    },
    methods: {
        async fetchRequests() {
            try {
                const token = JSON.parse(localStorage.getItem('user')).token;
                if (!token) {
                    this.message = "Unauthorized: No token found.";
                    this.category = "danger";
                    return;
                }

                const response = await fetch('/customer/service-requests', {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authentication-Token': `${token}`
                    }
                });

                if (response.ok) {
                    this.requests = await response.json();
                } else {
                    alert("Failed to fetch service requests.");
                }
            } catch (error) {
                console.error("Error fetching service requests:", error);
                alert("An error occurred while fetching service requests.");
            }
        },
        openFeedback(req) {
            this.selectedRequest = req;
        },
        closeModal() {
            this.selectedRequest = null;
            this.feedback = { rating: "", remarks: "" };
        },
        async submitFeedback() {
            try {
                const token = JSON.parse(localStorage.getItem('user')).token;
                if (!token) {
                    this.message = "Unauthorized: No token found.";
                    this.category = "danger";
                    return;
                }

                if (!this.feedback.rating || this.feedback.rating < 1 || this.feedback.rating > 5) {
                    alert("Please enter a valid rating between 1 and 5.");
                    return;
                }

                const response = await fetch(`/customer/service-requests/close/${this.selectedRequest.id}`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': `${token}`
                    },
                    body: JSON.stringify(this.feedback)
                });

                if (response.ok) {
                    alert("Feedback submitted successfully.");
                    this.fetchRequests();
                    this.closeModal();
                } else {
                    alert("Failed to submit feedback.");
                }
            } catch (error) {
                console.error("Error submitting feedback:", error);
                alert("An error occurred while submitting feedback.");
            }
        }
    },
    mounted() {
        this.fetchRequests();
    }
};
