import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import {TOKEN_AUTH_PASSWORD, TOKEN_AUTH_USERNAME} from './auth.constant';

@Injectable()
export class AuthService {

  static rootUrl = 'https://springboot-hospital.herokuapp.com';

  constructor(public http: Http) {
    console.log('Hello AuthService Provider');
  }

  postData(username, password){
    let headers = new Headers();
    headers.append('Content-Type',  'application/x-www-form-urlencoded');
    headers.append('Authorization', 'Basic ' + btoa(TOKEN_AUTH_USERNAME + ':' + TOKEN_AUTH_PASSWORD));    
    const body = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&grant_type=password`;
    return this.http.post(AuthService.rootUrl+"/oauth/token", body, {headers: headers})
      .map(res => res.json())
      .map((res: any) => {
        if (res.access_token) {
          localStorage.setItem('access_token', res.access_token);
          return res.access_token;
        }
        return null;
      });
  }

  getData(){
    const token = localStorage.getItem("access_token");
    const patientId = localStorage.getItem("patientId");
    const url = AuthService.rootUrl+'/get/reminder/patient/'+patientId;
    let headers = new Headers();
    headers.append('Content-Type',  'application/json');
    headers.append('Authorization', 'Bearer ' + token);
    return this.http.get(url,{headers: headers}).map(res => res.json());

  }

  putData(id){
    const token = localStorage.getItem("access_token");
    const url = AuthService.rootUrl+'/put/reminder/'+id;
    let headers = new Headers();
    headers.append('Content-Type',  'application/json');
    headers.append('Authorization', 'Bearer ' + token);
    const body="";
    return this.http.put(url,body,{headers: headers});
  }

  getPatient(username){
    const token = localStorage.getItem("access_token");
    const url = AuthService.rootUrl+'/get/user/patient/'+username;
    let headers = new Headers();
    headers.append('Content-Type',  'application/json');
    headers.append('Authorization', 'Bearer ' + token);
    return this.http.get(url,{headers: headers})
      .map(res => res.json())
      .map((res: any) => {
        if(res.doctorId != null){
          localStorage.setItem("doctorId",res.doctorId);
        }
        if (res.id != null) {
          localStorage.setItem("patientId", res.id);
          return res.id;
        }
        return null;
      });;
  }

}
