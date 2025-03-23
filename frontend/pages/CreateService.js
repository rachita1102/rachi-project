export default {
  data() {
      return {
          service: {
              name: '',
              description: '',
              min_time_required: '',
              base_payment: ''
          },
          message: null,
          category: null
      };
  },
  methods: {
    
      async submitForm() {
          console.log("inside submit form")
          try {
              const token = JSON.parse(localStorage.getItem('user')).token;
              if (!token) {
                  this.message = "Unauthorized: No token found.";
                  this.category = "danger";
                  return;
              }
              
 
              const response = await fetch('/createservice', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authentication-Token': `${token}`
                  },
                  
                  body: JSON.stringify({
                      name: this.service.name,
                      description: this.service.description,
                      min_time_required: this.service.min_time_required,
                      base_payment: this.service.base_payment
                  })
              });

              if (response.ok) {
                  this.message = "Service created successfully!";
                  this.category = "success";
                  this.service = { name: '', description: '', min_time_required: '', base_payment: '' }; // Reset form
              } else {
                  const errorData = await response.json();
                  this.message = errorData.message || "An error occurred.";
                  this.category = "danger";
              }
          } catch (error) {
              this.message = "An unexpected error occurred.";
              this.category = "danger";
          }
      }
  },
  template: `
      <div class="row">
          <div class="col-md-4 offset-md-4">
              <h3>Create New Service</h3>
              
              <div v-if="message" :class="'alert alert-' + category" role="alert">
                  {{ message }}
              </div>

              <form @submit.prevent="submitForm">
                  <div class="form-group">
                      <label for="name">Service Name</label>
                      <input type="text" id="name" v-model="service.name" class="form-control" required>
                  </div>

                  <div class="form-group">
                      <label for="description">Description</label>
                      <textarea id="description" v-model="service.description" class="form-control" required></textarea>
                  </div>

                  <div class="form-group">
                      <label for="min_time_required">Min Time Required (minutes)</label>
                      <input type="number" id="min_time_required" v-model="service.min_time_required" class="form-control" required>
                  </div>

                  <div class="form-group">
                      <label for="base_payment">Base Payment</label>
                      <input type="number" id="base_payment" v-model="service.base_payment" class="form-control" required>
                  </div>

                  <div class="form-group text-center">
                      <button type="submit" class="btn btn-primary btn-sm">Create</button>
                      <router-link to="/services" class="btn btn-secondary btn-sm">Cancel</router-link>
                  </div>
              </form>
          </div>
      </div>
  `
};
