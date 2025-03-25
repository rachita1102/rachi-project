export default {
    template: `
      <div class="users-table">
        <div class="tabs">
          <button class="tab" :class="{ active: tab === 'customers' }" @click="tab = 'customers'">Customers</button>
          <button class="tab" :class="{ active: tab === 'professionals' }" @click="tab = 'professionals'">Professionals</button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Location</th>
                <th>Take Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>{{ user.fname }} {{ user.lname }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.location }}</td>
                <td>
                  <button v-if="user.active === 1" @click="blockUser(user.id)">Block</button>
                  <button v-else @click="unblockUser(user.id)">Unblock</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `,
    data() {
      return {
        tab: "customers",
        customers: [],
        professionals: []
      };
    },
    computed: {
      filteredUsers() {
        return this.tab === "customers" ? this.customers : this.professionals;
      }
    },
    mounted() {
      this.getCustomers();
      this.getProfessionals();
    },
    methods: {
      getCustomers() {
        fetch("/admin/customers")
          .then(response => response.json())
          .then(data => this.customers = data)
          .catch(error => console.error("Error fetching customers:", error));
      },
      getProfessionals() {
        fetch("/admin/professionals")
          .then(response => response.json())
          .then(data => this.professionals = data)
          .catch(error => console.error("Error fetching professionals:", error));
      },
      blockUser(id) {
        fetch(`/api/block-user/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        })
          .then(response => response.json())
          .then(() => {
            let user = this.filteredUsers.find(user => user.id === id);
            if (user) user.active = 0;
          })
          .catch(error => console.error("Error blocking user:", error));
      },
      unblockUser(id) {
        fetch(`/api/unblock-user/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        })
          .then(response => response.json())
          .then(() => {
            let user = this.filteredUsers.find(user => user.id === id);
            if (user) user.active = 1;
          })
          .catch(error => console.error("Error unblocking user:", error));
      }
    }
  };
  