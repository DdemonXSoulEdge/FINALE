import './polyfills.server.mjs';
import{Ib as a,h as o,k as r}from"./chunk-OCSTSHTI.mjs";var i=class t{constructor(e){this.router=e}canActivate(){return localStorage.getItem("token")?!0:(this.router.navigate(["/auth/login"]),!1)}static \u0275fac=function(n){return new(n||t)(r(a))};static \u0275prov=o({token:t,factory:t.\u0275fac,providedIn:"root"})};export{i as a};
