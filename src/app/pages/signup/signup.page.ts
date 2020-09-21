import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { GlobalService, ParkLotData } from 'src/app/services/global.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  public txtParkLotCode: string;
  public txtPassword: string;
  public txtConfirmPassword: string;
  public txtNama: string;
  public txtAlamat: string;
  public txtBiayaMotor: string;
  public txtBiayaMobil: string;
  public isDisabled = true;
  loading: any;

  constructor(private loadingController: LoadingController,
    private globalService: GlobalService,
    private router: Router) {
    this.InitializeLoadingCtrl();
  }

  async InitializeLoadingCtrl() {
    this.loading = await this.loadingController.create({
      mode: 'ios'
    });
  }

  ngOnInit() {
  }

  public OnChangeParkLotCode() {
    this.ValidateForButton();
  }

  public OnChangePassword() {
    this.ValidateForButton();
  }

  public OnChangeConfirmPassword() {
    this.ValidateForButton();
  }

  public OnChangeNama() {
    this.ValidateForButton();
  }

  public OnChangeAlamat() {
    this.ValidateForButton();
  }

  public OnChangeBiayaMotor() {
    this.ValidateForButton();
  }

  public OnChangeBiayaMobil() {
    this.ValidateForButton();
  }

  public Create() {
    try {
      if (this.ValidateForButton()) {
        this.PresentLoading();
        this.ValidatePassword();
        var parkLotData = this.MappingParkLotData();
        var data = this.globalService.CreateParkLotAccount(parkLotData);
        this.SubscribeCreateParkLotAccount(data);
      }
    } catch (e) {
      this.loadingController.dismiss();
      this.globalService.PresentToast(e.message);
    }
  }

  private ValidateForButton(): boolean {
    if (this.txtParkLotCode && this.txtPassword && this.txtConfirmPassword && this.txtNama && this.txtAlamat && this.txtBiayaMotor && this.txtBiayaMobil) {
      this.isDisabled = false;
      return true;
    }
    else {
      this.isDisabled = true;
      return false;
    }
  }

  private ValidatePassword() {
    if (this.txtPassword != this.txtConfirmPassword)
      throw new Error("Confirm password does not match");
  }

  private MappingParkLotData(): ParkLotData {
    var parkLotData = new ParkLotData();
    parkLotData.park_lot_login_code = this.txtParkLotCode;
    parkLotData.park_lot_password = this.txtPassword;
    parkLotData.park_lot_nama = this.txtNama;
    parkLotData.park_lot_alamat = this.txtAlamat;
    parkLotData.park_lot_biaya_motor = this.txtBiayaMotor;
    parkLotData.park_lot_biaya_mobil = this.txtBiayaMobil;

    return parkLotData;
  }

  private SubscribeCreateParkLotAccount(data: Observable<any>) {
    data.subscribe(data => {
      var dataError = data.error.toString();
      if (dataError == "false") {
        this.loadingController.dismiss();
        this.globalService.PresentToast("Berhasil melakukan create akun area parkir");
        this.router.navigate(['login']);
      }
      else {
        this.loadingController.dismiss();
        this.globalService.PresentToast(data.error_msg);
      }
    });
  }

  async PresentLoading() {
    await this.loading.present();
  }
}
