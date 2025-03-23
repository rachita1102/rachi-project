export default {
    template: `
      <div class="admin-dashboard d-flex align-items-center justify-content-center vh-100" style="background: linear-gradient(135deg, #36D1DC, #5B86E5);">
        <div class="card p-4 shadow-lg text-center" style="width: 400px;">
          <div class="card-body">
            <h2 class="mb-4">Admin Dashboard</h2>
            
            <button class="btn btn-primary w-100" @click="goToCreateService">
              Create a Service
            </button>
            <button class="btn btn-secondary w-100" @click="goToServiceProfessionals">
            View Service Professionals
          </button>
          <button class="btn btn-primary w-100" @click="goToServiceTable">
              view Service
            </button>
          </div>
        </div>
      </div>
    `,
    methods: {
      goToCreateService() {
        this.$router.push('/createservice');
      },
      goToServiceProfessionals() {
        this.$router.push('/service-professionals');
      },
      goToServiceTable(){
        this.$router.push('/admin/services')
      }
    }
  };