const Home = {
    template : `<h1> this is home </h1>`
}
import AdminDashboardPage from "../pages/AdminDashboardPage.js";
// import BlogsListPage from "../pages/BlogsListPage.js";
// import DisplayBlogPage from "../pages/DisplayBlogPage.js";
import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";
// import ExploreUsersPage from "../pages/ExploreUsersPage.js";
import CreateService from "../pages/CreateService.js"
import CustomerLanding from "../pages/CustomerLanding.js";
import ServiceProfessionalsPage from "../pages/ServiceProfessionalsPage.js";
import CustServiceBook from "../pages/CustServiceBook.js";
import CustomerRequests from "../pages/CustomerRequests.js";
import ProfessionalRequests from "../pages/ProfessionalRequests.js";
import AdminServicesTable from "../pages/AdminServicesTable.js";
import store from './store.js';



Vue.use(VueRouter);

const routes = [
    {path : '/', component : Home},
    {path : '/login', component : LoginPage},
    {path : '/register', component : RegisterPage},
    // {path : '/feed', component : BlogsListPage, meta : {requiresLogin : true}},
    { path: '/createservice', component: CreateService, meta: { requiresLogin: true, role: "admin" } },
    { path: '/customerlanding' , component: CustomerLanding, meta: { requiresLogin: true, role: "Customer" } },
    // {path : '/blogs/:id', component : DisplayBlogPage, props : true, meta : {requiresLogin : true}},
    {path : '/admin-dashboard', component : AdminDashboardPage, meta : {requiresLogin : true, role : "admin"}},
    { path: '/customerlanding', component: CustomerLanding, meta: { requiresLogin: true, role: "Customer" } },
    { path: '/customer-requests', component: CustomerRequests, meta: { requiresLogin: true, role: "Customer" } },
    { path: '/professional-requests', component: ProfessionalRequests, meta: { requiresLogin: true, role: "Service Professional" } },
    { path: '/custservicebook', component: CustServiceBook, meta: { requiresLogin: true, role: "Customer" } },
    { path: '/service-professionals', component: ServiceProfessionalsPage, meta: { requiresLogin: true, role: "admin" } },
    {
        path: "/admin/services",
        component: AdminServicesTable,
        meta: { requiresLogin: true, role: "admin" }, // Ensure only admin users can access
      }
    // {path : '/explore', component : ExploreUsersPage }
]

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',  // Use clean URLs
    routes
});


// navigation guards
router.beforeEach((to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresLogin)){
        if (!store.state.loggedIn){
            next({path : '/login'})
        } else if (to.meta.role && to.meta.role != store.state.role){
            alert('role not authorized')
             next({path : '/'})
        } else {
            next();
        }
    } else {
        next();
    }
})


export default router;