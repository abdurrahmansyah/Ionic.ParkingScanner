import { Injectable } from '@angular/core';
import { InjectorInstance } from '../app.module';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { ThrowStmt } from '@angular/compiler';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  public userData: UserData = new UserData();
  public parkLotData: ParkLotData = new ParkLotData();
  httpClient = InjectorInstance.get<HttpClient>(HttpClient);
  loading: any;

  constructor(private storage: Storage,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private router: Router,
    private authService: AuthenticationService,
    private datePipe: DatePipe) {
    this.InitializeLoadingCtrl();
  }

  async InitializeLoadingCtrl() {
    this.loading = await this.loadingController.create({
      mode: 'ios'
    });
  }

  public LoginParkLot(szParkLotCodeLogin: string, szPassword: string) {
    this.PresentLoading();
    var url = 'http://sihk.hutamakarya.com/apiabsen/smartParking/loginParkLot.php';

    let postdata = new FormData();
    postdata.append('park_lot_login_code', szParkLotCodeLogin);
    postdata.append('park_lot_password', szPassword);

    var data: any = this.httpClient.post(url, postdata);
    data.subscribe(data => {
      var dataError = data.error.toString();
      if (dataError == "false") {
        var parkLotDataFromDb = data.result.find(x => x);
        var parkLotData = this.MappingParkLotData(parkLotDataFromDb);

        this.storage.set('parkLotData', parkLotData);
        this.loadingController.dismiss();
        this.PresentToast("Login Berhasil");
        this.authService.login();
        this.router.navigate(['home']);
      }
      else {
        this.loadingController.dismiss();
        this.PresentToast("Login Gagal");
      }
    });
  }

  private MappingParkLotData(parkLotDataFromDb: any) {
    var parkLotData = new ParkLotData();
    parkLotData.park_lot_id = parkLotDataFromDb.park_lot_id;
    parkLotData.park_lot_nama = parkLotDataFromDb.park_lot_nama;
    parkLotData.park_lot_biaya_motor = parkLotDataFromDb.park_lot_biaya_motor;
    parkLotData.park_lot_biaya_mobil = parkLotDataFromDb.park_lot_biaya_mobil;
    parkLotData.park_lot_biaya_mobil = parkLotDataFromDb.park_lot_biaya_mobil;
    parkLotData.park_lot_alamat = parkLotDataFromDb.park_lot_alamat;
    parkLotData.park_lot_login_code = parkLotDataFromDb.park_lot_alamat;

    return parkLotData;
  }

  public Login(szUserNopol: string, szPassword: string) {
    this.PresentLoading();
    var url = 'http://sihk.hutamakarya.com/apiabsen/smartParking/login.php';

    let postdata = new FormData();
    postdata.append('user_nopol_kendaraan', szUserNopol);
    postdata.append('user_password', szPassword);

    var data: any = this.httpClient.post(url, postdata);
    data.subscribe(data => {
      var dataError = data.error.toString();
      if (dataError == "false") {
        var userDataFromDb = data.result.find(x => x);
        var userData = this.MappingUserData(userDataFromDb);

        this.storage.set('userData', userData);
        this.loadingController.dismiss();
        this.PresentToast("Login Berhasil");
        this.authService.login();
        this.router.navigate(['home']);
      }
      else {
        this.loadingController.dismiss();
        this.PresentToast("Login Gagal");
      }
    });
  }

  private MappingUserData(userDataFromDb: any) {
    var userData = new UserData();
    userData.user_id = userDataFromDb.user_id;
    userData.user_name = userDataFromDb.user_name;
    // userData.user_saldo_member = userDataFromDb.user_saldo_member; // GAIKUT BIAR GA NYIMPEN DI STORAGE
    userData.user_telp = userDataFromDb.user_telp;
    userData.user_tipe_kendaraan = userDataFromDb.user_tipe_kendaraan;
    userData.user_nopol_kendaraan = userDataFromDb.user_nopol_kendaraan;
    userData.user_status = userDataFromDb.user_status;

    return userData;
  }

  public Logout() {
    this.authService.logout();
  }

  public async GetParkLotDataFromStorage() {
    await this.storage.get('parkLotData').then((parkLotData) => {
      this.parkLotData = parkLotData;
    });
  }

  public GetParking(userNopol: string): Observable<any> {
    var url = 'http://sihk.hutamakarya.com/apiabsen/smartParking/getParking.php';

    let postdata = new FormData();
    postdata.append('user_nopol_kendaraan', userNopol);
    postdata.append('parking_status', "Proses");

    return this.httpClient.post(url, postdata);
  }

  public SaveParking(userData: UserData): Observable<any> {
    var url = 'http://sihk.hutamakarya.com/apiabsen/smartParking/saveParking.php';
    var date = new Date();

    let postdata = new FormData();
    postdata.append('parking_user_id', userData.user_id);
    postdata.append('parking_park_lot_id', this.parkLotData.park_lot_id);
    postdata.append('parking_waktu_masuk', this.datePipe.transform(date, 'yyyy-MM-dd HH:mm'));
    postdata.append('parking_waktu_keluar', "");
    postdata.append('parking_biaya', "");
    postdata.append('parking_jenis_pembayaran', "");
    postdata.append('parking_status', "Proses");

    return this.httpClient.post(url, postdata);
  }

  public UpdateParking(parkingId: string, jenisPembayaran: string, parkingBiaya: string): Observable<any> {
    var url = 'http://sihk.hutamakarya.com/apiabsen/smartParking/updateParking.php';
    var date = new Date();

    let postdata = new FormData();
    postdata.append('parking_id', parkingId);
    postdata.append('parking_waktu_keluar', this.datePipe.transform(date, 'yyyy-MM-dd HH:mm'));
    postdata.append('parking_biaya', parkingBiaya);
    postdata.append('parking_jenis_pembayaran', jenisPembayaran);
    postdata.append('parking_status', "Close");

    return this.httpClient.post(url, postdata);
  }

  public GetUserSaldo(userNopol: string) {
    var url = 'http://sihk.hutamakarya.com/apiabsen/smartParking/getSaldo.php';

    let postdata = new FormData();
    postdata.append('user_nopol_kendaraan', userNopol);

    var data: any = this.httpClient.post(url, postdata);
    data.subscribe(data => {
      var dataError = data.error.toString();
      if (dataError == "false") {
        var userDataFromDb = data.result.find(x => x);

        this.userData.user_saldo_member = userDataFromDb.user_saldo_member;
      }
      else {
        this.loadingController.dismiss();
        this.PresentToast("Gagal mengambil data saldo");
      }
    });
  }

  public KurangiSaldoUser(saldoBaru: number, userNopol: string) {
    var url = 'http://sihk.hutamakarya.com/apiabsen/smartParking/kurangiSaldo.php';

    let postdata = new FormData();
    postdata.append('user_nopol_kendaraan', userNopol);
    postdata.append('saldoBaru', saldoBaru.toString());

    var data: any = this.httpClient.post(url, postdata);
    data.subscribe(data => {
      var dataError = data.error.toString();
      if (dataError == "false") {
        var userDataFromDb = data.result.find(x => x);
        this.userData.user_saldo_member = userDataFromDb.user_saldo_member;
      }
    });
  }

  public CreateParkLotAccount(parkLotData: ParkLotData): Observable<any> {
    var url = 'http://sihk.hutamakarya.com/apiabsen/smartParking/saveParkLotAkun.php';

    let postdata = new FormData();
    postdata.append('park_lot_login_code', parkLotData.park_lot_login_code);
    postdata.append('park_lot_password', parkLotData.park_lot_password);
    postdata.append('park_lot_nama', parkLotData.park_lot_login_code);
    postdata.append('park_lot_alamat', parkLotData.park_lot_alamat);
    postdata.append('park_lot_biaya_motor', parkLotData.park_lot_biaya_motor);
    postdata.append('park_lot_biaya_mobil', parkLotData.park_lot_biaya_mobil);

    return this.httpClient.post(url, postdata);
  }

  public GetDateWithDateParam(dateParam): DateData {
    var dateData = new DateData();
    var months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    var days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    var date = new Date(dateParam);

    dateData.date = date;
    dateData.decYear = date.getFullYear();
    dateData.szMonth = months[date.getMonth()];
    dateData.decMonth = date.getMonth() + 1;
    dateData.decDate = date.getDate();
    dateData.szDay = days[date.getDay()];
    dateData.decMinute = date.getMinutes();
    dateData.szMinute = dateData.decMinute < 10 ? "0" + dateData.decMinute : dateData.decMinute.toString();
    dateData.decHour = date.getHours();
    dateData.szHour = dateData.decHour < 10 ? "0" + dateData.decHour : dateData.decHour.toString();
    dateData.decSec = date.getSeconds();
    dateData.szAMPM = dateData.decHour > 12 ? "PM" : "AM";

    return dateData;
  }

  async PresentLoading() {
    await this.loading.present();
  }

  async PresentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: "dark",
      mode: "ios"
    });
    toast.present();
  }

  PresentAlert(msg: string) {
    this.alertController.create({
      mode: 'ios',
      message: msg,
      buttons: ['OK']
    }).then(alert => {
      return alert.present();
    });
  }
}

