import { Component, ViewChild } from "@angular/core";
import { NavController, App, AlertController } from "ionic-angular";
import { AuthService } from "../../providers/auth-service";
import { Common } from "../../providers/common";

@Component({ selector: "page-home", templateUrl: "home.html" })
export class HomePage {
  @ViewChild("updatebox") updatebox;
  public resposeData: any;
  public dataSet: any;
  public noRecords: boolean;
  reminderData = {
    id:"",
    // name:"",
    // description:"",
    // createtime:"",
    // duetime:"",
    // level:"",
    // status:"",
    // patientId:"",
    // patientName:"",
    // doctorId:"",
    lastCreated: ""
  };

  constructor(
    public common: Common,
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    public app: App,
    public authService: AuthService
  ) {
    const tmp = JSON.stringify(this.authService.getData());
    const data = JSON.parse(tmp);
    this.reminderData.id = data.id;
    // this.reminderData.name = data.name;
    // this.reminderData.description = data.description;
    // this.reminderData.createtime = data.createtime;
    // this.reminderData.duetime = data.createtime;
    // this.reminderData.level = data.level;
    // this.reminderData.status = data.status;
    // this.reminderData.patientId = data.patientId;
    // this.reminderData.patientName = data.patientName;
    // this.reminderData.doctorId = data.doctorId;
    this.reminderData.lastCreated = "";
    this.noRecords = false
    this.getFeed();
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

          const dataLength = this.resposeData.length;

          this.reminderData.lastCreated = this.resposeData[dataLength - 1].createtime;
        } else {
          console.log("No access");
        }
      },
      err => {
        //Connection failed message
      }
    );
  }

  // feedUpdate() {
  //   if (this.reminderData) {
  //     this.common.presentLoading();
  //     this.authService.getData().subscribe(
  //       result => {
  //         this.resposeData = result;
  //         if (this.resposeData) {
  //           this.common.closeLoading();
  //           this.dataSet.unshift(this.resposeData);
  //           this.reminderData.feed = "";

  //           //this.updatebox.setFocus();
  //           setTimeout(() => {
  //             //  this.updatebox.focus();
  //           }, 150);
  //         } else {
  //           console.log("No access");
  //         }
  //       },
  //       err => {
  //         //Connection failed message
  //       }
  //     );
  //   }
  // }

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
              this.reminderData.id = id;
              this.authService.putData(this.reminderData.id).subscribe(
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
              this.reminderData.lastCreated = this.resposeData[
                newData.length - 1
              ].createtime;

              // for (let i = 0; i < newData.length; i++) {
              //   this.dataSet.push(newData[i]);
              // }
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
