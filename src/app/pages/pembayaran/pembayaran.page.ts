import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController, LoadingController } from '@ionic/angular';
import { GlobalService } from 'src/app/services/global.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-pembayaran',
  templateUrl: './pembayaran.page.html',
  styleUrls: ['./pembayaran.page.scss'],
})
export class PembayaranPage implements OnInit {

  @Input() parkingId: string;
  @Input() parkingUserName: string;
  @Input() parkingUserNopol: string;
  @Input() parkingUserSaldoMember: string;
  @Input() parkingJamMasuk: string;
  @Input() parkingBiaya: string;

  public txtNopolKendaraan: string;
  public txtNama: string;
  public txtSaldo: string;
  public txtJamMasuk: string;
  public txtBiaya: string;
  public jenisPembayaran: string;
  private loading: any;

  constructor(private modalCtrl: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private globalService: GlobalService) {
    this.InitializeLoadingCtrl();
  }

  async InitializeLoadingCtrl() {
    this.loading = await this.loadingController.create({
      mode: 'ios'
    });
  }

  ngOnInit() {
    this.txtNopolKendaraan = this.parkingUserNopol;
    this.txtNama = this.parkingUserName;
    this.txtSaldo = "Rp " + this.parkingUserSaldoMember.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    this.txtJamMasuk = this.parkingJamMasuk;
    this.txtBiaya = "Rp " + this.parkingBiaya.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  public Confirm() {
    try {
      this.ValidatePayment();
      this.UpdateParking();
      if (this.jenisPembayaran == "Saldo eWallet"){
        this.KurangiSaldoUser();
      }
    } catch (e) {
      this.alertController.create({
        mode: 'ios',
        message: e.message,
        buttons: ['OK']
      }).then(alert => {
        return alert.present();
      });
    }
  }

  private ValidatePayment() {
    if (!this.jenisPembayaran) {
      throw new Error("Jenis Pembayaran wajib diisi.");
    }

    if (this.jenisPembayaran == "Saldo eWallet" && this.parkingUserSaldoMember < this.parkingBiaya){
      throw new Error("Saldo member tidak cukup")
    }
  }

  private UpdateParking() {
    this.PresentLoading();
    var dataUpdateParking = this.globalService.UpdateParking(this.parkingId, this.jenisPembayaran, this.parkingBiaya);
    this.SubscribeUpdateParking(dataUpdateParking);
  }

  private async SubscribeUpdateParking(dataUpdateParking: Observable<any>) {
    dataUpdateParking.subscribe(data => {
      var dataError = data.error.toString();
      this.Cancel();
      this.loadingController.dismiss();

      if (dataError == "false")
        this.globalService.PresentToast("Berhasil melakukan update parking")
      else
        this.globalService.PresentToast("Gagal melakukan update parking")
    });
  }

  private KurangiSaldoUser(){
    var saldoBaru = +this.parkingUserSaldoMember - +this.parkingBiaya;
    this.globalService.KurangiSaldoUser(saldoBaru, this.parkingUserNopol);
  }

  public Cancel() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  async PresentLoading() {
    await this.loading.present();
  }
}