export class UserData {
  public user_id: string;
  public user_password: string;
  public user_name: string;
  public user_saldo_member: string;
  public user_telp: string;
  public user_tipe_kendaraan: string;
  public user_nopol_kendaraan: string;
  public user_status: string;
  public statusParkingCrOrUp: string;

  constructor() { }
}

export class ParkLotData {
  public park_lot_id: string;
  public park_lot_nama: string;
  public park_lot_biaya_motor: string;
  public park_lot_biaya_mobil: string;
  public park_lot_alamat: string;
  public park_lot_login_code: string;
  public park_lot_password: string;

  constructor() { }
}

export class ParkingData {
  public parking_id: string;
  public parking_user_id: string;
  public parking_user_name: string;
  public parking_user_nopol_kendaraan: string;
  public parking_user_saldo_member: string;
  public parking_park_lot_id: string;
  public parking_park_lot_name: string;
  public parking_park_lot_biaya_motor: string;
  public parking_park_lot_biaya_mobil: string;
  public parking_waktu_masuk: string;
  public parking_waktu_keluar: string;
  public parking_biaya: string;
  public parking_jenis_pembayaran: string;
  public parking_status: string;

  constructor() { }
}

export class DateData {
  public date: Date;
  public szDay: string;
  public decDate: number;
  public szMonth: string;
  public decYear: number;
  public decHour: number;
  public szHour: string;
  public decMinute: number;
  public szMinute: string;
  public szAMPM: string;
  public decSec: number;
  public decMonth: number;

  constructor() { }
}