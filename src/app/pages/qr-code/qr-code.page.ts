import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserData, GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.page.html',
  styleUrls: ['./qr-code.page.scss'],
})
export class QrCodePage implements OnInit {

  qrData: any;
  elementType: 'url' | 'canvas' | 'img' = 'img';

  constructor(private modalCtrl: ModalController,
    private globalService: GlobalService) { 
    this.InitializeData();
  }

  private InitializeData(){
    var userData = new UserData();
    userData.user_id = this.globalService.userData.user_id;
    userData.user_name = this.globalService.userData.user_name;
    userData.user_tipe_kendaraan = this.globalService.userData.user_tipe_kendaraan;
    userData.user_nopol_kendaraan = this.globalService.userData.user_nopol_kendaraan;
    userData.user_saldo_member = this.globalService.userData.user_saldo_member;
    userData.user_telp = this.globalService.userData.user_telp;
    userData.user_status = this.globalService.userData.user_status;

    this.qrData = JSON.stringify(userData);
    console.log(this.qrData);
  }

  ngOnInit() {
  }

  public CloseQrCode() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }
}
