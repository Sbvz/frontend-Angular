import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent {

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  logout() {

    this.auth.logout().then(() => {
      this.router.navigate(['/login']);
    });

  }

}