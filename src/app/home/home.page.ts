import { Component } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery/ngx';
import { ToastController, ModalController, ActionSheetController, AlertController } from '@ionic/angular';
import { GlobalService, UserData, ParkingData, DateData } from '../services/global.service';
import { QrCodePage } from '../pages/qr-code/qr-code.page';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { PembayaranPage } from '../pages/pembayaran/pembayaran.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  // qrData = 'http://instagram.com/';
  qrData: any;
  scannedCode = null;
  elementType: 'url' | 'canvas' | 'img' = 'canvas';
  parkLotNama: string;
  parkLotKode: string;
  parkLotAlamat: string;
  userSaldo: string;

  constructor(private barcodeScanner: BarcodeScanner,
    private base64ToGallery: Base64ToGallery,
    private toastCtrl: ToastController,
    private alertController: AlertController,
    private globalService: GlobalService,
    private modalCtrl: ModalController,
    private actionSheetController: ActionSheetController,
    private router: Router,
    private datePipe: DatePipe) {

    this.InitializeData();
    // this.Timer();
    // var ccd: User2Data = JSON.parse(abs);
    // console.log(ccd);
    // console.log(ccd.kota2);
    // console.log(ccd.kota);

  }

  async InitializeData() {
    await this.globalService.GetParkLotDataFromStorage();

    this.parkLotNama = this.globalService.parkLotData.park_lot_nama;
    this.parkLotKode = this.globalService.parkLotData.park_lot_id;
    this.parkLotAlamat = this.globalService.parkLotData.park_lot_alamat;
  }

  private Timer() {
    setInterval(function () {
      this.ShowRepeatData();
    }.bind(this), 500);
  }

  ShowRepeatData() {
    var saldo = this.globalService.userData.user_saldo_member.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    this.userSaldo = saldo;
  }

  DoRefresh(event: any) {
    this.ShowRepeatData();

    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  async parking() {
    const modal = await this.modalCtrl.create({
      component: QrCodePage,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  scanCode() {
    var date = new Date();
    var aa = this.datePipe.transform(date, 'yyyy-MM-dd HH:mm');
    console.log(aa);


    this.barcodeScanner.scan().then(
      barcodeData => {
        this.scannedCode = barcodeData.text;
        var dataScanned: any = JSON.parse(this.scannedCode);
        var userData: UserData = this.MappingScannedData(dataScanned);
        if (userData.statusParkingCrOrUp == "INSERT") {
          var dataGetParking = this.globalService.SaveParking(userData);
          this.SubscribeSaveParking(dataGetParking);
        } else {
          var dataGetParking = this.globalService.GetParking(userData.user_nopol_kendaraan);
          this.SubscribeGetParking(dataGetParking);
        }
      }
    );
  }

  private MappingScannedData(data: any): UserData {
    var userData = new UserData();
    userData.user_id = data.user_id;
    userData.user_name = data.user_name;
    userData.user_tipe_kendaraan = data.user_tipe_kendaraan;
    userData.user_nopol_kendaraan = data.user_nopol_kendaraan;
    userData.user_saldo_member = data.user_saldo_member;
    userData.user_telp = data.user_telp;
    userData.user_status = data.user_status;
    userData.statusParkingCrOrUp = data.statusParkingCrOrUp;

    return userData;
  }

  private async SubscribeSaveParking(dataGetParking: Observable<any>) {
    dataGetParking.subscribe(data => {
      var dataError = data.error.toString();
      if (dataError == "false")
        this.globalService.PresentToast("Berhasil melakukan parking")
      else
        this.globalService.PresentToast("Gagal melakukan parking")
    });
  }

  private SubscribeGetParking(data: Observable<any>) {
    data.subscribe(data => {
      var dataError = data.error.toString();
      if (dataError == "false") {
        var parkingDataFromDb = data.result.find(x => x);
        var parkingData = this.MappingParkingDataFromDb(parkingDataFromDb);
        var parkingDateData = this.globalService.GetDateWithDateParam(parkingData.parking_waktu_masuk);

        // var parkingId = parkingData.parking_id;
        // var parkingDate = parkingDateData.szDay + ", " + parkingDateData.decDate + " " + parkingDateData.szMonth + " " + parkingDateData.decYear;
        // var parkingAreaParkir = parkingData.parking_park_lot_name;
        // var parkingJamMasuk = parkingDateData.szHour + ":" + parkingDateData.szMinute;
        // var parkingBiaya = this.ReturnBiaya(parkingData, parkingDateData);

        this.PilihPembayaran(parkingData, parkingDateData);
      }
    });
  }

  private MappingParkingDataFromDb(parkingDataFromDb: any): ParkingData {
    var parkingData = new ParkingData();
    parkingData.parking_park_lot_id = parkingDataFromDb.park_lot_id;
    parkingData.parking_park_lot_name = parkingDataFromDb.park_lot_nama;
    parkingData.parking_park_lot_biaya_motor = parkingDataFromDb.park_lot_biaya_motor;
    parkingData.parking_park_lot_biaya_mobil = parkingDataFromDb.park_lot_biaya_mobil;
    parkingData.parking_user_id = parkingDataFromDb.user_id;
    parkingData.parking_user_name = parkingDataFromDb.user_name;
    parkingData.parking_user_tipe_kendaraan = parkingDataFromDb.user_tipe_kendaraan;
    parkingData.parking_user_nopol_kendaraan = parkingDataFromDb.user_nopol_kendaraan;
    parkingData.parking_user_saldo_member = parkingDataFromDb.user_saldo_member;
    parkingData.parking_id = parkingDataFromDb.parking_id;
    parkingData.parking_waktu_masuk = parkingDataFromDb.parking_waktu_masuk;
    parkingData.parking_waktu_keluar = parkingDataFromDb.parking_waktu_keluar;
    parkingData.parking_biaya = parkingDataFromDb.parking_biaya;
    parkingData.parking_jenis_pembayaran = parkingDataFromDb.parking_jenis_pembayaran;
    parkingData.parking_status = parkingDataFromDb.parking_status;

    return parkingData;
  }

  private async PilihPembayaran(parkingData: ParkingData, parkingDateData: DateData) {
    const modal = await this.modalCtrl.create({
      component: PembayaranPage,
      componentProps: {
        'parkingId': parkingData.parking_id,
        'parkingUserName': parkingData.parking_user_name,
        'parkingUserNopol': parkingData.parking_user_nopol_kendaraan,
        'parkingUserSaldoMember': parkingData.parking_user_saldo_member,
        'parkingJamMasuk': parkingDateData.szHour + ":" + parkingDateData.szMinute,
        'parkingBiaya': this.ReturnBiaya(parkingData, parkingDateData)
      },
      cssClass: 'my-custom-class',
    });
    return await modal.present();
  }

  private ReturnBiaya(parkingData: ParkingData, parkingDateData: DateData): string {
    var biaya = parkingData.parking_user_tipe_kendaraan == "Motor" ? parkingData.parking_park_lot_biaya_motor : parkingData.parking_park_lot_biaya_mobil;
    var date = new Date();

    var totalHour = date.getHours() - parkingDateData.decHour;
    if (date.getMinutes() > parkingDateData.decMinute)
      totalHour += 1;

    return (+biaya * totalHour).toString();
  }

  // private async PilihPembayaran2() {
  //   const modal = await this.modalCtrl.create({
  //     component: PembayaranPage,
  //     componentProps: {
  //       'parkingId': '27',
  //       'parkingUserName': 'pengguna',
  //       'parkingUserNopol': 'AB9877HH',
  //       'parkingJamMasuk': '23:22',
  //       'parkingBiaya': '14000'
  //     },
  //     cssClass: 'my-custom-class',
  //   });
  //   return await modal.present();
  // }

  downloadQR() {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const imageData = canvas.toDataURL('image/jpeg').toString();
    console.log('data: ', imageData);

    let data = imageData.split(',')[1];

    this.base64ToGallery.base64ToGallery(data,
      { prefix: '_img', mediaScanner: true })
      .then(async res => {
        let toast = await this.toastCtrl.create({
          header: 'QR Code daved in your Photolibrary'
        });
      }, err => console.log('error: ', err)
      );
  }

  logout() {
    this.globalService.Logout();
  }

  async showProfil() {
    const actionSheet = await this.actionSheetController.create({
      header: this.globalService.userData.user_name,
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Log Out',
        icon: 'log-out-outline',
        // role: 'cancel',
        handler: () => {
          this.globalService.Logout();
        }
      }]
    });
    await actionSheet.present();
  }
}