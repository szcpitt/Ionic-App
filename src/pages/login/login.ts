import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import {AuthService} from "../../providers/auth-service";
import {JwtHelper} from 'angular2-jwt';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class Login {

  jwtHelper: JwtHelper = new JwtHelper();
  resposeData : any;
  accessToken: string;
  userData = {"username":"", "password":""};

  constructor(public navCtrl: NavController, public authService: AuthService, private toastCtrl:ToastController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Login');
  }

  login(){
   if(this.userData.username && this.userData.password){
    this.authService.postData(this.userData.username, this.userData.password).subscribe(result =>{
      if(result){
        // const decodedToken = this.jwtHelper.decodeToken(result);
        this.authService.getPatient(this.userData.username).subscribe();
        if(localStorage.getItem("patientId")){
          this.navCtrl.push(TabsPage);
        }
      }else{
        this.presentToast("Please give valid username and password");
      }
    }, (err) => {
      
    });
   }else{
    this.presentToast("Give username and password");
   }
  
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

}
