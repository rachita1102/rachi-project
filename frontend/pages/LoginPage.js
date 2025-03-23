export default {
  template: `
    <div class="login-page d-flex align-items-center justify-content-center vh-100" 
         style="background: linear-gradient(135deg, #ff7e5f, #feb47b);">
      <div class="card p-4 shadow-lg text-center" style="width: 350px;">
        <div class="card-body">
          <div class="profile-icon mb-3">
            <i class="fas fa-user-circle fa-4x"></i>
          </div>
          <h4 class="mb-3">Login</h4>
          <div class="form-group mb-3">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text"><i class="fas fa-user"></i></span>
              </div>
              <input type="email" class="form-control" placeholder="Email ID" v-model="email" />
            </div>
          </div>
          <div class="form-group mb-3">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text"><i class="fas fa-lock"></i></span>
              </div>
              <input type="password" class="form-control" placeholder="Password" v-model="password" />
            </div>
          </div>
          <div class="d-flex justify-content-between mb-3">
            <div>
              <input type="checkbox" id="rememberMe" />
              <label for="rememberMe"> Remember me</label>
            </div>
            <a href="#" class="text-primary">Forgot Password?</a>
          </div>
          <button class="btn btn-primary w-100" @click="submitLogin">LOGIN</button>
        </div>
      </div>

      <!-- Bootstrap Modal for Errors -->
      <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title" id="errorModalLabel">Login Failed</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              {{ errorMessage }}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      modalInstance: null
    };
  },

  mounted() {
    // Ensure Bootstrap modal works
    this.modalInstance = new bootstrap.Modal(document.getElementById('errorModal'));
  },

  methods: {
    async submitLogin() {
      try {
        const res = await fetch(location.origin + "/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: this.email, password: this.password }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 403) {
            this.errorMessage = data.message || "Access denied. Please contact support.";
          } else if (res.status === 404) {
            this.errorMessage = "Invalid email. Please check and try again.";
          } else if (res.status === 400) {
            this.errorMessage = "Incorrect password.";
          } else {
            this.errorMessage = "Login failed. Please try again.";
          }

          // Show Bootstrap Modal
          this.modalInstance.show();
          return;
        }

        console.log("Login Response:", data);
        
        localStorage.setItem("user", JSON.stringify(data));
        this.$store.commit("setUser");

        // ✅ Redirect Based on Role
        if (data.role === "admin") this.$router.push("/admin-dashboard");
        else if (data.role === "Customer") this.$router.push("/customerlanding");
        else if (data.role === "Service Professional") this.$router.push("/professional-requests");
        else this.$router.push("/");

      } catch (error) {
        console.error("Error during login:", error);
        this.errorMessage = "An unexpected error occurred. Please try again.";
        this.modalInstance.show();
      }
    }
  }
};
