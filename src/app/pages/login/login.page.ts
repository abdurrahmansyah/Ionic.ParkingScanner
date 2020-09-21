import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  szParkLotCodeLogin: string;
  szPassword: string;

  constructor(private router: Router, private globalService: GlobalService) { }

  ngOnInit() {
  }

  public navigateToHome() {
    this.router.navigate(['home']);
  }

  public Login() {
    this.globalService.LoginParkLot(this.szParkLotCodeLogin, this.szPassword);
  }

  public CreateNewParkLotAccount(){
    this.router.navigate(['signUp']);
  }
}
