import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-top-up',
  templateUrl: './top-up.page.html',
  styleUrls: ['./top-up.page.scss'],
})
export class TopUpPage implements OnInit {

  userSaldo: string;
  totalTopUp: string;
  loading: any;

  constructor() {
  }

  ngOnInit() {
  }
}
