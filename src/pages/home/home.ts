import { Component, ViewChild } from "@angular/core";
import { NavController, App, AlertController } from "ionic-angular";
import { AuthService } from "../../providers/auth-service";
import { Common } from "../../providers/common";

import Stomp from 'stompjs';
import SockJS from 'sockjs-client';

import $ from 'jquery';

@Component({ selector: "page-home", templateUrl: "home.html" })
export class HomePage {
  @ViewChild("updatebox") updatebox;
  public resposeData: any;
  public dataSet: any;
  public noRecords: boolean;

  private serverUrl = 'https://springboot-hospital.herokuapp.com/socket';
  private stompClient;

  constructor(
    public common: Common,
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    public app: App,
    public authService: AuthService
  ) {
    this.noRecords = false
    this.getFeed();
    this.initializeWebSocketConnection();
  }

  initializeWebSocketConnection(){
    let ws = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(ws);
    let that = this;
    let patientId = localStorage.getItem("patientId");
    this.stompClient.connect({}, function(frame) {
      that.stompClient.subscribe("/updateReminder/"+patientId, (message) => {
        if(message.body) {
          // if($('#updateDOM').children().length==0){
            $("#updateDOM").append("<ion-item id='updateData'>"+message.body+"</ion-item>");
            console.log(message.body);
          // }
        }
      });
    });
  }

  getFeed() {
    this.common.presentLoading();
    this.authService.getData().subscribe(
      result => {
        this.resposeData = result;
        if (this.resposeData) {
          this.common.closeLoading();
          this.dataSet = this.resposeData;
          console.log(this.dataSet);
        } else {
          console.log("No access");
        }
      },
      err => {
        //Connection failed message
      }
    );
  }

  finish(id, msgIndex) {
    if (id > 0) {
      let alert = this.alertCtrl.create({
        title: "Finish Reminder",
        message: "Did you finish this task?",
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
            handler: () => {
              console.log("Cancel clicked");
            }
          },
          {
            text: "Yes",
            handler: () => {
              // this.reminderData.id = id;
              this.authService.putData(id).subscribe(
                result => {
                  this.resposeData = result;
                  if (this.resposeData) {
                    this.dataSet.splice(msgIndex, 1);
                  } else {
                    console.log("No access");
                  }
                },
                err => {
                  //Connection failed message
                }
              );
              //Socket message
              let patientId = localStorage.getItem("patientId");
              let doctorId = localStorage.getItem("doctorId");
              let message=doctorId+":"+patientId;
              this.stompClient.send("/app/send/newStatus" , {}, message);
            }
          }
        ]
      });
      alert.present();
    }
    this.getFeed();
  }



  doInfinite(e): Promise<any> {
    console.log("Begin async operation");
    return new Promise(resolve => {
      setTimeout(() => {
        this.authService.getData().subscribe(
          result => {
            this.resposeData = result;
            if (this.resposeData.length>this.dataSet.length) {
              this.noRecords = false;
              const newData = this.resposeData;
              this.dataSet = newData;
            } else {
              this.noRecords = true;
              console.log("No user updates");
            }
          },
          err => {
            //Connection failed message
          }
        );
        resolve();
      }, 500);
    });
  }

  converTime(time) {
    let a = new Date(time * 1000);
    return a;
  }

  backToWelcome() {
    const root = this.app.getRootNav();
    root.popToRoot();
  }

  logout() {
    //Api Token Logout

    localStorage.clear();
    setTimeout(() => this.backToWelcome(), 1000);
  }
}
